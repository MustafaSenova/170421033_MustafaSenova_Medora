// app/(tabs)/predict.tsx
import { useState } from 'react';
import { View, ScrollView, Switch, StyleSheet, TouchableOpacity } from 'react-native';
import Button from '@/components/Button';
import Input from '@/components/Input';
import Typo from '@/components/Typo';
import { colors, spacingX, spacingY } from '@/constants/theme';
import { verticalScale } from '@/utils/styling';
import * as Icons from 'phosphor-react-native'
import ScreenWrapper from '@/components/ScreenWrapper';
import { useAuth } from '@/contexts/authContext';
import { useRouter } from 'expo-router';

const HomeScreen = () => {
  const { user } = useAuth();
  const router = useRouter();
  const isDoctor = user?.role === 'doctor';

  if (isDoctor) {
    return <DoctorHomeScreen />;
  } else {
    return <PatientHomeScreen />;
  }
};

const DoctorHomeScreen = () => {
  const { user } = useAuth();
  const router = useRouter();

  const doctorMenuItems = [
    {
      title: 'Hastalarım',
      subtitle: 'Hasta listemi ve bilgilerini görüntüle',
      icon: <Icons.Users size={verticalScale(32)} color={colors.primary} weight="fill" />,
      onPress: () => router.push('/(tabs)/patients'),
      bgColor: colors.neutral800,
    },
    {
      title: 'Randevular',
      subtitle: 'Günlük randevularımı ve programımı görüntüle',
      icon: <Icons.Calendar size={verticalScale(32)} color={colors.green} weight="fill" />,
      onPress: () => router.push('/(tabs)/appointment'),
      bgColor: colors.neutral800,
    },
    {
      title: 'Mesajlar',
      subtitle: 'Hasta mesajlarını ve iletişimimi yönet',
      icon: <Icons.ChatCircleText size={verticalScale(32)} color={colors.primaryLight} weight="fill" />,
      onPress: () => router.push('/(tabs)/messages'),
      bgColor: colors.neutral800,
    },
    {
      title: 'Profil Ayarları',
      subtitle: 'Doktor profilimi ve ayarlarımı düzenle',
      icon: <Icons.UserGear size={verticalScale(32)} color={colors.rose} weight="fill" />,
      onPress: () => router.push('/(tabs)/profile'),
      bgColor: colors.neutral800,
    },
  ];

  return (
    <ScreenWrapper>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Typo size={28} fontWeight="800" color={colors.white}>
            Hoş Geldiniz,
          </Typo>
          <Typo size={22} fontWeight="600" color={colors.primary}>
            Dr. {user?.firstName} {user?.lastName}
          </Typo>
          {user?.doctorProfile?.specialization && (
            <Typo size={14} color={colors.textLighter}>
              {user.doctorProfile.specialization} • {user?.doctorProfile?.hospital}
            </Typo>
          )}
        </View>

        <View style={styles.menuGrid}>
          {doctorMenuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.menuItem, { backgroundColor: item.bgColor }]}
              onPress={item.onPress}
            >
              <View style={styles.menuIcon}>
                {item.icon}
              </View>
              <View style={styles.menuContent}>
                <Typo size={16} fontWeight="700" color={colors.text}>
                  {item.title}
                </Typo>
                <Typo size={12} color={colors.textLighter} textProps={{ numberOfLines: 2 }}>
                  {item.subtitle}
                </Typo>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
};

const PatientHomeScreen = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    age: '',
    height: '',
    weight: '',
    ap_hi: '',
    ap_lo: '',
    cholesterol: '1', // 1: normal, 2: yüksek, 3: çok yüksek
    gluc: '1', // 1: normal, 2: yüksek, 3: çok yüksek
    smoke: false,
    alco: false,
    active: false,
  });

  const handlePredict = async () => {
    // Tahmin işlemleri burada
  };

  return (
    <ScreenWrapper>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.patientHeader}>
          <Typo size={24} fontWeight="800" color={colors.white}>
            Merhaba, {user?.firstName}
          </Typo>
          <Typo size={14} color={colors.textLighter}>
            Sağlık verilerinizi takip edin ve risk analizlerinizi yapın
          </Typo>
        </View>

        <View style={styles.form}>
          <Typo size={20} fontWeight="800" style={styles.title}>
            Kardiyovasküler Risk Tahmini
          </Typo>
          <Typo size={14} color={colors.textLighter} style={styles.subtitle}>
            Sağlık verilerinizi girerek risk seviyenizi öğrenebilirsiniz.
          </Typo>

          <Input
            placeholder="Yaş"
            keyboardType="numeric"
            onChangeText={v => setFormData({ ...formData, age: v })}
            icon={<Icons.User size={verticalScale(26)} color={colors.neutral350} weight="fill" />}
          />

          <Input
            placeholder="Boy (cm)"
            keyboardType="numeric"
            onChangeText={v => setFormData({ ...formData, height: v })}
            icon={<Icons.Ruler size={verticalScale(26)} color={colors.neutral350} weight="fill" />}
          />

          <Input
            placeholder="Kilo (kg)"
            keyboardType="numeric"
            onChangeText={v => setFormData({ ...formData, weight: v })}
            icon={<Icons.Scales size={verticalScale(26)} color={colors.neutral350} weight="fill" />}
          />

          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Typo size={14} color={colors.textLighter} style={styles.inputLabel}>
                Üst Tansiyon (Sistolik)
              </Typo>
              <Input
                placeholder="Örnek: 120"
                keyboardType="numeric"
                onChangeText={v => setFormData({ ...formData, ap_hi: v })}
                icon={<Icons.ArrowUp size={verticalScale(26)} color={colors.neutral350} weight="fill" />}
              />
            </View>

            <View style={{ flex: 1 }}>
              <Typo size={14} color={colors.textLighter} style={styles.inputLabel}>
                Alt Tansiyon (Diyastolik)
              </Typo>
              <Input
                placeholder="Örnek: 80"
                keyboardType="numeric"
                onChangeText={v => setFormData({ ...formData, ap_lo: v })}
                icon={<Icons.ArrowDown size={verticalScale(26)} color={colors.neutral350} weight="fill" />}
              />
            </View>
          </View>

          <View style={styles.switchContainer}>
            <Typo size={14} color={colors.text}>Sigara Kullanıyorum:</Typo>
            <Switch
              value={formData.smoke}
              onValueChange={v => setFormData({ ...formData, smoke: v })}
              trackColor={{ false: colors.neutral200, true: colors.primary }}
              thumbColor={formData.smoke ? colors.white : colors.neutral400}
            />
          </View>

          <View style={styles.switchContainer}>
            <Typo size={14} color={colors.text}>Alkol Kullanıyorum:</Typo>
            <Switch
              value={formData.alco}
              onValueChange={v => setFormData({ ...formData, alco: v })}
              trackColor={{ false: colors.neutral200, true: colors.primary }}
              thumbColor={formData.alco ? colors.white : colors.neutral400}
            />
          </View>

          <View style={styles.switchContainer}>
            <Typo size={14} color={colors.text}>Fiziksel Olarak Aktifim:</Typo>
            <Switch
              value={formData.active}
              onValueChange={v => setFormData({ ...formData, active: v })}
              trackColor={{ false: colors.neutral200, true: colors.primary }}
              thumbColor={formData.active ? colors.white : colors.neutral400}
            />
          </View>

          <Button onPress={handlePredict} style={styles.button}>
            <Typo fontWeight="700" color={colors.black} size={18}>
              Riskimi Hesapla
            </Typo>
          </Button>
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingHorizontal: spacingX._20,
    paddingTop: spacingY._20,
    paddingBottom: spacingY._40,
  },
  header: {
    marginBottom: spacingY._30,
    paddingVertical: spacingY._20,
  },
  patientHeader: {
    marginBottom: spacingY._20,
    paddingVertical: spacingY._15,
  },
  menuGrid: {
    gap: spacingY._15,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacingX._15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.neutral600,
  },
  menuIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.neutral700,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacingX._15,
  },
  menuContent: {
    flex: 1,
    gap: 4,
  },
  form: {
    gap: spacingY._20,
  },
  title: {
    marginBottom: spacingY._10,
  },
  subtitle: {
    marginBottom: spacingY._20,
  },
  row: {
    flexDirection: 'row',
    gap: spacingX._10,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacingY._10,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral200,
  },
  button: {
    marginTop: spacingY._20,
  },
  inputLabel: {
    marginBottom: spacingY._5,
  },
});