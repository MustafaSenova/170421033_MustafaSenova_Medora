// Health data types adapted from main project
export interface HeartRateData {
  value: number;
  timestamp: string;
  status?: 'normal' | 'tachycardia' | 'bradycardia';
}

export interface BloodPressureData {
  systolic: number;
  diastolic: number;
  timestamp: string;
  status?: 'normal' | 'elevated' | 'hypertension_1' | 'hypertension_2';
}

export interface SleepData {
  duration: number; // minutes
  quality?: 'poor' | 'fair' | 'good' | 'excellent';
  timestamp: string;
}

export interface ActivityData {
  steps: number;
  calories: number;
  distance?: number;
  timestamp: string;
}

export interface HealthMetrics {
  heartRate?: HeartRateData[];
  bloodPressure?: BloodPressureData[];
  sleep?: SleepData[];
  activity?: ActivityData[];
  weight?: number;
  height?: number;
  age?: number;
  gender?: 'male' | 'female' | 'other';
}

export interface UserProfile {
  age: number;
  gender: 'male' | 'female' | 'other';
  weight?: number;
  height?: number;
  medicalHistory?: string[];
  currentMedications?: string[];
  allergies?: string[];
}

export interface HealthContext {
  vitals?: {
    heartRate?: number;
    bloodPressure?: {
      systolic: number;
      diastolic: number;
    };
    temperature?: number;
    weight?: number;
    height?: number;
  };
  symptoms?: Array<{
    name: string;
    severity: number;
    duration?: string;
  }>;
  activities?: Array<{
    type: string;
    duration: number;
    calories?: number;
    intensity?: 'low' | 'medium' | 'high';
  }>;  demographics?: {
    age: number;
    gender?: string;
    medicalHistory?: string[];
    conditions?: string[];
    medications?: string[];
  };
  userProfile?: UserProfile;
  currentMetrics?: HealthMetrics;
  timeframe?: '24h' | '7d' | '30d';
}

export interface AIHealthResponse {
  insights: string[];
  recommendations: string[];
  alerts: string[];
  riskLevel: 'low' | 'medium' | 'high';
  actionItems?: string[];
  riskAssessment?: {
    level: 'low' | 'moderate' | 'high';
    factors: string[];
  };
  confidence: number; // 0-1
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  context?: HealthContext;
}
