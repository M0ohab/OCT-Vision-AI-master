import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import { Calendar, Download, Eye, FileText, TrendingUp, Clock, AlertCircle, Save, Trash, X } from 'lucide-react';
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

  const chartData = {
    labels: predictions.map(p => new Date(p.prediction_date).toLocaleDateString()),
    datasets: [{
      label: 'Disease Status Score', // <-- update this label if desired
      data: predictions.map(p => p.confidence_score),
      borderColor: 'rgb(75, 192, 192)',
      tension: 0.1
    }]
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
  const viewReport = async (predictionId: number) => {
    const { data, error } = await supabase
      .from('health_reports')
      .select('doctor_report, patient_report')
      .eq('prediction_id', predictionId)
      .single();

    if (error || !data) {
      alert('Failed to load report.');
      return;
    }

    setReportModal({
      open: true,
      content: `Doctor Report:\n${data.doctor_report || 'N/A'}\n\nPatient Report:\n${data.patient_report || 'N/A'}`
    });
  };

  // Download report handler
  const downloadReport = async (predictionId: number) => {
    const { data, error } = await supabase
      .from('health_reports')
      .select('doctor_report, patient_report')
      .eq('prediction_id', predictionId)
      .single();

    if (error || !data) {
      alert('Failed to load report.');
      return;
    }

    const fileContent = `Doctor Report:\n${data.doctor_report || 'N/A'}\n\nPatient Report:\n${data.patient_report || 'N/A'}`;
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
                className="p-2 rounded-full text-blue-600 hover:text-blue-800 hover:bg-blue-100 transition"
                title="Edit Medical History"
              >
                <FileText className="h-6 w-6" />
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
        <p className="mb-4 text-gray-600">
          This section analyzes your overall eye health based on your uploaded OCT scans. The chart below shows how your disease status has changed over time.
          {predictions.length > 1 && (
            <>
              {' '}
              <span className="font-medium text-blue-700">
                {getProgressionStatus() === 'Worsening' && 'Warning: Your latest scan indicates a possible worsening of your condition.'}
                {getProgressionStatus() === 'Improving' && 'Good news: Your latest scan shows improvement.'}
                {getProgressionStatus() === 'Stable' && 'Your condition appears stable based on recent scans.'}
              </span>
            </>
          )}
        </p>
        <div className="h-64">
          <Line data={chartData} options={{
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              y: {
                beginAtZero: true,
                max: 1
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