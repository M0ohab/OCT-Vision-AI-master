-- Add doctor_report and patient_report columns to health_reports table
ALTER TABLE health_reports
ADD COLUMN doctor_report text DEFAULT '',
ADD COLUMN patient_report text DEFAULT '';

-- Add indexes to improve query performance
CREATE INDEX IF NOT EXISTS idx_health_reports_prediction_id ON health_reports(prediction_id);
CREATE INDEX IF NOT EXISTS idx_health_reports_user_id_report_date ON health_reports(user_id, report_date);

-- Update existing policies for health_reports table
DROP POLICY IF EXISTS "Users can update own health reports" ON health_reports;
DROP POLICY IF EXISTS "Users can insert own health reports" ON health_reports;

CREATE POLICY "Users can update own health reports"
  ON health_reports FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own health reports"
  ON health_reports FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());