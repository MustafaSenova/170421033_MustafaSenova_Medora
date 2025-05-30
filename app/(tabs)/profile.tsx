import { StyleSheet, View, TouchableOpacity, ScrollView, Alert, Image, ActivityIndicator } from 'react-native';
import React, { useState, useEffect } from 'react';
import ScreenWrapper from '@/components/ScreenWrapper';
import Typo from '@/components/Typo';
import Button from '@/components/Button';
import { colors, spacingX, spacingY, radius } from '@/constants/theme';
import { auth } from '@/config/firebase';
import { useAuth } from '@/contexts/authContext';
import ProfileInputField from '@/components/ProfileInputField';
import DatePickerField from '@/components/DatePickerField';
import SelectField from '@/components/SelectField';
import * as Icons from 'phosphor-react-native';
import { verticalScale } from '@/utils/styling';
import { SettingsSection, SettingItem } from '@/components/SettingsSection';
import { UserHealthProfile } from '@/types';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';

const ProfileScreen = () => {
  const { user, updateHealthProfile, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState<UserHealthProfile>({
    age: null,
    weight: null,
    height: null,
    gender: null,
    birthDate: '',
    bloodType: '',
    allergies: [],
    chronicConditions: [],
    emergencyContact: {
      name: '',
      phone: '',
      relationship: '',
    },
    lastUpdated: new Date().toISOString(),
  });

  // Avatar state
  const [profileImage, setProfileImage] = useState<string | null>(
    user?.image || null
  );

  // Load user data on mount
  useEffect(() => {
    if (user?.healthProfile) {
      setFormData(user.healthProfile);
    } else {
      // Show onboarding if no health profile exists
      setShowOnboarding(true);
      setIsEditing(true);
    }
  }, [user]);

  const handleLogout = async () => {
    try {
      const result = await logout();
      
      if (!result.success) {
        Alert.alert('Hata', result.msg || 'Çıkış yapılırken bir hata oluştu.');
      }
    } catch (error) {
      console.error('Logout error:', error);
      Alert.alert('Hata', 'Çıkış yapılırken bir hata oluştu.');
    }
  };

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setProfileImage(result.assets[0].uri);
      // Update profile image logic would go here
    }
  };

  const handleSave = async () => {
    if (!user?.uid) return;
    
    setLoading(true);
    
    try {
      // Calculate age from birthDate if available
      if (formData.birthDate && (formData.age === undefined || formData.age === null)) {
        const birthDate = new Date(formData.birthDate);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
          age--;
        }
        formData.age = age;
      }
      
      formData.lastUpdated = new Date().toISOString();
      
      // Prepare data for Firebase compatibility by converting undefined to null
      const preparedData = { ...formData };
      if (preparedData.age === undefined) preparedData.age = null;
      if (preparedData.weight === undefined) preparedData.weight = null;
      if (preparedData.height === undefined) preparedData.height = null;
      if (preparedData.gender === undefined) preparedData.gender = null;
      if (!preparedData.birthDate) preparedData.birthDate = '';
      if (!preparedData.bloodType) preparedData.bloodType = '';
      
      const result = await updateHealthProfile(user.uid, preparedData);
      
      if (result.success) {
        setIsEditing(false);
        setShowOnboarding(false);
        Alert.alert('Başarılı', 'Sağlık profiliniz başarıyla güncellendi.');
      } else {
        Alert.alert('Hata', result.msg || 'Profil güncellenirken bir hata oluştu.');
      }
    } catch (error) {
      console.error('Save error:', error);
      Alert.alert('Hata', 'Profil güncellenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (showOnboarding) {
      // If onboarding, we can't cancel, just skip some fields
      handleSave();
    } else {
      // Reset form data to original user data
      if (user?.healthProfile) {
        setFormData(user.healthProfile);
      }
      setIsEditing(false);
    }
  };

  const genderOptions = [
    { label: 'Erkek', value: 'male' },
    { label: 'Kadın', value: 'female' },
    { label: 'Diğer', value: 'other' },
  ];

  const bloodTypeOptions = [
    { label: 'A+', value: 'A+' },
    { label: 'A-', value: 'A-' },
    { label: 'B+', value: 'B+' },
    { label: 'B-', value: 'B-' },
    { label: 'AB+', value: 'AB+' },
    { label: 'AB-', value: 'AB-' },
    { label: 'O+', value: 'O+' },
    { label: '0-', value: 'O-' },
  ];

  const renderProfileHeader = () => (
    <View style={styles.profileHeader}>
      <TouchableOpacity style={styles.avatarContainer} onPress={handlePickImage}>
        {profileImage ? (
          <Image source={{ uri: profileImage }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Icons.User size={verticalScale(40)} color={colors.white} weight="thin" />
          </View>
        )}
        <View style={styles.editAvatarButton}>
          <Icons.PencilSimple size={verticalScale(16)} color={colors.white} />
        </View>
      </TouchableOpacity>
      
      <View style={styles.nameContainer}>
        <Typo size={20} fontWeight="600">
          {user?.firstName} {user?.lastName}
        </Typo>
        <Typo size={14} color={colors.textLighter}>
          {user?.email}
        </Typo>
      </View>
    </View>
  );

  const renderOnboardingHeader = () => (
    <View style={styles.onboardingHeader}>
      <Icons.Heartbeat size={verticalScale(40)} color={colors.primary} weight="fill" />
      <Typo size={20} fontWeight="600" style={styles.onboardingTitle}>
        Sağlık Profilinizi Tamamlayın
      </Typo>
      <Typo size={14} color={colors.textLighter} style={styles.onboardingSubtitle}>
        Size daha iyi hizmet verebilmemiz için lütfen sağlık bilgilerinizi girin.
      </Typo>
    </View>
  );

  const renderHealthProfileForm = () => (
    <View style={styles.formContainer}>
      <SelectField
        label="Cinsiyet"
        value={formData.gender || ''}
        options={genderOptions}
        onChange={(value) => setFormData({ ...formData, gender: value as 'male' | 'female' | 'other' })}
      />
      
      <DatePickerField
        label="Doğum Tarihi"
        value={formData.birthDate ? new Date(formData.birthDate) : undefined}
        onChange={(date) => 
          setFormData({ 
            ...formData, 
            birthDate: date ? date.toISOString() : '' 
          })
        }
        maximumDate={new Date()}
      />
      
      <ProfileInputField
        label="Boy (cm)"
        value={formData.height?.toString() || ''}
        onChangeText={(text) => 
          setFormData({ ...formData, height: text ? Number(text) : null })
        }
        keyboardType="numeric"
        placeholder="175"
      />
      
      <ProfileInputField
        label="Kilo (kg)"
        value={formData.weight?.toString() || ''}
        onChangeText={(text) => 
          setFormData({ ...formData, weight: text ? Number(text) : null })
        }
        keyboardType="numeric"
        placeholder="70"
      />
      
      <SelectField
        label="Kan Grubu"
        value={formData.bloodType || ''}
        options={bloodTypeOptions}
        onChange={(value) => setFormData({ ...formData, bloodType: value })}
      />
      
      <ProfileInputField
        label="Alerjiler"
        value={(formData.allergies || []).join(', ')}
        onChangeText={(text) => 
          setFormData({ 
            ...formData, 
            allergies: text.split(',').map(item => item.trim()).filter(Boolean)
          })
        }
        placeholder="Penisilin, polen, vb."
      />
      
      <ProfileInputField
        label="Kronik Rahatsızlıklar"
        value={(formData.chronicConditions || []).join(', ')}
        onChangeText={(text) => 
          setFormData({ 
            ...formData, 
            chronicConditions: text.split(',').map(item => item.trim()).filter(Boolean)
          })
        }
        placeholder="Diyabet, hipertansiyon, vb."
      />
      
      <Typo size={14} fontWeight="600" style={styles.sectionTitle}>
        Acil Durum İletişim Bilgileri
      </Typo>
      
      <ProfileInputField
        label="İsim Soyisim"
        value={formData.emergencyContact?.name || ''}
        onChangeText={(text) => 
          setFormData({ 
            ...formData, 
            emergencyContact: { 
              ...formData.emergencyContact as any, 
              name: text 
            } 
          })
        }
        placeholder="Acil durumda aranacak kişi"
      />
      
      <ProfileInputField
        label="Telefon"
        value={formData.emergencyContact?.phone || ''}
        onChangeText={(text) => 
          setFormData({ 
            ...formData, 
            emergencyContact: { 
              ...formData.emergencyContact as any, 
              phone: text 
            } 
          })
        }
        keyboardType="phone-pad"
        placeholder="0555 555 55 55"
      />
      
      <ProfileInputField
        label="Yakınlık Derecesi"
        value={formData.emergencyContact?.relationship || ''}
        onChangeText={(text) => 
          setFormData({ 
            ...formData, 
            emergencyContact: { 
              ...formData.emergencyContact as any, 
              relationship: text 
            } 
          })
        }
        placeholder="Eş, anne, baba, çocuk, vb."
      />
      
      <View style={styles.formButtons}>
        <Button 
          style={[styles.formButton, styles.cancelButton] as any} 
          onPress={handleCancel}
        >
          <Typo>{showOnboarding ? 'Atla' : 'İptal'}</Typo>
        </Button>
        <Button style={styles.formButton} onPress={handleSave}>
          {loading ? (
            <ActivityIndicator color={colors.white} size="small" />
          ) : (
            <Typo>Kaydet</Typo>
          )}
        </Button>
      </View>
    </View>
  );

  const renderSettings = () => (
    <View style={styles.settingsContainer}>
      <SettingsSection title="Sağlık Profili">
        <SettingItem
          icon={<Icons.Heartbeat size={verticalScale(20)} color={colors.primary} />}
          title="Sağlık Bilgilerim"
          subtitle="Boy, kilo, kan grubu, vb."
          onPress={() => setIsEditing(true)}
        />
        <SettingItem
          icon={<Icons.ChartLine size={verticalScale(20)} color={colors.primary} />}
          title="Sağlık Verilerim"
          subtitle="Tansiyon, nabız, vb."
          onPress={() => router.push('/(tabs)/health-data')}
        />
      </SettingsSection>
      
      <SettingsSection title="Hesap Ayarları">
        <SettingItem
          icon={<Icons.Bell size={verticalScale(20)} color={colors.textLighter} />}
          title="Bildirimler"
          onPress={() => {}}
        />
        <SettingItem
          icon={<Icons.Lock size={verticalScale(20)} color={colors.textLighter} />}
          title="Güvenlik ve Gizlilik"
          onPress={() => router.push('/(tabs)/security')}
        />
        <SettingItem
          icon={<Icons.SignOut size={verticalScale(20)} color={colors.rose} />}
          title="Çıkış Yap"
          onPress={handleLogout}
          showArrow={false}
        />
      </SettingsSection>
      
      <SettingsSection title="Hakkında">
        <SettingItem
          icon={<Icons.Info size={verticalScale(20)} color={colors.textLighter} />}
          title="Uygulama Bilgisi"
          subtitle="Versiyon 1.0.0"
          onPress={() => {}}
        />
        <SettingItem
          icon={<Icons.FileText size={verticalScale(20)} color={colors.textLighter} />}
          title="Gizlilik Politikası"
          onPress={() => {}}
        />
        <SettingItem
          icon={<Icons.Question size={verticalScale(20)} color={colors.textLighter} />}
          title="Yardım ve Destek"
          onPress={() => {}}
        />
      </SettingsSection>
    </View>
  );

  return (
    <ScreenWrapper>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {showOnboarding ? renderOnboardingHeader() : renderProfileHeader()}
        
        {isEditing ? renderHealthProfileForm() : renderSettings()}
      </ScrollView>
    </ScreenWrapper>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    paddingBottom: spacingY._30,
  },
  profileHeader: {
    alignItems: 'center',
    marginTop: spacingY._20,
    marginBottom: spacingY._30,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: spacingY._15,
  },
  avatar: {
    width: verticalScale(100),
    height: verticalScale(100),
    borderRadius: verticalScale(50),
    borderWidth: 2,
    borderColor: colors.primary,
  },
  avatarPlaceholder: {
    width: verticalScale(100),
    height: verticalScale(100),
    borderRadius: verticalScale(50),
    backgroundColor: colors.neutral700,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.primary,
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: colors.primary,
    width: verticalScale(32),
    height: verticalScale(32),
    borderRadius: verticalScale(16),
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.neutral900,
  },
  nameContainer: {
    alignItems: 'center',
  },
  onboardingHeader: {
    alignItems: 'center',
    marginVertical: spacingY._20,
  },
  onboardingTitle: {
    marginTop: spacingY._10,
  },
  onboardingSubtitle: {
    marginTop: spacingY._5,
    textAlign: 'center',
    paddingHorizontal: spacingX._20,
  },
  formContainer: {
    paddingHorizontal: spacingX._15,
  },
  sectionTitle: {
    marginTop: spacingY._20,
    marginBottom: spacingY._10,
  },
  formButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacingY._25,
  },
  formButton: {
    flex: 1,
    marginHorizontal: spacingX._5,
  },
  cancelButton: {
    backgroundColor: colors.neutral700,
  },
  settingsContainer: {
    paddingHorizontal: spacingX._15,
  },
});