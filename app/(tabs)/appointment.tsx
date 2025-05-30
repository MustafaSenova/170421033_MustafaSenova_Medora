import { StyleSheet, View, ScrollView, TouchableOpacity } from 'react-native';
import React, { useState, useEffect } from 'react';
import ScreenWrapper from '@/components/ScreenWrapper';
import Typo from '@/components/Typo';
import { colors, spacingX, spacingY, radius } from '@/constants/theme';
import * as Icons from 'phosphor-react-native';
import { verticalScale } from '@/utils/styling';
import { useAuth } from '@/contexts/authContext';

// Example appointment type
type Appointment = {
  id: string;
  patientName: string;
  date: string;
  time: string;
  reason: string;
  status: 'upcoming' | 'completed' | 'cancelled';
};

// Dummy data for appointments
const dummyAppointments: Appointment[] = [
  {
    id: '1',
    patientName: 'Ahmet Yılmaz',
    date: '24 Haziran 2023',
    time: '10:00',
    reason: 'Kontrol muayenesi',
    status: 'upcoming',
  },
  {
    id: '2',
    patientName: 'Zeynep Taş',
    date: '24 Haziran 2023',
    time: '11:30',
    reason: 'İlk muayene',
    status: 'upcoming',
  },
  {
    id: '3',
    patientName: 'Mehmet Demir',
    date: '24 Haziran 2023',
    time: '14:00',
    reason: 'Sonuç değerlendirme',
    status: 'upcoming',
  },
  {
    id: '4',
    patientName: 'Ayla Çelik',
    date: '23 Haziran 2023',
    time: '09:30',
    reason: 'Kontrol muayenesi',
    status: 'completed',
  },
  {
    id: '5',
    patientName: 'Kemal Yıldız',
    date: '22 Haziran 2023',
    time: '15:00',
    reason: 'Tetkik sonuçları',
    status: 'completed',
  },
];

const AppointmentScreen = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'completed'>('upcoming');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading appointments
    setLoading(true);
    setTimeout(() => {
      setAppointments(dummyAppointments);
      setLoading(false);
    }, 500);
  }, []);

  const filteredAppointments = appointments.filter(
    appointment => {
      if (activeTab === 'upcoming') {
        return appointment.status === 'upcoming';
      } else {
        return appointment.status === 'completed';
      }
    }
  );

  const renderAppointmentItem = (appointment: Appointment) => (
    <TouchableOpacity 
      key={appointment.id}
      style={styles.appointmentCard}
      onPress={() => console.log('View appointment details', appointment.id)}
    >
      <View style={styles.appointmentHeader}>
        <View style={styles.patientInfo}>
          <Typo fontWeight="600">{appointment.patientName}</Typo>
          <Typo size={13} color={colors.neutral400}>{appointment.reason}</Typo>
        </View>
        <View style={[
          styles.statusBadge, 
          { backgroundColor: appointment.status === 'upcoming' ? colors.primary + '30' : colors.primaryLight + '30' }
        ]}>
          <Typo 
            size={12} 
            fontWeight="500" 
            color={appointment.status === 'upcoming' ? colors.primary : colors.primaryLight}
          >
            {appointment.status === 'upcoming' ? 'Yaklaşan' : 'Tamamlandı'}
          </Typo>
        </View>
      </View>
      
      <View style={styles.appointmentDetails}>
        <View style={styles.detailItem}>
          <Icons.CalendarBlank size={16} color={colors.neutral400} />
          <Typo size={13} color={colors.neutral300} style={styles.detailText}>
            {appointment.date}
          </Typo>
        </View>
        <View style={styles.detailItem}>
          <Icons.Clock size={16} color={colors.neutral400} />
          <Typo size={13} color={colors.neutral300} style={styles.detailText}>
            {appointment.time}
          </Typo>
        </View>
      </View>
      
      {appointment.status === 'upcoming' && (
        <View style={styles.actionButtons}>
          <TouchableOpacity style={[styles.actionButton, styles.rescheduleButton]}>
            <Icons.CalendarPlus size={16} color={colors.primary} />
            <Typo size={12} color={colors.primary} style={styles.actionButtonText}>
              Yeniden Planla
            </Typo>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionButton, styles.cancelButton]}>
            <Icons.X size={16} color={colors.rose} />
            <Typo size={12} color={colors.rose} style={styles.actionButtonText}>
              İptal Et
            </Typo>
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <ScreenWrapper>
      <View style={styles.header}>
        <Typo size={24} fontWeight="700">Randevular</Typo>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => console.log('Add new appointment')}
        >
          <Icons.Plus size={20} color={colors.white} />
        </TouchableOpacity>
      </View>
      
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === 'upcoming' && styles.activeTabButton
          ]}
          onPress={() => setActiveTab('upcoming')}
        >
          <Typo
            size={14}
            fontWeight={activeTab === 'upcoming' ? '600' : 'normal'}
            color={activeTab === 'upcoming' ? colors.primary : colors.neutral400}
          >
            Yaklaşan
          </Typo>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === 'completed' && styles.activeTabButton
          ]}
          onPress={() => setActiveTab('completed')}
        >
          <Typo
            size={14}
            fontWeight={activeTab === 'completed' ? '600' : 'normal'}
            color={activeTab === 'completed' ? colors.primary : colors.neutral400}
          >
            Tamamlanan
          </Typo>
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.container}>
        {loading ? (
          <View style={styles.centered}>
            <Typo>Yükleniyor...</Typo>
          </View>
        ) : filteredAppointments.length > 0 ? (
          <View style={styles.appointmentsList}>
            {filteredAppointments.map(renderAppointmentItem)}
          </View>
        ) : (
          <View style={styles.centered}>
            <Icons.Calendar size={48} color={colors.neutral400} weight="duotone" />
            <Typo style={styles.emptyText}>
              {activeTab === 'upcoming' ? 'Yaklaşan randevunuz bulunmamaktadır.' : 'Tamamlanan randevunuz bulunmamaktadır.'}
            </Typo>
          </View>
        )}
      </ScrollView>
    </ScreenWrapper>
  );
};

export default AppointmentScreen;

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
  addButton: {
    backgroundColor: colors.primary,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabsContainer: {
    flexDirection: 'row',
    marginHorizontal: spacingX._20,
    marginBottom: spacingY._15,
    backgroundColor: colors.neutral800,
    borderRadius: 12,
    padding: 4,
  },
  tabButton: {
    flex: 1,
    paddingVertical: spacingY._10,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTabButton: {
    backgroundColor: colors.neutral700,
  },
  appointmentsList: {
    paddingHorizontal: spacingX._20,
    paddingBottom: spacingY._20,
  },
  appointmentCard: {
    backgroundColor: colors.neutral900,
    padding: spacingY._15,
    borderRadius: 12,
    marginBottom: spacingY._10,
  },
  appointmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacingY._10,
  },
  patientInfo: {
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  appointmentDetails: {
    flexDirection: 'row',
    marginBottom: spacingY._10,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: spacingX._15,
  },
  detailText: {
    marginLeft: 4,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: colors.neutral800,
    paddingTop: spacingY._10,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
  },
  actionButtonText: {
    marginLeft: 4,
  },
  rescheduleButton: {
    backgroundColor: colors.primary + '15',
  },
  cancelButton: {
    backgroundColor: colors.rose + '15',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: spacingY._60,
  },
  emptyText: {
    marginTop: spacingY._10,
    color: colors.neutral400,
    textAlign: 'center',
  },
});