import React, { useState, useEffect } from 'react';
import { Upload, AlertCircle, Activity, Eye, Download } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import { useNavigate } from 'react-router-dom';
import { generateContent } from '../lib/gemini';
import { useLanguageStore } from '../store/languageStore';

const Diagnosis = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { translate } = useLanguageStore();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [prediction, setPrediction] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [patientInfo, setPatientInfo] = useState<{ full_name?: string; email?: string } | null>(null);
  const [medicalHistory, setMedicalHistory] = useState<{
    existing_conditions?: string;
    chronic_diseases?: string;
    previous_eye_conditions?: string;
  } | null>(null);
  const [patientSummary, setPatientSummary] = useState<string | null>(null);
  const [doctorReportContent, setDoctorReportContent] = useState<string | null>(null);
  const [isGeneratingDoctorReport, setIsGeneratingDoctorReport] = useState(false);
  const [isGeneratingPatientReport, setIsGeneratingPatientReport] = useState(false);
  const [showPatientReport, setShowPatientReport] = useState(false);
  const [showDoctorReportPanel, setShowDoctorReportPanel] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file');
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB');
        return;
      }
      setSelectedFile(file);
      setError(null);
    }
  };

  // Fix: Remove unused parameter 'imageUrl' from analyzeScan
  const analyzeScan = async () => {
    try {
      setIsAnalyzing(true);
      const formData = new FormData();
      formData.append('file', selectedFile as File);
      const response = await fetch('https://vvs-dkhchtbpd9gkbhcn.polandcentral-01.azurewebsites.net/predict', {
        method: 'POST',
        body: formData
      });
      if (!response.ok) {
        throw new Error('Failed to analyze image');
      }
      const result = await response.json();
      setPrediction(result);
      return result;
    } catch (err) {
      console.error('Error analyzing image:', err);
      throw err;
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getSeverityLevel = (confidence: number) => {
    if (confidence > 0.8) return 'High';
    if (confidence > 0.5) return 'Medium';
    return 'Low';
  };

  const handleDiagnose = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedFile || !user) return;

    try {
      setIsUploading(true);
      setError(null);

      // Upload image to Supabase Storage
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('octscans')
        .upload(filePath, selectedFile, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) throw uploadError;

      // Get the public URL for the uploaded image
      const { data: { publicUrl } } = supabase.storage
        .from('octscans')
        .getPublicUrl(filePath);

      // Save record in oct_images table
      const { data: imageData, error: dbError } = await supabase
        .from('oct_images')
        .insert([
          {
            user_id: user.id,
            image_path: publicUrl,
            image_quality: 'pending',
            segmentation_result: null,
          },
        ])
        .select()
        .single();

      if (dbError) throw dbError;

      // Analyze the image
      const analysisResult = await analyzeScan();

      // Fix: Type assertion for Math.max(...Object.values(...))
      const maxProb = Math.max(...Object.values(analysisResult.probabilities).map(Number));

      // Save prediction results
      const { data: predictionData, error: predictionError } = await supabase
        .from('disease_predictions')
        .insert([
          {
            image_id: imageData.id,
            disease_type: analysisResult.prediction,
            confidence_score: maxProb,
            severity_level: getSeverityLevel(maxProb),
            prediction_date: new Date().toISOString()
          }
        ])
        .select()
        .single();

      if (predictionError) throw predictionError;

      // Calculate follow-up date (15 days from now)
      const followUpDate = new Date();
      followUpDate.setDate(followUpDate.getDate() + 15);

      // Create health report
      const { error: reportError } = await supabase
        .from('health_reports')
        .insert([
          {
            user_id: user.id,
            prediction_id: predictionData.id,
            follow_up_date: followUpDate.toISOString().split('T')[0],
            report_date: new Date().toISOString(),
            severity_status: getSeverityLevel(maxProb),
            requires_immediate_attention: maxProb > 0.8
          }
        ]);

      if (reportError) throw reportError;

      // Set prediction for UI update
      setPrediction(analysisResult);

      // Reset form and show success
      setUploadProgress(100);
      setTimeout(() => {
        setUploadProgress(0);
        setIsUploading(false);
      }, 1500);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process image');
      setIsUploading(false);
    }
  };

  const downloadReport = async () => {
    try {
      const { data, error } = await supabase
        .from('health_reports')
        .select('doctor_report')
        .eq('user_id', user?.id)
        .order('report_date', { ascending: false })
        .limit(1)
        .single();

      if (error) throw error;
      if (!data) {
        setError('No report found.');
        return;
      }

      const fileContent = `Doctor Report:\n${data.doctor_report || 'N/A'}`;
      const blob = new Blob([fileContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = 'oct-diagnosis-report.txt';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to download report');
    }
  };

  const renderPredictionResults = () => {
    if (!prediction) return null;

    return (
      <div className="mt-8 bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Analysis Results</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-gray-700">Predicted Condition:</span>
            <span className="font-semibold text-blue-600">{prediction.prediction}</span>
          </div>
          <div className="space-y-2">
            <h3 className="font-medium text-gray-700">Confidence Scores:</h3>
            {Object.entries(prediction.probabilities).map(([condition, score]) => (
              <div key={condition} className="flex items-center space-x-2">
                <span className="w-24 text-gray-600">{condition}:</span>
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${(score as number) * 100}%` }}
                  ></div>
                </div>
                <span className="text-sm text-gray-600">
                  {((score as number) * 100).toFixed(1)}%
                </span>
              </div>
            ))}
          </div>
          <div className="mt-6 flex flex-row space-x-3">
            <button
              onClick={generatePatientSummary}
              className="flex-1 flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-base"
              disabled={isGeneratingPatientReport}
            >
              {isGeneratingPatientReport ? (
                <>
                  <Activity className="animate-spin w-5 h-5 mr-2" />
                  Generating...
                </>
              ) : (
                <>
                  <Eye className="w-5 h-5 mr-2" />
                  Patient Report
                </>
              )}
            </button>
            <button
              onClick={downloadReport}
              className="flex-1 flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-base"
            >
              <Download className="w-5 h-5 mr-2" />
              Download
            </button>
            <button
              onClick={handleGenerateDoctorReport}
              className="flex-1 flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-base"
              disabled={isGeneratingDoctorReport}
            >
              {isGeneratingDoctorReport ? (
                <>
                  <Activity className="animate-spin w-5 h-5 mr-2" />
                  Generating...
                </>
              ) : (
                <>
                  <Eye className="w-5 h-5 mr-2" />
                  Doctor Report
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  };

  const generatePatientSummary = async () => {
    if (!prediction || !patientInfo || !medicalHistory) {
      setPatientSummary('Insufficient data to generate summary.');
      return;
    }
    setIsGeneratingPatientReport(true);
    try {
      // Build Patient Info section dynamically, omitting any missing or 'N/A' fields
      const patientInfoFields: { label: string; value?: string }[] = [
        { label: 'Full Name', value: patientInfo.full_name },
        { label: 'Email', value: patientInfo.email },
      ];
      const patientInfoSection = patientInfoFields
        .filter(f => f.value && f.value !== 'N/A')
        .map(f => `${f.label}: ${f.value}`)
        .join('\n');

      const maxProb = Math.max(...Object.values(prediction.probabilities).map(Number));
      // Fallback summary if Gemini is unavailable
      let summary = '';
      try {
        const summaryPrompt = `You are a medical assistant. Write a clear, friendly summary for a patient based on the following information. Avoid medical jargon.\n\nDiagnosis: ${prediction.prediction}\nConfidence: ${(maxProb * 100).toFixed(1)}%\nSeverity: ${getSeverityLevel(maxProb)}\n\nExplain what this means for the patient, what they should do next, and offer reassurance if the severity is low. Do not include any doctor or hospital details.`;
        summary = await generateContent(summaryPrompt);
      } catch {
        summary = `Your scan result is: ${prediction.prediction}.\nConfidence: ${(maxProb * 100).toFixed(1)}%.\nSeverity: ${getSeverityLevel(maxProb)}.\nPlease consult your eye doctor for more information and next steps.`;
      }

      const patientReportContent = `PATIENT REPORT\n\nPatient Info\n${patientInfoSection}\n\nVisit Date: ${new Date().toLocaleDateString()}\n\nDiagnosis\n${prediction.prediction}\n\nSummary\n${summary?.trim() || 'Summary not available.'}`;
      setPatientSummary(patientReportContent);
      setShowPatientReport(true);

      // Save patient report to health_reports
      if (user && user.id) {
        const { data: report, error: fetchError } = await supabase
          .from('health_reports')
          .select('id')
          .eq('user_id', user.id)
          .order('report_date', { ascending: false })
          .limit(1)
          .single();
        if (fetchError || !report) throw fetchError || new Error('No health report found.');
        const { error: updateError } = await supabase
          .from('health_reports')
          .update({ patient_report: patientReportContent })
          .eq('id', report.id);
        if (updateError) throw updateError;
      }
    } catch (err) {
      setPatientSummary('Failed to generate summary.');
      setError(err instanceof Error ? err.message : 'Failed to save patient summary');
    } finally {
      setIsGeneratingPatientReport(false);
    }
  };

  const handleGenerateDoctorReport = async () => {
    if (!prediction || !patientInfo || !medicalHistory) return;
    setIsGeneratingDoctorReport(true);
    try {
      const maxProb = Math.max(...Object.values(prediction.probabilities).map(Number));
      // Build Patient Info section dynamically, omitting any missing or 'N/A' fields
      const patientInfoFields: { label: string; value?: string }[] = [
        { label: 'Full Name', value: patientInfo.full_name },
        { label: 'Email', value: patientInfo.email },
      ];
      const patientInfoSection = patientInfoFields
        .filter(f => f.value && f.value !== 'N/A')
        .map(f => `${f.label}: ${f.value}`)
        .join('\n');

      const assessment = `${patientInfo.full_name ? `Ms. ${patientInfo.full_name}` : 'The patient'} presented for an ophthalmic evaluation. Medical history includes: Existing Conditions: ${medicalHistory.existing_conditions || 'None'}, Chronic Diseases: ${medicalHistory.chronic_diseases || 'None'}, Previous Eye Conditions: ${medicalHistory.previous_eye_conditions || 'None'}. The OCT scan was reviewed in detail. The retina and macula were examined for abnormalities, and the scan quality was sufficient for diagnostic purposes. Based on the analysis, the main finding is: ${prediction.prediction}.`;
      const diagnosis = `Diagnosis is ${prediction.prediction} with a confidence of ${(maxProb * 100).toFixed(1)}%. Severity is assessed as ${getSeverityLevel(maxProb)}. The scan indicates ${getSeverityLevel(maxProb) === 'Low' ? 'no significant pathological changes or urgent concerns at this time.' : 'findings that may require further evaluation and follow-up.'}`;
      const reportContent = `MEDICAL REPORT\n\nPatient Info\n${patientInfoSection}\n\nVisit Date: ${new Date().toLocaleDateString()}\n\nAssessment\n${assessment}\n\nDiagnosis\n${diagnosis}\n\nPrescription\n${getSeverityLevel(maxProb) === 'Low' ? 'No prescription is necessary at this time, as the patient is in good health with no identified medical concerns.' : 'Please follow up with your ophthalmologist for further evaluation and management.'}`;
      setDoctorReportContent(reportContent);
      setShowDoctorReportPanel(true);

      // Update the latest health report with the doctor's report
      if (user && user.id) {
        // 1. Get the latest health report for this user
        const { data: report, error: fetchError } = await supabase
          .from('health_reports')
          .select('id')
          .eq('user_id', user.id)
          .order('report_date', { ascending: false })
          .limit(1)
          .single();

        if (fetchError || !report) throw fetchError || new Error('No health report found.');

        // 2. Update that report by id
        const { error: updateError } = await supabase
          .from('health_reports')
          .update({ doctor_report: reportContent })
          .eq('id', report.id);

        if (updateError) throw updateError;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate or save doctor report');
    } finally {
      setIsGeneratingDoctorReport(false);
    }
  };

  useEffect(() => {
    const fetchPatientData = async () => {
      // Fix: Add null check for user before using user.id
      if (!user || !user.id) throw new Error('User not found.');

      // Fetch patient info
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single();
      if (profileError) {
        setError('Failed to fetch profile: ' + profileError.message);
        setPatientInfo(null);
      } else {
        setPatientInfo(profile);
      }

      // Fetch medical history
      const { data: history, error: historyError } = await supabase
        .from('medical_histories')
        .select('existing_conditions, chronic_diseases, previous_eye_conditions')
        .eq('user_id', user.id)
        .single();
      if (historyError) {
        setError('Failed to fetch medical history: ' + historyError.message);
        setMedicalHistory(null);
      } else {
        setMedicalHistory(history);
      }
    };

    if (prediction) fetchPatientData();
  }, [prediction, user]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">OCT Scan Analysis</h1>

      <div className="max-w-2xl mx-auto">
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-md p-4 flex items-start">
            <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 mr-2" />
            <p className="text-red-700">{error}</p>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <form onSubmit={handleDiagnose}>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <input
                type="file"
                id="scan-upload"
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
              />
              <label
                htmlFor="scan-upload"
                className="cursor-pointer flex flex-col items-center"
              >
                <Upload className="h-12 w-12 text-gray-400 mb-4" />
                <span className="text-gray-600 mb-2">
                  {selectedFile ? selectedFile.name : 'Upload your OCT scan'}
                </span>
                <span className="text-sm text-gray-500">
                  Click to select or drag and drop
                </span>
              </label>
            </div>

            {(isUploading || isAnalyzing) && (
              <div className="mt-4">
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-600 mt-2 text-center">
                  {isUploading ? `Uploading... ${uploadProgress}%` : 'Analyzing scan...'}
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={!selectedFile || isUploading || isAnalyzing}
              className="mt-6 w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isAnalyzing ? (
                <>
                  <Activity className="animate-spin h-5 w-5 mr-2" />
                  Analyzing...
                </>
              ) : isUploading ? (
                'Uploading...'
              ) : (
                'Upload and Analyze'
              )}
            </button>
          </form>
        </div>

        {renderPredictionResults()}

        {showDoctorReportPanel && prediction && (
          <div className="bg-white rounded-lg shadow-md p-6 mt-4 relative">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-red-600 text-3xl font-bold focus:outline-none transition-colors duration-150"
              onClick={() => setShowDoctorReportPanel(false)}
              aria-label="Close doctor report"
              style={{ lineHeight: 1 }}
            >
              &times;
            </button>
            <h2 className="text-xl font-bold mb-2">Doctor Report</h2>
            <pre className="whitespace-pre-wrap text-gray-800">{doctorReportContent}</pre>
          </div>
        )}

        {showPatientReport && prediction && patientSummary && (
          <div className="bg-white rounded-lg shadow-md p-6 mt-4 relative">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-red-600 text-3xl font-bold focus:outline-none transition-colors duration-150"
              onClick={() => setShowPatientReport(false)}
              aria-label="Close patient report"
              style={{ lineHeight: 1 }}
            >
              &times;
            </button>
            <h2 className="text-xl font-bold mb-2">Patient Report</h2>
            <div className="mb-2">
              <span className="font-semibold">Patient Name:</span> {patientInfo?.full_name || 'N/A'}
            </div>
            <div className="mb-2">
              <span className="font-semibold">Diagnosis:</span> {prediction.prediction}
            </div>
            <div className="mb-2">
              <span className="font-semibold">How sure are we?</span> {((Math.max(...Object.values(prediction.probabilities).map(Number)) * 100).toFixed(1))}%
            </div>
            <div className="mb-2">
              <span className="font-semibold">Severity:</span> {getSeverityLevel(Math.max(...Object.values(prediction.probabilities).map(Number)))}
            </div>
            <div className="mb-2">
              <span className="font-semibold">Summary:</span>
              <div className="ml-4 text-gray-700 whitespace-pre-wrap">{patientSummary}</div>
            </div>
            <div className="mb-2">
              <span className="font-semibold">Date:</span> {new Date().toLocaleDateString()}
            </div>
          </div>
        )}

        {!prediction && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Doctor's Report</h2>
              <p className="text-gray-600">
                Detailed medical analysis will appear here after processing the scan.
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Patient's Report</h2>
              <p className="text-gray-600">
                {patientSummary || "A simplified, easy-to-understand report will appear here after processing the scan."}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Diagnosis;