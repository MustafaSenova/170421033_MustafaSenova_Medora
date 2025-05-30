import { StyleSheet, View, ScrollView, TouchableOpacity } from 'react-native';
import React, { useState, useEffect } from 'react';
import ScreenWrapper from '@/components/ScreenWrapper';
import Typo from '@/components/Typo';
import { colors, spacingX, spacingY, radius } from '@/constants/theme';
import * as Icons from 'phosphor-react-native';
import { verticalScale } from '@/utils/styling';
import { useAuth } from '@/contexts/authContext';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { firestore } from '@/config/firebase';

// Example patient type
type PatientType = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  lastVisit?: string;
};

const PatientsScreen = () => {
  const { user } = useAuth();
  const [patients, setPatients] = useState<PatientType[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch patients data
  useEffect(() => {
    const fetchPatients = async () => {
      if (!user?.uid) return;
      
      setLoading(true);
      try {
        // This is just a placeholder for demonstration
        // In a real app, you'd query patients associated with this doctor
        const patientsRef = collection(firestore, "patients");
        const querySnapshot = await getDocs(patientsRef);
        
        const patientsList: PatientType[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          patientsList.push({
            id: doc.id,
            firstName: data.firstName || '',
            lastName: data.lastName || '',
            email: data.email || '',
            lastVisit: 'N/A',
          });
        });
        
        setPatients(patientsList);
      } catch (error) {
        console.error('Error fetching patients:', error);
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
        <Typo fontWeight="600">{patient.firstName} {patient.lastName}</Typo>
        <Typo size={14} color={colors.neutral400}>{patient.email}</Typo>
      </View>
      <Icons.CaretRight size={20} color={colors.neutral400} />
    </TouchableOpacity>
  );

  return (
    <ScreenWrapper>
      <View style={styles.header}>
        <Typo size={24} fontWeight="700">Hastalarım</Typo>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => console.log('Add new patient')}
        >
          <Icons.Plus size={20} color={colors.white} />
        </TouchableOpacity>
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
            <Typo style={styles.emptyText}>Henüz hasta kaydınız bulunmamaktadır.</Typo>
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
  addButton: {
    backgroundColor: colors.primary,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
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