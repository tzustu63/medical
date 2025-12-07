// 用戶類型
export enum UserType {
  HEALTHCARE_PROFESSIONAL = 'healthcare_professional',
  HOSPITAL_ADMIN = 'hospital_admin',
  SYSTEM_ADMIN = 'system_admin',
}

// 醫事人員類別
export enum ProfessionalType {
  DOCTOR = 'doctor',
  NURSE = 'nurse',
  REGISTERED_NURSE = 'registered_nurse',
  PHARMACIST = 'pharmacist',
  PHARMACY_TECHNICIAN = 'pharmacy_technician',
  MEDICAL_TECHNOLOGIST = 'medical_technologist',
  MEDICAL_LABORATORY_TECHNICIAN = 'medical_laboratory_technician',
}

// 醫院類型
export enum HospitalType {
  MEDICAL_CENTER = 'medical_center',
  REGIONAL_HOSPITAL = 'regional_hospital',
  DISTRICT_HOSPITAL = 'district_hospital',
  CLINIC = 'clinic',
}

// 職缺類型
export enum JobType {
  SUPPORT = 'support',
  PERMANENT = 'permanent',
}

// 服務類型
export enum ServiceType {
  OUTPATIENT = 'outpatient',
  INPATIENT = 'inpatient',
  EMERGENCY = 'emergency',
  OTHER = 'other',
}

// 職缺狀態
export enum JobStatus {
  DRAFT = 'draft',
  OPEN = 'open',
  CLOSED = 'closed',
  FILLED = 'filled',
  CANCELLED = 'cancelled',
}

// 申請狀態
export enum ApplicationStatus {
  PENDING = 'pending',
  REVIEWING = 'reviewing',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  CANCELLED = 'cancelled',
  WITHDRAWN = 'withdrawn',
}

// 星期
export enum Weekday {
  MONDAY = 'monday',
  TUESDAY = 'tuesday',
  WEDNESDAY = 'wednesday',
  THURSDAY = 'thursday',
  FRIDAY = 'friday',
  SATURDAY = 'saturday',
  SUNDAY = 'sunday',
}

