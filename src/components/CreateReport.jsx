import { useState } from "react";
import { supabase, uploadImage } from "../supabaseClient";

function CreateReport() {
  const [image, setImage] = useState(null);
  const [reportData, setReportData] = useState({});
  const [loading, setLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null); // New state

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      let imageUrl = null;

      if (image) {
        imageUrl = await uploadImage(image);
      }

      const { data, error } = await supabase.from("diagnoses").insert([
        {
          ...reportData,
          image_url: imageUrl,
        },
      ]);

      if (error) {
        console.error("Error saving report:", error.message);
        alert("Failed to save the report.");
        return;
      }

      alert("Report created successfully!");
    } catch (error) {
      console.error("Unexpected error:", error);
      alert("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  // New: Analyze image function
  const handleAnalyze = async () => {
    if (!image) {
      alert("Please select an image first.");
      return;
    }
    setLoading(true);
    setAnalysisResult(null);

    try {
      const formData = new FormData();
      formData.append("file", image);

      console.log("Sending image to API...");

      const response = await fetch("https://vvs-dkhchtbpd9gkbhcn.polandcentral-01.azurewebsites.net/predict", {
        method: "POST",
        body: formData,
      });

      console.log("API response status:", response.status);

      if (!response.ok) {
        throw new Error("Failed to analyze image");
      }

      const result = await response.json();
      console.log("API result:", result);
      setAnalysisResult(result);
    } catch (error) {
      console.error("Analysis error:", error);
      alert("Failed to analyze the image.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Create Doctor/Patient Report</h2>

      <input
        type="text"
        placeholder="Patient Name"
        onChange={(e) => setReportData({ ...reportData, patient_name: e.target.value })}
        required
      />

      <input
        type="file"
        accept="image/*"
        onChange={(e) => setImage(e.target.files[0])}
      />

      {/* New Upload and Analyze Button */}
      <button type="button" onClick={handleAnalyze} disabled={loading || !image}>
        {loading ? "Analyzing..." : "Upload and Analyze"}
      </button>

      <button type="submit" disabled={loading}>
        {loading ? "Saving..." : "Create Report"}
      </button>

      {/* Show analysis result */}
      {analysisResult && (
        <div>
          <h3>Analysis Result:</h3>
          <pre>{JSON.stringify(analysisResult, null, 2)}</pre>
        </div>
      )}
    </form>
  );
}

export default CreateReport;