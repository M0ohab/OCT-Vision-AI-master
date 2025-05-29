import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import { Calendar, Download, Eye, TrendingUp, Clock, AlertCircle, Save, Trash, X } from 'lucide-react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const conditionOptions = [
  "Diabetes",
  "Hypertension",
  "High Cholesterol",
  "Asthma"
];
const chronicDiseaseOptions = [
  "Heart Disease",
  "Kidney Disease",
  "Liver Disease",
  "Cancer"
];
const eyeConditionOptions = [
  "Glaucoma",
  "Cataract",
  "Macular Degeneration",
  "Diabetic Retinopathy"
];
const ocularSurgeryOptions = [
  "Cataract Surgery",
  "LASIK",
  "Retinal Detachment Repair",
  "Glaucoma Surgery"
];

const familyHistoryOptions = [
  "Glaucoma",
  "Macular Degeneration",
  "Diabetic Retinopathy",
  "Retinitis Pigmentosa"
];

const Dashboard = () => {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [scanSuccess, setScanSuccess] = useState<string | null>(null);
  const [octImages, setOctImages] = useState([]);
  const [predictions, setPredictions] = useState([]);
  const [medicalHistory, setMedicalHistory] = useState({
    existing_conditions: '',
    chronic_diseases: '',
    previous_eye_conditions: '',
    last_checkup_date: '',
  });
  const [selectedScans, setSelectedScans] = useState({ scan1: null, scan2: null });
  const [healthReports, setHealthReports] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [customCondition, setCustomCondition] = useState('');
  const [customChronic, setCustomChronic] = useState('');
  const [customEye, setCustomEye] = useState('');
  const [customOcularSurgery, setCustomOcularSurgery] = useState('');
  const [customFamilyHistory, setCustomFamilyHistory] = useState('');
  const [reportModal, setReportModal] = useState({ open: false, content: '' });

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch OCT images
      const { data: images, error: imagesError } = await supabase
        .from('oct_images')
        .select('*')
        .order('upload_date', { ascending: false });

      if (imagesError) throw imagesError;
      setOctImages(images || []);

      // Fetch predictions
      const { data: diseaseData, error: predictionsError } = await supabase
        .from('disease_predictions')
        .select(`
          *,
          oct_images (*)
        `)
        .order('prediction_date', { ascending: false });

      if (predictionsError) throw predictionsError;
      setPredictions(diseaseData || []);

      // Fetch medical history
      const { data: history, error: historyError } = await supabase
        .from('medical_histories')
        .select('*')
        .limit(1);

      if (historyError) throw historyError;
      if (history && history.length > 0) {
        setMedicalHistory({
          existing_conditions: history[0].existing_conditions || '',
          chronic_diseases: history[0].chronic_diseases || '',
          previous_eye_conditions: history[0].previous_eye_conditions || '',
          last_checkup_date: history[0].last_checkup_date || '',
        });
      }

      // Fetch health reports
      const { data: reports, error: reportsError } = await supabase
        .from('health_reports')
        .select('*')
        .order('report_date', { ascending: false });

      if (reportsError) throw reportsError;
      setHealthReports(reports || []);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Existing Conditions
    if (
      medicalHistory.existing_conditions &&
      !conditionOptions.includes(medicalHistory.existing_conditions)
    ) {
      setCustomCondition(medicalHistory.existing_conditions);
    } else {
      setCustomCondition('');
    }
    // Chronic Diseases
    if (
      medicalHistory.chronic_diseases &&
      !chronicDiseaseOptions.includes(medicalHistory.chronic_diseases)
    ) {
      setCustomChronic(medicalHistory.chronic_diseases);
    } else {
      setCustomChronic('');
    }
    // Previous Eye Conditions
    if (
      medicalHistory.previous_eye_conditions &&
      !eyeConditionOptions.includes(medicalHistory.previous_eye_conditions)
    ) {
      setCustomEye(medicalHistory.previous_eye_conditions);
    } else {
      setCustomEye('');
    }
    // Previous Ocular Surgeries
    if (
      medicalHistory.previous_ocular_surgeries &&
      !ocularSurgeryOptions.includes(medicalHistory.previous_ocular_surgeries)
    ) {
      setCustomOcularSurgery(medicalHistory.previous_ocular_surgeries);
    } else {
      setCustomOcularSurgery('');
    }
    // Family History with Eye Diseases
    if (
      medicalHistory.family_history_eye_diseases &&
      !familyHistoryOptions.includes(medicalHistory.family_history_eye_diseases)
    ) {
      setCustomFamilyHistory(medicalHistory.family_history_eye_diseases);
    } else {
      setCustomFamilyHistory('');
    }
    // eslint-disable-next-line
  }, [isEditing]);

  const handleMedicalHistoryChange = (field: string, value: string) => {
    setMedicalHistory(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const saveMedicalHistory = async () => {
    try {
      setSaving(true);

      const { data: existingHistory } = await supabase
        .from('medical_histories')
        .select('id')
        .limit(1);

      let result;

      const existing_conditions =
        medicalHistory.existing_conditions === 'Other'
          ? customCondition
          : medicalHistory.existing_conditions;
      const chronic_diseases =
        medicalHistory.chronic_diseases === 'Other'
          ? customChronic
          : medicalHistory.chronic_diseases;
      const previous_eye_conditions =
        medicalHistory.previous_eye_conditions === 'Other'
          ? customEye
          : medicalHistory.previous_eye_conditions;
      const previous_ocular_surgeries =
        medicalHistory.previous_ocular_surgeries === 'Other'
          ? customOcularSurgery
          : medicalHistory.previous_ocular_surgeries;
      const family_history_eye_diseases =
        medicalHistory.family_history_eye_diseases === 'Other'
          ? customFamilyHistory
          : medicalHistory.family_history_eye_diseases;

      if (existingHistory && existingHistory.length > 0) {
        // Update existing record
        result = await supabase
          .from('medical_histories')
          .update({
            existing_conditions,
            chronic_diseases,
            previous_eye_conditions,
            last_checkup_date: medicalHistory.last_checkup_date,
            previous_ocular_surgeries,
            family_history_eye_diseases,
          })
          .eq('id', existingHistory[0].id);
      } else {
        // Insert new record
        result = await supabase
          .from('medical_histories')
          .insert([{
            user_id: user?.id,
            existing_conditions,
            chronic_diseases,
            previous_eye_conditions,
            last_checkup_date: medicalHistory.last_checkup_date,
            previous_ocular_surgeries,
            family_history_eye_diseases,
          }]);
      }

      if (result.error) throw result.error;

      // Update local state so the custom value is shown after saving
      setMedicalHistory(prev => ({
        ...prev,
        existing_conditions:
          prev.existing_conditions === 'Other' ? customCondition : prev.existing_conditions,
        chronic_diseases:
          prev.chronic_diseases === 'Other' ? customChronic : prev.chronic_diseases,
        previous_eye_conditions:
          prev.previous_eye_conditions === 'Other' ? customEye : prev.previous_eye_conditions,
      }));

      setIsEditing(false);
      setSuccess('Medical history saved successfully!');
    } catch (err) {
      setError('Failed to save medical history. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteScan = async (scanId: string) => {
    if (!window.confirm('Are you sure you want to delete this scan?')) return;
    try {
      setLoading(true);
      setError(null);
      setScanSuccess(null);

      // First, get the image data to extract the file path for storage deletion
      const { data: imageData, error: fetchError } = await supabase
        .from('oct_images')
        .select('image_path')
        .eq('id', scanId)
        .single();

      if (fetchError) throw fetchError;

      // Delete related health reports first (due to foreign key constraints)
      const { data: predictionIds, error: fetchPredictionIdsError } = await supabase
        .from('disease_predictions')
        .select('id')
        .eq('image_id', scanId);

      if (fetchPredictionIdsError) throw fetchPredictionIdsError;

      const idsToDelete = predictionIds.map(p => p.id);

      let healthReportsError = null; // Declare healthReportsError here

      if (idsToDelete.length > 0) {
        const { error } = await supabase
          .from('health_reports')
          .delete()
          .in('prediction_id', idsToDelete);
        healthReportsError = error;

        if (healthReportsError) throw healthReportsError;
      }

      if (healthReportsError) throw healthReportsError;

      // Delete disease predictions
      const { error: predictionsError } = await supabase
        .from('disease_predictions')
        .delete()
        .eq('image_id', scanId);

      if (predictionsError) throw predictionsError;

      // Delete from storage bucket
      if (imageData?.image_path) {
        // Extract the file path from the full URL
        const url = new URL(imageData.image_path);
        const pathParts = url.pathname.split('/');
        // The path should be in format: /storage/v1/object/public/octscans/{user_id}/{filename}
        const filePath = pathParts.slice(5).join('/'); // Remove '/storage/v1/object/public/octscans/'

        const { error: storageError } = await supabase.storage
          .from('octscans')
          .remove([filePath]);

        if (storageError) {
          console.warn('Failed to delete from storage:', storageError);
          // Don't throw here as the database deletion is more important
        }
      }

      // Finally, delete the oct_images record
      const { error: imageError } = await supabase
        .from('oct_images')
        .delete()
        .eq('id', scanId);

      if (imageError) throw imageError;

      await fetchDashboardData(); // Refresh all dashboard data
      setScanSuccess('Scan and all related data deleted successfully!');
    } catch (err) {
      console.error('Delete scan error:', err);
      setError(`Failed to delete scan: ${err.message || 'Please try again.'}`);
    } finally {
      setLoading(false);
    }
  };

  const getProgressionStatus = () => {
    if (predictions.length < 2) return 'Not enough data';

    const latestPrediction = predictions[0];
    const previousPrediction = predictions[1];

    if (latestPrediction.confidence_score > previousPrediction.confidence_score) {
      return 'Worsening';
    } else if (latestPrediction.confidence_score < previousPrediction.confidence_score) {
      return 'Improving';
    }
    return 'Stable';
  };

  // Helper functions for enhanced patient analysis
  const getEnhancedAnalysis = () => {
    if (predictions.length === 0) {
      return "No OCT scans have been uploaded yet. Please upload a scan to receive a personalized health analysis.";
    }

    const latestPrediction = predictions[0];
    const diseaseType = latestPrediction.disease_type;
    const confidence = latestPrediction.confidence;
    const severity = latestPrediction.severity;
    const status = getProgressionStatus();

    let analysis = `Based on your ${predictions.length > 1 ? 'scans' : 'scan'}, our analysis indicates `;
    analysis += getSeverityDescription(diseaseType, severity);

    if (predictions.length > 1) {
      analysis += " " + getTrendAnalysis(status, diseaseType);
    }

    analysis += " " + getRecommendation(status, severity, diseaseType);

    return analysis;
  };

  const getSeverityDescription = (diseaseType: string, severity: string) => {
    if (severity === "Mild") {
      return `you have mild signs of ${diseaseType}. This is in the early stage and with proper care, progression can often be slowed or managed effectively.`;
    } else if (severity === "Moderate") {
      return `you have moderate ${diseaseType}. At this stage, the condition requires regular monitoring and treatment to prevent further progression.`;
    } else if (severity === "Severe") {
      return `you have severe ${diseaseType}. This advanced stage requires immediate and ongoing medical attention to manage symptoms and prevent further vision loss.`;
    } else {
      return `signs of ${diseaseType} with uncertain severity. Further evaluation by your ophthalmologist is recommended.`;
    }
  };

  const getTrendAnalysis = (status: string, diseaseType: string) => {
    if (status === "Improving") {
      return "Your condition appears to be improving based on your recent scans. This positive trend suggests that current treatments or lifestyle changes may be effective.";
    } else if (status === "Worsening") {
      return `There are indications that your ${diseaseType} may be progressing. This change warrants closer monitoring and possibly adjusting your treatment plan.`;
    } else {
      return `Your ${diseaseType} appears to be stable. While stability is generally positive, continued monitoring is essential to detect any future changes.`;
    }
  };

  const getRecommendation = (status: string, severity: string, diseaseType: string) => {
    let recommendation = "We recommend ";

    if (status === "Worsening" || severity === "Severe") {
      recommendation += "scheduling an appointment with your ophthalmologist as soon as possible to discuss these findings and potential treatment adjustments.";
    } else if (severity === "Moderate" || status === "Stable") {
      recommendation += "maintaining your regular check-ups with your eye care provider and continuing any prescribed treatments.";
    } else {
      recommendation += "following up with your eye care provider at your next scheduled appointment to review these findings.";
    }

    return recommendation;
  };

  // Remove the duplicate getSeverityDescription function
  // const getSeverityDescription = (severity: string, confidence: number) => {
  //   const confidencePercent = (confidence * 100).toFixed(1);

  //   switch (severity.toLowerCase()) {
  //     case 'mild':
  //       return `mild severity (${confidencePercent}% confidence)`;
  //     case 'moderate':
  //       return `moderate severity (${confidencePercent}% confidence)`;
  //     case 'severe':
  //       return `severe condition (${confidencePercent}% confidence)`;
  //     default:
  //       return `${severity} severity (${confidencePercent}% confidence)`;
  //   }
  // };

  // Remove the duplicate getTrendAnalysis function
  // const getTrendAnalysis = () => {
  //   if (predictions.length < 3) {
  //     // Simple comparison between two points
  //     const status = getProgressionStatus();
  //     const latestPrediction = predictions[0];
  //     const previousPrediction = predictions[1];
  //     const changePercent = Math.abs(((latestPrediction.confidence_score - previousPrediction.confidence_score) / previousPrediction.confidence_score) * 100).toFixed(1);

  //     if (status === 'Worsening') {
  //       return `Your condition appears to be worsening by approximately ${changePercent}% since your previous scan on ${new Date(previousPrediction.prediction_date).toLocaleDateString()}.`;
  //     } else if (status === 'Improving') {
  //       return `Your condition shows improvement of approximately ${changePercent}% since your previous scan on ${new Date(previousPrediction.prediction_date).toLocaleDateString()}.`;
  //     } else {
  //       return `Your condition has remained relatively stable since your previous scan on ${new Date(previousPrediction.prediction_date).toLocaleDateString()}.`;
  //     }
  //   } else {
  //     // More complex trend analysis with 3+ data points
  //     const firstDate = new Date(predictions[predictions.length - 1].prediction_date);
  //     const latestDate = new Date(predictions[0].prediction_date);
  //     const monthsDiff = (latestDate.getFullYear() - firstDate.getFullYear()) * 12 + (latestDate.getMonth() - firstDate.getMonth());

  //     // Calculate if overall trend is improving, worsening or fluctuating
  //     let improving = 0;
  //     let worsening = 0;

  //     for (let i = 0; i < predictions.length - 1; i++) {
  //       if (predictions[i].confidence_score < predictions[i + 1].confidence_score) {
  //         improving++;
  //       } else if (predictions[i].confidence_score > predictions[i + 1].confidence_score) {
  //         worsening++;
  //       }
  //     }

  //     if (improving > worsening && improving > (predictions.length - 1) / 2) {
  //       return `Over the past ${monthsDiff > 0 ? monthsDiff + ' months' : 'period'}, your condition has shown an overall improving trend.`;
  //     } else if (worsening > improving && worsening > (predictions.length - 1) / 2) {
  //       return `Over the past ${monthsDiff > 0 ? monthsDiff + ' months' : 'period'}, your condition has shown an overall worsening trend.`;
  //     } else {
  //       return `Over the past ${monthsDiff > 0 ? monthsDiff + ' months' : 'period'}, your condition has fluctuated with no clear overall trend.`;
  //     }
  //   }
  // };

  // Remove the duplicate getRecommendation function
  // const getRecommendation = (status: string, severity: string) => {
  //   if (status === 'Worsening') {
  //     return severity.toLowerCase() === 'severe' ?
  //       'We strongly recommend scheduling an appointment with your ophthalmologist as soon as possible to discuss treatment options.' :
  //       'We recommend scheduling a follow-up appointment with your ophthalmologist to monitor your condition more closely.';
  //   } else if (status === 'Improving') {
  //     return 'Continue with your current treatment plan and follow up with your ophthalmologist as scheduled.';
  //   } else {
  //     return 'Maintain your regular check-up schedule with your ophthalmologist to monitor your condition.';
  //   }
  // };

  const chartData = {
    labels: predictions.map(p => new Date(p.prediction_date).toLocaleDateString()),
    datasets: [
      // Group predictions by disease type
      ...Array.from(new Set(predictions.map(p => p.disease_type)))
        .map((diseaseType, index) => {
          // Define an array of colors to use for different disease types
          const colors = [
            'rgb(75, 192, 192)',  // teal
            'rgb(255, 99, 132)',  // red
            'rgb(54, 162, 235)',  // blue
            'rgb(255, 206, 86)',  // yellow
            'rgb(153, 102, 255)', // purple
          ];

          return {
            label: `${diseaseType} - Patient Health Status`,
            data: predictions
              .filter(p => p.disease_type === diseaseType)
              .map(p => 1 - p.confidence_score),
            borderColor: colors[index % colors.length],
            backgroundColor: colors[index % colors.length],
            tension: 0.1,
            pointRadius: 5,
            pointHoverRadius: 7,
            // Add tooltip configuration for better data visualization
            tooltip: {
              callbacks: {
                label: function (context) {
                  const prediction = predictions
                    .filter(p => p.disease_type === diseaseType)[context.dataIndex];
                  const healthScore = (1 - prediction.confidence_score) * 100;
                  return `Health Score: ${healthScore.toFixed(1)}% | Severity: ${prediction.severity || 'N/A'}`;
                }
              }
            }
          };
        })
    ]
  };

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  useEffect(() => {
    if (scanSuccess) {
      const timer = setTimeout(() => setScanSuccess(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [scanSuccess]);

  // View report handler
  const viewReport = async (predictionId: string) => {
    const { data, error } = await supabase
      .from('health_reports')
      .select('doctor_report')
      .eq('prediction_id', predictionId)
      .single();

    if (error || !data) {
      alert('Failed to load report.');
      return;
    }

    setReportModal({
      open: true,
      content: `Doctor Report:\n${data.doctor_report || 'N/A'}`
    });
  };

  // Download report handler
  const downloadReport = async (predictionId: string) => {
    const { data, error } = await supabase
      .from('health_reports')
      .select('doctor_report')
      .eq('prediction_id', predictionId)
      .single();

    if (error || !data) {
      alert('Failed to load report.');
      return;
    }

    const fileContent = `Doctor Report:\n${data.doctor_report || 'N/A'}`;
    const blob = new Blob([fileContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'oct-diagnosis-report.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          Error loading dashboard: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Patient Dashboard</h1>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Disease Status</h2>
            <TrendingUp className="h-6 w-6 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{getProgressionStatus()}</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Latest Scan</h2>
            <Eye className="h-6 w-6 text-blue-600" />
          </div>
          <p className="text-gray-600">
            {octImages[0]?.upload_date
              ? new Date(octImages[0].upload_date).toLocaleDateString()
              : 'No scans yet'}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Next Follow-up</h2>
            <Calendar className="h-6 w-6 text-blue-600" />
          </div>
          <p className="text-gray-600">
            {healthReports[0]?.follow_up_date
              ? new Date(healthReports[0].follow_up_date).toLocaleDateString()
              : 'Not scheduled'}
          </p>
        </div>
      </div>

      {/* Medical History */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-800">Medical History</h2>
          <div className="flex gap-2">
            {isEditing ? (
              <button
                onClick={saveMedicalHistory}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                <Save className="h-4 w-4" />
                {saving ? 'Saving...' : 'Save'}
              </button>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                title="Edit Medical History"
              >
                Edit
              </button>
            )}
          </div>
        </div>

        {/* Success Message for Medical History (moved here) */}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-4">
            {success}
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium text-gray-700 mb-2">Existing Conditions</h3>
            {isEditing ? (
              <>
                {/* Existing Conditions */}
                <select
                  value={
                    conditionOptions.includes(medicalHistory.existing_conditions)
                      ? medicalHistory.existing_conditions
                      : medicalHistory.existing_conditions === "Other"
                        ? "Other"
                        : ""
                  }
                  onChange={e => {
                    const value = e.target.value;
                    if (value === "Other") {
                      setCustomCondition('');
                      handleMedicalHistoryChange('existing_conditions', 'Other');
                    } else {
                      setCustomCondition('');
                      handleMedicalHistoryChange('existing_conditions', value);
                    }
                  }}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="">Select condition</option>
                  {conditionOptions.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                  <option value="Other">Other</option>
                </select>
                {medicalHistory.existing_conditions === "Other" && isEditing && (
                  <input
                    type="text"
                    placeholder="Please specify"
                    value={customCondition}
                    onChange={e => setCustomCondition(e.target.value)}
                    className="w-full p-2 border rounded-md mt-2"
                  />
                )}
              </>
            ) : (
              <p className="text-gray-600">{medicalHistory.existing_conditions || 'None reported'}</p>
            )}
          </div>
          <div>
            <h3 className="font-medium text-gray-700 mb-2">Chronic Diseases</h3>
            {isEditing ? (
              <>
                {/* Chronic Diseases */}
                <select
                  value={
                    chronicDiseaseOptions.includes(medicalHistory.chronic_diseases)
                      ? medicalHistory.chronic_diseases
                      : medicalHistory.chronic_diseases === "Other"
                        ? "Other"
                        : ""
                  }
                  onChange={e => {
                    const value = e.target.value;
                    if (value === "Other") {
                      setCustomChronic('');
                      handleMedicalHistoryChange('chronic_diseases', 'Other');
                    } else {
                      setCustomChronic('');
                      handleMedicalHistoryChange('chronic_diseases', value);
                    }
                  }}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="">Select condition</option>
                  {chronicDiseaseOptions.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                  <option value="Other">Other</option>
                </select>
                {medicalHistory.chronic_diseases === "Other" && isEditing && (
                  <input
                    type="text"
                    placeholder="Please specify"
                    value={customChronic}
                    onChange={e => setCustomChronic(e.target.value)}
                    className="w-full p-2 border rounded-md mt-2"
                  />
                )}
              </>
            ) : (
              <p className="text-gray-600">{medicalHistory.chronic_diseases || 'None reported'}</p>
            )}
          </div>
          <div>
            <h3 className="font-medium text-gray-700 mb-2">Previous Eye Conditions</h3>
            {isEditing ? (
              <>
                {/* Previous Eye Conditions */}
                <select
                  value={
                    eyeConditionOptions.includes(medicalHistory.previous_eye_conditions)
                      ? medicalHistory.previous_eye_conditions
                      : medicalHistory.previous_eye_conditions === "Other"
                        ? "Other"
                        : ""
                  }
                  onChange={e => {
                    const value = e.target.value;
                    if (value === "Other") {
                      setCustomEye('');
                      handleMedicalHistoryChange('previous_eye_conditions', 'Other');
                    } else {
                      setCustomEye('');
                      handleMedicalHistoryChange('previous_eye_conditions', value);
                    }
                  }}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="">Select condition</option>
                  {eyeConditionOptions.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                  <option value="Other">Other</option>
                </select>
                {medicalHistory.previous_eye_conditions === "Other" && isEditing && (
                  <input
                    type="text"
                    placeholder="Please specify"
                    value={customEye}
                    onChange={e => setCustomEye(e.target.value)}
                    className="w-full p-2 border rounded-md mt-2"
                  />
                )}
              </>
            ) : (
              <p className="text-gray-600">{medicalHistory.previous_eye_conditions || 'None reported'}</p>
            )}
          </div>
          <div>
            <h3 className="font-medium text-gray-700 mb-2">Previous Ocular Surgeries</h3>
            {isEditing ? (
              <>
                <select
                  value={
                    ocularSurgeryOptions.includes(medicalHistory.previous_ocular_surgeries)
                      ? medicalHistory.previous_ocular_surgeries
                      : medicalHistory.previous_ocular_surgeries === "Other"
                        ? "Other"
                        : ""
                  }
                  onChange={e => {
                    const value = e.target.value;
                    if (value === "Other") {
                      setCustomOcularSurgery('');
                      handleMedicalHistoryChange('previous_ocular_surgeries', 'Other');
                    } else {
                      setCustomOcularSurgery('');
                      handleMedicalHistoryChange('previous_ocular_surgeries', value);
                    }
                  }}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="">Select surgery</option>
                  {ocularSurgeryOptions.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                  <option value="Other">Other</option>
                </select>
                {medicalHistory.previous_ocular_surgeries === "Other" && isEditing && (
                  <input
                    type="text"
                    placeholder="Please specify"
                    value={customOcularSurgery}
                    onChange={e => setCustomOcularSurgery(e.target.value)}
                    className="w-full p-2 border rounded-md mt-2"
                  />
                )}
              </>
            ) : (
              <p className="text-gray-600">{medicalHistory.previous_ocular_surgeries || 'None reported'}</p>
            )}
          </div>
          <div>
            <h3 className="font-medium text-gray-700 mb-2">Family History with Eye Diseases</h3>
            {isEditing ? (
              <>
                <select
                  value={
                    familyHistoryOptions.includes(medicalHistory.family_history_eye_diseases)
                      ? medicalHistory.family_history_eye_diseases
                      : medicalHistory.family_history_eye_diseases === "Other"
                        ? "Other"
                        : ""
                  }
                  onChange={e => {
                    const value = e.target.value;
                    if (value === "Other") {
                      setCustomFamilyHistory('');
                      handleMedicalHistoryChange('family_history_eye_diseases', 'Other');
                    } else {
                      setCustomFamilyHistory('');
                      handleMedicalHistoryChange('family_history_eye_diseases', value);
                    }
                  }}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="">Select disease</option>
                  {familyHistoryOptions.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                  <option value="Other">Other</option>
                </select>
                {medicalHistory.family_history_eye_diseases === "Other" && isEditing && (
                  <input
                    type="text"
                    placeholder="Please specify"
                    value={customFamilyHistory}
                    onChange={e => setCustomFamilyHistory(e.target.value)}
                    className="w-full p-2 border rounded-md mt-2"
                  />
                )}
              </>
            ) : (
              <p className="text-gray-600">{medicalHistory.family_history_eye_diseases || 'None reported'}</p>
            )}
          </div>
          <div>
            <h3 className="font-medium text-gray-700 mb-2">Last Checkup</h3>
            {isEditing ? (
              <input
                type="date"
                value={medicalHistory.last_checkup_date}
                onChange={(e) => handleMedicalHistoryChange('last_checkup_date', e.target.value)}
                className="w-full p-2 border rounded-md"
              />
            ) : (
              <p className="text-gray-600">
                {medicalHistory.last_checkup_date
                  ? new Date(medicalHistory.last_checkup_date).toLocaleDateString()
                  : 'No record'}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* OCT Scans Comparison */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">OCT Scan History</h2>

        {/* Scan Success Message */}
        {scanSuccess && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-4">
            {scanSuccess}
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          {octImages.map((scan) => (
            <div key={scan.id} className="border rounded-lg p-4">
              <img
                src={scan.image_path}
                alt={`OCT Scan from ${new Date(scan.upload_date).toLocaleDateString()}`}
                className="w-full h-48 object-cover rounded mb-4"
              />
              <div className="flex items-center justify-between">
                <p className="text-gray-600">
                  {new Date(scan.upload_date).toLocaleDateString()}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => window.open(scan.image_path, '_blank')}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <Eye className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleDeleteScan(scan.id)}
                    className="text-blue-600 hover:text-blue-800"
                    title="Delete Scan"
                  >
                    <Trash className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Analysis for Disease Status */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Patient Health Analysis from OCT Scans</h2>

        {/* Enhanced Analysis Section */}
        <div className="mb-6 bg-blue-50 p-4 rounded-lg border border-blue-100">
          <h3 className="text-lg font-medium text-blue-800 mb-2">Personalized Analysis</h3>
          <p className="text-gray-700 leading-relaxed">
            {getEnhancedAnalysis()}
          </p>

          {predictions.length > 0 && (
            <div className="mt-3 flex items-center">
              <div className={`w-3 h-3 rounded-full mr-2 ${getProgressionStatus() === 'Worsening' ? 'bg-red-500' : getProgressionStatus() === 'Improving' ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
              <span className={`text-sm font-medium ${getProgressionStatus() === 'Worsening' ? 'text-red-700' : getProgressionStatus() === 'Improving' ? 'text-green-700' : 'text-yellow-700'}`}>
                Status: {getProgressionStatus()}
              </span>
            </div>
          )}
        </div>

        <p className="mb-4 text-gray-600">
          This section analyzes your overall eye health based on your uploaded OCT scans. The chart below shows how your health status has changed over time.
        </p>

        <div className="h-64">
          <Line data={chartData} options={{
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              y: {
                beginAtZero: true,
                max: 1,
                ticks: {
                  callback: function (value) {
                    if (value === 0) return 'Poor';
                    if (value === 0.25) return 'Fair';
                    if (value === 0.5) return 'Moderate';
                    if (value === 0.75) return 'Good';
                    if (value === 1) return 'Excellent';
                    return '';
                  }
                }
              }
            },
            plugins: {
              tooltip: {
                callbacks: {
                  label: function (context) {
                    const value = context.raw;
                    let status = 'Poor';
                    if (value > 0.8) status = 'Excellent';
                    else if (value > 0.6) status = 'Good';
                    else if (value > 0.4) status = 'Moderate';
                    else if (value > 0.2) status = 'Fair';
                    return `Health Status: ${status} (${Math.round(value * 100)}%)`;
                  }
                }
              }
            }
          }} />
        </div>
      </div>

      {/* Previous Diagnoses */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-800">Previous Diagnoses</h2>
          <Clock className="h-6 w-6 text-blue-600" />
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Disease Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Severity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Confidence</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {predictions.map((prediction) => (
                <tr key={prediction.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(prediction.prediction_date).toLocaleDateString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{prediction.disease_type}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{prediction.severity_level}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{(prediction.confidence_score * 100).toFixed(1)}%</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <button
                      onClick={() => viewReport(prediction.id)}
                      className="text-blue-600 hover:text-blue-800 mr-3"
                      title="View Report"
                    >
                      <Eye className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => downloadReport(prediction.id)}
                      className="text-blue-600 hover:text-blue-800"
                      title="Download Report"
                    >
                      <Download className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Report Modal */}
      {reportModal.open && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-2xl w-full relative">
            <button onClick={() => setReportModal({ open: false, content: '' })} className="absolute top-2 right-2 text-gray-500 hover:text-gray-700">
              <X className="h-5 w-5" />
            </button>
            <h3 className="text-lg font-semibold mb-4">Report</h3>
            <pre className="whitespace-pre-wrap text-sm text-gray-800">{reportModal.content}</pre>
          </div>
        </div>
      )}

      {/* Download History Button */}
      <div className="flex justify-end">
        <button
          onClick={() => {/* TODO: Implement PDF download */ }}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          <Download className="h-5 w-5" />
          <span>Download Medical History</span>
        </button>
      </div>
    </div>
  );
};

export default Dashboard;