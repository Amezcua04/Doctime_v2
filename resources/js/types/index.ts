export type * from './auth';
export type * from './navigation';
export type * from './ui';

import type { Auth } from './auth';

export type SharedData = {
  name: string;
  auth: Auth;
  flash: {
    success?: string;
    error?: string;
    warning?: string;
    id?: string;
  };
  sidebarOpen: boolean;
  clinic: ClinicSettings | null;
  [key: string]: unknown;
};

export type ClinicSettings = {
  name: string;
  slogan?: string;
  phone?: string;
  address?: string;
  hero_title?: string;
  hero_description?: string;
  logo_path?: string;
  favicon_path?: string;
  enable_email_reminders?: boolean;
  enable_whatsapp_reminders?: boolean;
  whatsapp_phone_id?: string;
  whatsapp_api_token?: string;
  reminder_hours_before?: number;
};

export interface Specialty {
  id: number;
  name: string;
  color: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export type Role = {
  id: number;
  name: string;
};

export type MedicalProfile = {
  id: number;
  user_id: number;
  photo_path?: string;
  specialties?: Specialty[];
  license?: string | null;
  bio?: string | null;
  is_public?: boolean;
};

export interface Absence {
  id: number;
  start_date: string;
  end_date: string;
  reason: string | null;
}

export interface Attachment {
  id: number;
  title: string;
  category: string;
  file_path: string;
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Contract {
  id: number;
  title: string;
  file_path: string;
  signed_at: string | null;
  status: 'pending' | 'signed' | 'revoked';
  is_generated?: boolean;
  created_at: string;
  updated_at: string;
}

export interface MedicalRecord {
  id: number;
  blood_type: string | null;
  allergies: string | null;
  pathological_history: string | null;
  non_pathological_history: string | null;
  family_history: string | null;

  attachments?: Attachment[];
}

export interface Patient {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  birth_date: string;
  gender: 'M' | 'F' | 'O';
  address: string | null;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;

  medical_record?: MedicalRecord;
  contracts?: Contract[];
}

export interface Template {
  id: number;
  title: string;
  type: string;
  content: string;
}

export interface ProgressNote {
  id?: number;
  date: string;
  upper_arch: string;
  lower_arch: string;
  others: string;
  planned_operation: string;
  isNew?: boolean;
}

export interface Service {
  id: number;
  name: string;
  description: string | null;
  price: number;
  duration_min: number;
  is_active: boolean;
  is_public: boolean;
}

export interface PaymentMethod {
  id: number;
  name: string;
  is_active: boolean;
}

export interface RawAppointmentEvent {
  id: number;
  title: string;
  start: string;
  end: string;
  status: string;
  patient_id: number;
  doctor_id: number;
  notes?: string;
}

export interface CalendarEvent {
  id: number;
  title: string;
  start: Date;
  end: Date;
  status: string;
  patient_id: number;
  doctor_id: number;
  notes?: string;
  [key: string]: any;
}

export interface Message {
  id: number;
  sender_id: number;
  content: string;
  created_at: string;
}

export interface StatCardsProps {
  stats: {
    today_appointments: number;
    upcoming_appointments: number;
    total_patients: number;
    cancelled_month: number;
  };
}

export interface FinancialOverviewProps {
  financialStats: {
    ingresos_mes: number;
    ticket_promedio: number;
    crecimiento_porcentaje: number;
  } | null;
}

export interface ActivityChartsProps {
  chartData: {
    date: string;
    citas: number
  }[];
  statusDistribution: {
    name: string; value: number
  }[];
}

export interface DashboardStats {
  today_appointments: number;
  upcoming_appointments: number;
  total_patients: number;
  cancelled_month: number;
}

export interface FinancialStats {
  ingresos_mes: number;
  ticket_promedio: number;
  crecimiento_porcentaje: number;
}

export interface ChartDataRecord {
  date: string;
  citas: number;
}

export interface StatusDistribution {
  name: string;
  value: number;
}

export interface NextAppointment {
  id: number;
  patient_name: string;
  doctor_name: string;
  time: string;
  date: string;
  status: 'scheduled' | 'confirmed' | 'cancelled' | 'completed' | 'no_show' | 'in_progress' | 'arrived';
}

export interface TopService {
  name: string;
  total: number;
}

export interface ConfirmationItem {
  id: number;
  patient: string;
  phone: string | null;
  time: string;
}

export interface WaitingPatient {
  id: number;
  patient: string;
  time: string;
  wait_time: string;
}

export interface InConsultationPatient {
  id: number;
  patient: string;
  doctor: string;
  time: string;
  duration: string;
}