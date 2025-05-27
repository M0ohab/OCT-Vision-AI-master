import { useState } from "react";
import { supabase } from "../supabaseClient"; // Ensure you have a Supabase client setup

function Diagnoses() {
  const [image, setImage] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setUploading(true);

    try {
      // Upload the image to Supabase storage
      const { data, error } = await supabase.storage
        .from("your-bucket-name") // Replace with your Supabase bucket name
        .upload(`patient-images/${file.name}`, file);

      if (error) {
        console.error("Error uploading image:", error.message);
        return;
      }

      console.log("Image uploaded successfully:", data);
      alert("Image uploaded successfully!");
    } catch (error) {
      console.error("Unexpected error:", error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <h2>Upload Patient Image</h2>
      <input
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        disabled={uploading}
      />
      {uploading && <p>Uploading...</p>}
    </div>
  );
}

export default Diagnoses;