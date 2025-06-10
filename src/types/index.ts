export interface User {
  id: string;
  full_name: string;
  email: string;
  age: number;
  gender: string;
  medical_history: string;
  created_at: string;
}

export interface Report {
  id: string;
  user_id: string;
  scan_url: string;
  doctor_report: string;
  patient_report: string;
  diagnosis: string;
  created_at: string;
}

export interface AuthState {
  user: User | null;
  setUser: (user: User | null) => void;
}