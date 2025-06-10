/*
  # Initial Schema Setup for OCT Vision AI Platform

  1. New Tables
    - `profiles`
      - `id` (uuid, primary key, references auth.users)
      - `full_name` (text)
      - `age` (integer)
      - `gender` (text)
      - `contact_number` (text)
      - `created_at` (timestamp)
    - `oct_images`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `image_path` (text)
      - `upload_date` (timestamp)
      - `image_quality` (text)
      - `segmentation_result` (text)
    - `medical_histories`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `existing_conditions` (text)
      - `chronic_diseases` (text)
      - `previous_eye_conditions` (text)
      - `last_checkup_date` (date)
      - `lifestyle_factors` (text)
      - `vision_aids` (text)
    - `disease_predictions`
      - `id` (uuid, primary key)
      - `image_id` (uuid, references oct_images)
      - `disease_type` (text)
      - `confidence_score` (float)
      - `severity_level` (text)
      - `prediction_date` (timestamp)
    - `health_reports`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `prediction_id` (uuid, references disease_predictions)
      - `report_date` (timestamp)
      - `severity_status` (text)
      - `recommendations` (text)
      - `follow_up_date` (date)
      - `requires_immedia-- Update the existing policy or create a new one if needed
CREATE POLICY "Users can update own health reports"
  ON health_reports FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own health reports"
  ON health_reports FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());te_attention` (boolean)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to access their own data
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  full_name text,
  age integer,
  gender text,
  contact_number text,
  created_at timestamptz DEFAULT now()
);

-- Create oct_images table
CREATE TABLE IF NOT EXISTS oct_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles ON DELETE CASCADE,
  image_path text NOT NULL,
  upload_date timestamptz DEFAULT now(),
  image_quality text,
  segmentation_result text
);

-- Create medical_histories table
CREATE TABLE IF NOT EXISTS medical_histories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles ON DELETE CASCADE,
  existing_conditions text,
  chronic_diseases text,
  previous_eye_conditions text,
  last_checkup_date date,
  lifestyle_factors text,
  vision_aids text,
  previous_ocular_surgeries TEXT,
  family_history_eye_diseases TEXT
);

-- Create disease_predictions table
CREATE TABLE IF NOT EXISTS disease_predictions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  image_id uuid REFERENCES oct_images ON DELETE CASCADE,
  disease_type text,
  confidence_score float,
  severity_level text,
  prediction_date timestamptz DEFAULT now()
);

-- Create health_reports table
CREATE TABLE IF NOT EXISTS health_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles ON DELETE CASCADE,
  prediction_id uuid REFERENCES disease_predictions ON DELETE CASCADE,
  report_date timestamptz DEFAULT now(),
  severity_status text,
  recommendations text,
  follow_up_date date,
  requires_immediate_attention boolean DEFAULT false
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE oct_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_histories ENABLE ROW LEVEL SECURITY;
ALTER TABLE disease_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_reports ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can view own images"
  ON oct_images FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own images"
  ON oct_images FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can view own medical history"
  ON medical_histories FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can update own medical history"
  ON medical_histories FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can view own predictions"
  ON disease_predictions FOR SELECT
  TO authenticated
  USING (image_id IN (
    SELECT id FROM oct_images WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can view own health reports"
  ON health_reports FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

const { data: profile } = await supabase
  .from('profiles')// After getting the analysis result and before creating the health report
const doctorReport = await generateContent({
  prediction: analysisResult.prediction,
  confidence: Math.max(...Object.values(analysisResult.probabilities)),
  severity: getSeverityLevel(Math.max(...Object.values(analysisResult.probabilities))),
  patientInfo,
  medicalHistory
});

const patientReport = await generateContent({
  ...same parameters...,
  isPatientFriendly: true
});

// When creating the health report
const { error: reportError } = await supabase
  .from('health_reports')
  .insert([
    {
      user_id: user.id,
      follow_up_date: followUpDate.toISOString().split('T')[0],
      report_date: new Date().toISOString(),
      severity_status: getSeverityLevel(Math.max(...Object.values(analysisResult.probabilities))),
      requires_immediate_attention: Math.max(...Object.values(analysisResult.probabilities)) > 0.8,
      doctor_report: doctorReport,
      patient_report: patientReport
    }
  ]);
  .select('full_name, email')
  .eq('id', user.id)
  .single();
setPatientInfo(profile);