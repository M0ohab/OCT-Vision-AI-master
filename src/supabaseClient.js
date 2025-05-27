import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Uploads an image to Supabase storage and returns its public URL.
 * @param {File} file - The image file to upload.
 * @returns {Promise<string>} - The public URL of the uploaded image.
 */
export async function uploadImage(file) {
  const bucketName = "your-bucket-name"; // Replace with your bucket name
  const filePath = `patient-images/${file.name}`;

  const { data, error } = await supabase.storage.from(bucketName).upload(filePath, file);

  if (error) {
    console.error("Error uploading image:", error.message);
    throw new Error("Image upload failed");
  }

  const { publicURL } = supabase.storage.from(bucketName).getPublicUrl(filePath);
  return publicURL;
}