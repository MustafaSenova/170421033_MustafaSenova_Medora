import { HealthContext, VitalSigns, Symptom, Activity } from '../types/health';

// Mock sağlık profilleri
export const mockHealthProfiles: HealthContext[] = [
  {
    vitals: {
      heartRate: 72,
      bloodPressure: { systolic: 118, diastolic: 75 },
      temperature: 36.4,
      weight: 68,
      height: 170,
      oxygenSaturation: 98
    },
    symptoms: [
      { name: 'Hafif yorgunluk', severity: 3, duration: '2 gün' }
    ],
    activities: [
      { type: 'Yürüyüş', duration: 45, calories: 200, intensity: 'medium' },
      { type: 'Yoga', duration: 30, calories: 100, intensity: 'low' }
    ],
    demographics: {
      age: 28,
      gender: 'female',
      conditions: [],
      medications: ['Vitamin D']
    }
  },
  {
    vitals: {
      heartRate: 88,
      bloodPressure: { systolic: 135, diastolic: 88 },
      temperature: 37.1,
      weight: 82,
      height: 180,
      oxygenSaturation: 96
    },
    symptoms: [
      { name: 'Baş ağrısı', severity: 6, duration: '4 saat' },
      { name: 'Stres', severity: 7, duration: '1 hafta' }
    ],
    activities: [
      { type: 'Koşu', duration: 20, calories: 250, intensity: 'high' }
    ],
    demographics: {
      age: 35,
      gender: 'male',
      conditions: ['Hipertansiyon'],
      medications: ['Lisinopril']
    }
  },
  {
    vitals: {
      heartRate: 65,
      bloodPressure: { systolic: 110, diastolic: 70 },
      temperature: 36.2,
      weight: 75,
      height: 175,
      oxygenSaturation: 99
    },
    symptoms: [],
    activities: [
      { type: 'Bisiklet', duration: 60, calories: 400, intensity: 'medium' },
      { type: 'Yüzme', duration: 30, calories: 300, intensity: 'high' },
      { type: 'Pilates', duration: 45, calories: 150, intensity: 'low' }
    ],
    demographics: {
      age: 32,
      gender: 'male',
      conditions: [],
      medications: []
    }
  }
];

// Günlük sağlık verileri
export const dailyHealthData = {
  steps: 8500,
  caloriesBurned: 450,
  sleepHours: 7.5,
  waterIntake: 6, // bardak
  mood: 'good' as 'excellent' | 'good' | 'fair' | 'poor'
};

// Sağlık metrikleri
export const healthMetrics = {
  bmi: 23.5,
  bodyFat: 18.2,
  muscleMass: 65.4,
  hydrationLevel: 75,
  stressLevel: 35, // %
  energyLevel: 80  // %
};

// Sample Samsung Health data
export const samsungHealthSample = {
  steps: 12450,
  heartRate: [72, 75, 68, 80, 76, 71, 78],
  sleep: {
    duration: 465, // dakika
    quality: 'good' as 'poor' | 'fair' | 'good' | 'excellent'
  },
  activity: [
    { type: 'Yürüyüş', duration: 35, calories: 180, intensity: 'medium' as 'low' | 'medium' | 'high' },
    { type: 'Merdiven çıkma', duration: 8, calories: 45, intensity: 'high' as 'low' | 'medium' | 'high' }
  ]
};

// AI Test senaryoları
export const aiTestScenarios = [
  {
    name: 'Normal Sağlık',
    data: mockHealthProfiles[0],
    expectedRisk: 'low' as 'low' | 'medium' | 'high'
  },
  {
    name: 'Orta Risk',
    data: mockHealthProfiles[1],
    expectedRisk: 'medium' as 'low' | 'medium' | 'high'
  },
  {
    name: 'Düşük Risk - Aktif',
    data: mockHealthProfiles[2],
    expectedRisk: 'low' as 'low' | 'medium' | 'high'
  }
];

// Chat test mesajları
export const chatTestMessages = [
  'Merhaba, nasılsın?',
  'Kalp sağlığı için ne önerirsin?',
  'Baş ağrım var, ne yapmalıyım?',
  'Egzersiz programı önerir misin?',
  'Uyku problemim var',
  'Stresli hissediyorum',
  'Sağlıklı beslenme tavsiyeleri',
  'Kilo vermek istiyorum'
];

// Sağlık ipuçları kategorileri
export const healthTipsCategories = {
  cardiovascular: [
    'Haftada 150 dakika orta yoğunlukta egzersiz yapın',
    'Tuz tüketiminizi günde 5g ile sınırlayın',
    'Omega-3 açısından zengin balık tüketin',
    'Stres yönetimi tekniklerini öğrenin'
  ],
  nutrition: [
    'Günde 5 porsiyon meyve-sebze tüketin',
    'Tam tahıl ürünlerini tercih edin',
    'Şekerli içecekleri sınırlayın',
    'Yeterince protein alın'
  ],
  mentalHealth: [
    'Günlük meditasyon yapın',
    'Sosyal bağlantılarınızı güçlendirin',
    'Hobiler edinin',
    'Yeterli uyku alın (7-9 saat)'
  ],
  preventive: [
    'Düzenli sağlık kontrolleri yaptırın',
    'Aşılarınızı eksik bırakmayın',
    'Güneş koruyucu kullanın',
    'Sigara ve alkol tüketimini bırakın'
  ]
};

// Acil durum senaryoları
export const emergencyScenarios = {
  chestPain: {
    symptoms: ['Göğüs ağrısı', 'Nefes darlığı', 'Sol kol ağrısı'],
    action: 'Derhal 112 arayın ve acil servise gidin',
    urgency: 'critical' as 'low' | 'medium' | 'high' | 'critical'
  },
  highFever: {
    symptoms: ['39°C+ ateş', 'Titreme', 'Şiddetli baş ağrısı'],
    action: 'Doktora başvurun, ateş düşürücü alın',
    urgency: 'high' as 'low' | 'medium' | 'high' | 'critical'
  },
  severeHeadache: {
    symptoms: ['Şiddetli baş ağrısı', 'Bulantı', 'Işık hassasiyeti'],
    action: 'Karanlık odada dinlenin, geçmezse doktor',
    urgency: 'medium' as 'low' | 'medium' | 'high' | 'critical'
  }
};

// Utility functions
export const generateRandomVitals = (): VitalSigns => ({
  heartRate: Math.floor(Math.random() * 40) + 60, // 60-100
  bloodPressure: {
    systolic: Math.floor(Math.random() * 40) + 110, // 110-150
    diastolic: Math.floor(Math.random() * 30) + 70   // 70-100
  },
  temperature: Math.round((Math.random() * 2 + 36) * 10) / 10, // 36.0-38.0
  weight: Math.floor(Math.random() * 40) + 60, // 60-100
  height: Math.floor(Math.random() * 30) + 160, // 160-190
  oxygenSaturation: Math.floor(Math.random() * 5) + 95 // 95-100
});

export const generateRandomSymptoms = (): Symptom[] => {
  const possibleSymptoms = [
    'Baş ağrısı', 'Yorgunluk', 'Bulantı', 'Baş dönmesi', 'Kas ağrısı',
    'Uykusuzluk', 'Stres', 'Kaygı', 'Karın ağrısı', 'Sırt ağrısı'
  ];
  
  const count = Math.floor(Math.random() * 3); // 0-2 semptom
  const selectedSymptoms = possibleSymptoms
    .sort(() => 0.5 - Math.random())
    .slice(0, count);
    
  return selectedSymptoms.map(name => ({
    name,
    severity: Math.floor(Math.random() * 10) + 1,
    duration: `${Math.floor(Math.random() * 7) + 1} gün`
  }));
};

export const generateRandomActivities = (): Activity[] => {
  const activities = [
    { type: 'Yürüyüş', avgCalories: 150, avgDuration: 30 },
    { type: 'Koşu', avgCalories: 300, avgDuration: 25 },
    { type: 'Bisiklet', avgCalories: 250, avgDuration: 40 },
    { type: 'Yüzme', avgCalories: 400, avgDuration: 35 },
    { type: 'Yoga', avgCalories: 100, avgDuration: 45 },
    { type: 'Pilates', avgCalories: 120, avgDuration: 40 }
  ];
  
  const count = Math.floor(Math.random() * 3) + 1; // 1-3 aktivite
  const selectedActivities = activities
    .sort(() => 0.5 - Math.random())
    .slice(0, count);
    
  return selectedActivities.map(activity => ({
    type: activity.type,
    duration: activity.avgDuration + Math.floor(Math.random() * 20) - 10,
    calories: activity.avgCalories + Math.floor(Math.random() * 100) - 50,
    intensity: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)] as 'low' | 'medium' | 'high'
  }));
};
