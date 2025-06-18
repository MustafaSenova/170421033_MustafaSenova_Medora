import { StyleSheet, View, ScrollView, TouchableOpacity, Alert } from 'react-native';
import React, { useState, useEffect } from 'react';
import ScreenWrapper from '@/components/ScreenWrapper';
import Typo from '@/components/Typo';
import { colors, spacingX, spacingY, radius } from '@/constants/theme';
import * as Icons from 'phosphor-react-native';
import { verticalScale } from '@/utils/styling';
import { useAuth } from '@/contexts/authContext';
import { appointmentService } from '@/services/appointmentService';
import { Appointment } from '@/types/appointment';

// Patient type derived from appointments
type PatientType = {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  lastVisit?: Date;
  totalAppointments: number;
  upcomingAppointments: number;
};

const PatientsScreen = () => {
  const { user } = useAuth();
  const [patients, setPatients] = useState<PatientType[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch patients data from appointments
  useEffect(() => {
    const fetchPatients = async () => {
      if (!user?.uid) return;
      
      setLoading(true);
      try {
        // Get all appointments for this doctor
        const appointments = await appointmentService.getAppointments({
          doctorId: user.uid
        });

        // Group appointments by patient
        const patientMap = new Map<string, PatientType>();
        
        appointments.forEach((appointment: Appointment) => {
          const patientId = appointment.patientId;
          
          if (patientMap.has(patientId)) {
            const patient = patientMap.get(patientId)!;
            patient.totalAppointments++;
            
            // Update last visit if this appointment is more recent
            if (appointment.status === 'completed' && 
                (!patient.lastVisit || appointment.date > patient.lastVisit)) {
              patient.lastVisit = appointment.date;
            }
            
            // Count upcoming appointments
            if (appointment.status === 'confirmed' && appointment.date > new Date()) {
              patient.upcomingAppointments++;
            }
          } else {
            patientMap.set(patientId, {
              id: patientId,
              name: appointment.patientName || `Hasta ${patientId.slice(-4)}`,
              email: appointment.patientEmail,
              phone: appointment.patientPhone,
              lastVisit: appointment.status === 'completed' ? appointment.date : undefined,
              totalAppointments: 1,
              upcomingAppointments: appointment.status === 'confirmed' && appointment.date > new Date() ? 1 : 0
            });
          }
        });
        
        setPatients(Array.from(patientMap.values()));
      } catch (error) {
        console.error('Error fetching patients:', error);
        Alert.alert('Hata', 'Hasta bilgileri yüklenirken bir hata oluştu.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchPatients();
  }, [user]);

  const renderPatientItem = (patient: PatientType) => (
    <TouchableOpacity 
      key={patient.id}
      style={styles.patientCard}
      onPress={() => console.log('View patient details', patient.id)}
    >
      <View style={styles.patientIcon}>
        <Icons.User size={24} color={colors.primary} weight="duotone" />
      </View>
      <View style={styles.patientInfo}>
        <Typo fontWeight="600">{patient.name}</Typo>
        {patient.email && (
          <Typo size={14} color={colors.neutral400}>{patient.email}</Typo>
        )}
        <View style={styles.patientStats}>
          <Typo size={12} color={colors.neutral400}>
            {patient.totalAppointments} randevu
          </Typo>
          {patient.upcomingAppointments > 0 && (
            <Typo size={12} color={colors.primary}>
              • {patient.upcomingAppointments} yaklaşan
            </Typo>
          )}
        </View>
        {patient.lastVisit && (
          <Typo size={12} color={colors.neutral500}>
            Son ziyaret: {patient.lastVisit.toLocaleDateString('tr-TR')}
          </Typo>
        )}
      </View>
      <Icons.CaretRight size={20} color={colors.neutral400} />
    </TouchableOpacity>
  );

  return (
    <ScreenWrapper>
      <View style={styles.header}>
        <Typo size={24} fontWeight="700">Hastalarım</Typo>
        <View style={styles.headerStats}>
          <Typo size={14} color={colors.neutral400}>
            {patients.length} hasta
          </Typo>
        </View>
      </View>
      
      <ScrollView style={styles.container}>
        {loading ? (
          <View style={styles.centered}>
            <Typo>Yükleniyor...</Typo>
          </View>
        ) : patients.length > 0 ? (
          <View style={styles.patientsList}>
            {patients.map(renderPatientItem)}
          </View>
        ) : (
          <View style={styles.centered}>
            <Icons.UsersFour size={48} color={colors.neutral400} weight="duotone" />
            <Typo style={styles.emptyText}>Henüz hasta randevunuz bulunmamaktadır.</Typo>
            <Typo size={14} color={colors.neutral500} style={styles.emptySubtext}>
              Randevular sayfasından randevu taleplerini yönetebilirsiniz.
            </Typo>
          </View>
        )}
      </ScrollView>
    </ScreenWrapper>
  );
};

export default PatientsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacingX._20,
    paddingVertical: spacingY._20,
  },
  headerStats: {
    alignItems: 'flex-end',
  },
  patientsList: {
    paddingHorizontal: spacingX._20,
    paddingBottom: spacingY._20,
  },
  patientCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutral900,
    padding: spacingY._15,
    borderRadius: 12,
    marginBottom: spacingY._10,
  },
  patientIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.neutral800,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacingX._15,
  },
  patientInfo: {
    flex: 1,
    gap: spacingY._2,
  },
  patientStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacingX._5,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: spacingY._60,
    paddingHorizontal: spacingX._20,
  },
  emptyText: {
    marginTop: spacingY._10,
    color: colors.neutral400,
    textAlign: 'center',
  },
  emptySubtext: {
    marginTop: spacingY._5,
    textAlign: 'center',
  },
}); 