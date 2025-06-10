import React, { useState } from "react";
import { supabase } from "../supabaseClient"; // Ensure you have a Supabase client setup
import { useLanguageStore } from '../store/languageStore';

function Diagnoses() {
  const { translate } = useLanguageStore();
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
        console.error(translate("errorUploadingImage"), error.message);
        return;
      }

      console.log(translate("imageUploadedSuccessfully"), data);
      alert(translate("imageUploadSuccessAlert"));
    } catch (error) {
      console.error(translate("unexpectedError"), error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <h2>{translate("uploadPatientImageTitle")}</h2>
      <input
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        disabled={uploading}
      />
      {uploading && <p>{translate("uploadingMessage")}</p>}
    </div>
  );
}

export default Diagnoses;