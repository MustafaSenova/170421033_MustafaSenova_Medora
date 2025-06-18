// Sağlık AI servisleri için type tanımları

export interface VitalSigns {
  heartRate?: number;
  bloodPressure?: {
    systolic: number;
    diastolic: number;
  };
  temperature?: number;
  oxygenSaturation?: number;
  weight?: number;
  height?: number;
  bloodSugar?: number;
}

export interface Symptom {
  name: string;
  severity: number; // 1-10 arası
  duration?: string;
  description?: string;
}

export interface Activity {
  type: string;
  duration: number; // dakika
  calories?: number;
  intensity?: 'low' | 'medium' | 'high';
  date?: string;
}

export interface Demographics {
  age?: number;
  gender?: 'male' | 'female' | 'other';
  conditions?: string[];
  medications?: string[];
  allergies?: string[];
}

export interface HealthContext {
  vitals?: VitalSigns;
  symptoms?: Symptom[];
  activities?: Activity[];
  demographics?: Demographics;
  lastCheckup?: string;
  notes?: string;
}

export interface AIHealthResponse {
  analysis: string;
  recommendations: string[];
  riskLevel: 'low' | 'medium' | 'high';
  insights: string[];
  confidence: number; // 0-1 arası
  lastUpdated: string;
  actionItems?: string[];
  followUpRecommended?: boolean;
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
}

export interface ChatResponse {
  message: string;
  suggestions?: string[];
  relatedTopics?: string[];
  confidence?: number;
}

// Samsung Health entegrasyonu için ek tipler
export interface SamsungHealthData {
  steps?: number;
  heartRate?: number[];
  sleep?: {
    duration: number;
    quality: 'poor' | 'fair' | 'good' | 'excellent';
  };
  activity?: Activity[];
}

// Mock data için helper tipler
export interface MockHealthProfile {
  userId: string;
  profile: HealthContext;
  riskFactors: string[];
  goals: string[];
}
