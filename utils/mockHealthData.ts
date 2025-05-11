/**
 * Gerçek Google Fit API yerine test için kullanılan sahte veriler
 */

export type HeartRateResponse = {
  startDate: string;
  endDate: string;
  value: number;
  dataSources?: string[];
};

export type BloodPressureResponse = {
  startDate: string;
  endDate: string;
  systolic: number;
  diastolic: number;
};

export type WeightResponse = {
  startDate: string;
  endDate: string;
  value: number;
};

export interface HealthDataResponse {
  heartRate: HeartRateResponse[];
  bloodPressure: BloodPressureResponse[];
  bodyMetrics: {
    weight: WeightResponse[];
    height: WeightResponse[];
  };
}

// Sahte bağlantı durumu (Google Fit bağlantısı simülasyonu)
let mockConnected = false;

/**
 * Sahte Google Fit bağlantısı
 */
export const connectMockHealthService = async (): Promise<{ success: boolean; message?: string }> => {
  return new Promise((resolve) => {
    // 1 saniye sonra bağlantı başarılı olsun
    setTimeout(() => {
      mockConnected = true;
      resolve({ success: true });
    }, 1000);
  });
};

/**
 * Sahte kalp atış hızı verileri
 */
export const getMockHeartRateData = (): HeartRateResponse[] => {
  const now = new Date();
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  
  return [
    {
      startDate: yesterday.toISOString(),
      endDate: new Date(yesterday.getTime() + 1000 * 60 * 10).toISOString(),
      value: 72,
    },
    {
      startDate: new Date(yesterday.getTime() + 1000 * 60 * 60).toISOString(),
      endDate: new Date(yesterday.getTime() + 1000 * 60 * 70).toISOString(),
      value: 104, // Taşikardi örneği
    },
    {
      startDate: new Date(now.getTime() - 1000 * 60 * 60).toISOString(),
      endDate: now.toISOString(),
      value: 88,
    },
  ];
};

/**
 * Sahte kan basıncı verileri
 */
export const getMockBloodPressureData = (): BloodPressureResponse[] => {
  const now = new Date();
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  
  return [
    {
      startDate: yesterday.toISOString(),
      endDate: new Date(yesterday.getTime() + 1000 * 60 * 10).toISOString(),
      systolic: 120,
      diastolic: 80,
    },
    {
      startDate: new Date(yesterday.getTime() + 1000 * 60 * 60).toISOString(),
      endDate: new Date(yesterday.getTime() + 1000 * 60 * 70).toISOString(),
      systolic: 140,
      diastolic: 95, // Hipertansiyon örneği
    },
    {
      startDate: new Date(now.getTime() - 1000 * 60 * 60).toISOString(),
      endDate: now.toISOString(),
      systolic: 115,
      diastolic: 75,
    },
  ];
};

/**
 * Sahte vücut ölçüm verileri
 */
export const getMockBodyMetricsData = () => {
  const now = new Date();
  const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  
  return {
    weight: [
      {
        startDate: lastWeek.toISOString(),
        endDate: lastWeek.toISOString(),
        value: 75.5,
      },
      {
        startDate: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        endDate: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        value: 76.2,
      },
      {
        startDate: now.toISOString(),
        endDate: now.toISOString(),
        value: 75.0,
      },
    ],
    height: [
      {
        startDate: lastWeek.toISOString(),
        endDate: lastWeek.toISOString(),
        value: 1.78,
      },
    ],
  };
};

/**
 * Tüm sahte sağlık verilerini getir
 */
export const fetchAllMockHealthData = async (): Promise<{
  success: boolean;
  message?: string;
  data?: HealthDataResponse;
}> => {
  return new Promise((resolve) => {
    // Veri çekme işlemini simüle etmek için 1 saniye beklet
    setTimeout(() => {
      if (!mockConnected) {
        resolve({ success: false, message: 'Sağlık servisi bağlantısı kurulmadı' });
        return;
      }
      
      resolve({
        success: true,
        data: {
          heartRate: getMockHeartRateData(),
          bloodPressure: getMockBloodPressureData(),
          bodyMetrics: getMockBodyMetricsData(),
        }
      });
    }, 1000);
  });
}; 