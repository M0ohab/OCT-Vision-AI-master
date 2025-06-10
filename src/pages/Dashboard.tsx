import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import { Calendar, Download, Eye, TrendingUp, Clock, AlertCircle, Save, Trash, X } from 'lucide-react';
import { Line } from 'react-chartjs-2';
import { format, parseISO } from 'date-fns';
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
import { useLanguageStore } from '../store/languageStore';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const Dashboard = () => {
  const { user } = useAuthStore();
  const { translate } = useLanguageStore();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [scanSuccess, setScanSuccess] = useState<string | null>(null);
  const [daysUntilFollowUp, setDaysUntilFollowUp] = useState<number | null>(null);
  const [showNotification, setShowNotification] = useState<boolean>(false);
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

  const conditionOptions = [
    translate('diabetes'),
    translate('hypertension'),
    translate('highCholesterol'),
    translate('asthma')
  ];

  const chronicDiseaseOptions = [
    translate('heartDisease'),
    translate('kidneyDisease'),
    translate('liverDisease'),
    translate('cancer')
  ];

  const eyeConditionOptions = [
    translate('glaucoma'),
    translate('cataract'),
    translate('macularDegeneration'),
    translate('diabeticRetinopathy')
  ];

  const ocularSurgeryOptions = [
    translate('cataractSurgery'),
    translate('lasik'),
    translate('retinalDetachment'),
    translate('glaucomaSurgery')
  ];

  const familyHistoryOptions = [
    translate('glaucoma'),
    translate('macularDegeneration'),
    translate('diabeticRetinopathy'),
    translate('retinitisPigmentosa')
  ];

  // Calculate days until follow-up and show notification
  useEffect(() => {
    if (healthReports && healthReports.length > 0 && healthReports[0]?.follow_up_date) {
      const followUpDate = new Date(healthReports[0].follow_up_date);
      const today = new Date();
      const diffTime = followUpDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      setDaysUntilFollowUp(diffDays);
      setShowNotification(diffDays <= 7 && diffDays >= 0);
    }
  }, [healthReports]);

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

<<<<<<< HEAD
=======
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

>>>>>>> 2b521d860fee8a9e5936e315391dd550f74545d8
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

  // Calculate days until follow-up and show notification
  useEffect(() => {
    if (healthReports[0]?.follow_up_date) {
      const followUpDate = new Date(healthReports[0].follow_up_date);
      const today = new Date();
      const timeDiff = followUpDate.getTime() - today.getTime();
      const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

      setDaysUntilFollowUp(daysDiff);
      setShowNotification(daysDiff <= 7 && daysDiff > 0);
    }
  }, [healthReports]);

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
      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        {translate('patient_dashboard')}
      </h1>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-800">
              {translate('disease_status')}
            </h2>
            <TrendingUp className="h-6 w-6 text-blue-600" />
          </div>
<<<<<<< HEAD
          <div className="flex items-center mt-2">
            <div className={`w-3 h-3 rounded-full mr-2 ${getProgressionStatus() === 'Worsening' ? 'bg-red-500' : getProgressionStatus() === 'Improving' ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
            <span className={`text-sm font-medium ${getProgressionStatus() === 'Worsening' ? 'text-red-700' : getProgressionStatus() === 'Improving' ? 'text-green-700' : 'text-yellow-700'}`}>
              {translate('status')}: {getProgressionStatus()}
            </span>
          </div>
=======
          <p className="text-2xl font-bold text-gray-900">
            {translate('not_enough_data')}
          </p>
>>>>>>> 2b521d860fee8a9e5936e315391dd550f74545d8
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-800">
              {translate('latest_scan')}
            </h2>
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
            <h2 className="text-xl font-semibold text-gray-800">
              {translate('next_follow_up')}
            </h2>
            <Calendar className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <p className="text-gray-600">
              {healthReports[0]?.follow_up_date
                ? new Date(healthReports[0].follow_up_date).toLocaleDateString()
<<<<<<< HEAD
                : translate('not_scheduled')}
=======
                : 'Not scheduled'}
>>>>>>> 2b521d860fee8a9e5936e315391dd550f74545d8
            </p>
            {daysUntilFollowUp !== null && healthReports[0]?.follow_up_date && (
              <p className="text-sm text-gray-500 mt-1">
                {daysUntilFollowUp === 0
                  ? 'Today is your follow-up!'
                  : daysUntilFollowUp > 0
                    ? `In ${daysUntilFollowUp} day(s)`
                    : `Was ${Math.abs(daysUntilFollowUp)} day(s) ago`}
              </p>
            )}
            {showNotification && (
              <div className="mt-2 p-2 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded-md flex items-center">
                <AlertCircle className="h-5 w-5 mr-2" />
<<<<<<< HEAD
                <span>{translate('follow_up_reminder')}</span>
=======
                <span>Reminder: Your follow-up is within 7 days!</span>
>>>>>>> 2b521d860fee8a9e5936e315391dd550f74545d8
              </div>
            )}
          </div>
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
                {saving ? translate('saving') : translate('save')}
              </button>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                title={translate('edit_medical_history')}
              >
                {translate('edit')}
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
            <h3 className="font-medium text-gray-700 mb-2">{translate('existing_conditions')}</h3>
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
                  <option value="">{translate('select_condition')}</option>
                  {conditionOptions.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                  <option value="Other">{translate('other')}</option>
                </select>
                {medicalHistory.existing_conditions === "Other" && isEditing && (
                  <input
                    type="text"
                    placeholder={translate('please_specify')}
                    value={customCondition}
                    onChange={e => setCustomCondition(e.target.value)}
                    className="w-full p-2 border rounded-md mt-2"
                  />
                )}
              </>
            ) : (
              <p className="text-gray-600">{medicalHistory.existing_conditions || translate('none_reported')}</p>
            )}
          </div>
          <div>
            <h3 className="font-medium text-gray-700 mb-2">{translate('chronic_diseases')}</h3>
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
                  <option value="">{translate('select_condition')}</option>
                  {chronicDiseaseOptions.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                  <option value="Other">{translate('other')}</option>
                </select>
                {medicalHistory.chronic_diseases === "Other" && isEditing && (
                  <input
                    type="text"
                    placeholder={translate('please_specify')}
                    value={customChronic}
                    onChange={e => setCustomChronic(e.target.value)}
                    className="w-full p-2 border rounded-md mt-2"
                  />
                )}
              </>
            ) : (
              <p className="text-gray-600">{medicalHistory.chronic_diseases || translate('none_reported')}</p>
            )}
          </div>
          <div>
            <h3 className="font-medium text-gray-700 mb-2">{translate('previous_eye_conditions')}</h3>
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
                  <option value="">{translate('select_condition')}</option>
                  {eyeConditionOptions.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                  <option value="Other">{translate('other')}</option>
                </select>
                {medicalHistory.previous_eye_conditions === "Other" && isEditing && (
                  <input
                    type="text"
                    placeholder={translate('please_specify')}
                    value={customEye}
                    onChange={e => setCustomEye(e.target.value)}
                    className="w-full p-2 border rounded-md mt-2"
                  />
                )}
              </>
            ) : (
              <p className="text-gray-600">{medicalHistory.previous_eye_conditions || translate('none_reported')}</p>
            )}
          </div>
          <div>
            <h3 className="font-medium text-gray-700 mb-2">{translate('previous_ocular_surgeries')}</h3>
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
                  <option value="">{translate('select_surgery')}</option>
                  {ocularSurgeryOptions.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                  <option value="Other">{translate('other')}</option>
                </select>
                {medicalHistory.previous_ocular_surgeries === "Other" && isEditing && (
                  <input
                    type="text"
                    placeholder={translate('please_specify')}
                    value={customOcularSurgery}
                    onChange={e => setCustomOcularSurgery(e.target.value)}
                    className="w-full p-2 border rounded-md mt-2"
                  />
                )}
              </>
            ) : (
              <p className="text-gray-600">{medicalHistory.previous_ocular_surgeries || translate('none_reported')}</p>
            )}
          </div>
          <div>
            <h3 className="font-medium text-gray-700 mb-2">{translate('family_history_eye_diseases')}</h3>
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
                  <option value="">{translate('select_disease')}</option>
                  {familyHistoryOptions.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                  <option value="Other">{translate('other')}</option>
                </select>
                {medicalHistory.family_history_eye_diseases === "Other" && isEditing && (
                  <input
                    type="text"
                    placeholder={translate('please_specify')}
                    value={customFamilyHistory}
                    onChange={e => setCustomFamilyHistory(e.target.value)}
                    className="w-full p-2 border rounded-md mt-2"
                  />
                )}
              </>
            ) : (
              <p className="text-gray-600">{medicalHistory.family_history_eye_diseases || translate('none_reported')}</p>
            )}
          </div>
          <div>
            <h3 className="font-medium text-gray-700 mb-2">{translate('last_checkup')}</h3>
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
                  : translate('no_record')}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* OCT Scans Comparison */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">{translate('oct_scan_history')}</h2>

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
                alt={`${translate('oct_scan_from')} ${new Date(scan.upload_date).toLocaleDateString()}`}
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
                    title={translate('delete_scan')}
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
        <h2 className="text-xl font-semibold text-gray-800 mb-2">{translate('patient_health_analysis')}</h2>

        {/* Enhanced Analysis Section */}
        <div className="mb-6 bg-blue-50 p-4 rounded-lg border border-blue-100">
          <h3 className="text-lg font-medium text-blue-800 mb-2">{translate('personalized_analysis')}</h3>
          <p className="text-gray-700 leading-relaxed">
            {getEnhancedAnalysis()}
          </p>

          {predictions.length > 0 && (
<<<<<<< HEAD
            <></>
=======
            <div className="mt-3 flex items-center">
              <div className={`w-3 h-3 rounded-full mr-2 ${getProgressionStatus() === 'Worsening' ? 'bg-red-500' : getProgressionStatus() === 'Improving' ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
              <span className={`text-sm font-medium ${getProgressionStatus() === 'Worsening' ? 'text-red-700' : getProgressionStatus() === 'Improving' ? 'text-green-700' : 'text-yellow-700'}`}>
                {translate('status')}: {getProgressionStatus()}
              </span>
            </div>
>>>>>>> 2b521d860fee8a9e5936e315391dd550f74545d8
          )}
        </div>

        <p className="mb-4 text-gray-600">
          {translate('analysis_description')}
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
                    if (value === 0) return translate('poor');
                    if (value === 0.25) return translate('fair');
                    if (value === 0.5) return translate('moderate');
                    if (value === 0.75) return translate('good');
                    if (value === 1) return translate('excellent');
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
                    let status = translate('poor');
                    if (value > 0.8) status = translate('excellent');
                    else if (value > 0.6) status = translate('good');
                    else if (value > 0.4) status = translate('moderate');
                    else if (value > 0.2) status = translate('fair');
                    return `${translate('health_status')}: ${status} (${Math.round(value * 100)}%)`;
                  }
                }
              }
            }
          }} />
        </div>
      </div>

      {/* Next Follow-up */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-800">{translate('next_follow_up')}</h2>
          <Calendar className="h-6 w-6 text-blue-600" />
        </div>

        {showNotification && (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded mb-4 flex items-center">
            <AlertCircle className="h-5 w-5 mr-2" />
            <span>{translate('follow_up_appointment_reminder', { days: daysUntilFollowUp })}</span>
          </div>
        )}

        <div className="flex items-center space-x-4 mb-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">{translate('next_follow_up_date')}</label>
            {healthReports.length > 0 && healthReports[0]?.follow_up_date ? (
              <p className="text-lg font-semibold text-gray-900">
                {format(parseISO(healthReports[0].follow_up_date), 'MM/dd/yyyy')}
              </p>
            ) : (
              <p className="text-lg text-gray-500">{translate('no_follow_up_date_available')}</p>
            )}
          </div>
          {daysUntilFollowUp !== null && (
            <div className="bg-blue-50 p-4 rounded-lg flex-1">
              <h3 className="text-sm font-medium text-blue-800 mb-1">{translate('days_until_follow_up')}</h3>
              <p className="text-2xl font-bold text-blue-600">
                {daysUntilFollowUp === 0
<<<<<<< HEAD
                  ? 'Today is your follow-up!'
                  : daysUntilFollowUp > 0
                    ? `In ${daysUntilFollowUp} day(s)`
                    : `Was ${Math.abs(daysUntilFollowUp)} day(s) ago`}
=======
                  ? translate('today_is_your_follow_up')
                  : daysUntilFollowUp > 0
                    ? translate('in_x_days', { days: daysUntilFollowUp })
                    : translate('was_x_days_ago', { days: Math.abs(daysUntilFollowUp) })}
>>>>>>> 2b521d860fee8a9e5936e315391dd550f74545d8
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Previous Diagnoses */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-800">{translate('previous_diagnoses')}</h2>
          <Clock className="h-6 w-6 text-blue-600" />
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{translate('date')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{translate('disease_type')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{translate('severity')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{translate('confidence')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{translate('actions')}</th>
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
                      title={translate('view_report')}
                    >
                      <Eye className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => downloadReport(prediction.id)}
                      className="text-blue-600 hover:text-blue-800"
                      title={translate('download_report')}
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
            <h3 className="text-lg font-semibold mb-4">{translate('report')}</h3>
            <pre className="whitespace-pre-wrap text-sm text-gray-800">{reportModal.content}</pre>
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setReportModal({ open: false, content: '' })}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                {translate('close')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;