// app/(tabs)/predict.tsx
import { useState } from 'react';
import { View, ScrollView, Switch, StyleSheet } from 'react-native';
import Button from '@/components/Button';
import Input from '@/components/Input';
import Typo from '@/components/Typo';
import { colors, spacingX, spacingY } from '@/constants/theme';
import { verticalScale } from '@/utils/styling';
import * as Icons from 'phosphor-react-native'
import ScreenWrapper from '@/components/ScreenWrapper';


const PredictScreen = () => {
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
        <View style={styles.form}>
          <Typo size={24} fontWeight="800" style={styles.title}>
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

export default PredictScreen;

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingHorizontal: spacingX._20,
    paddingTop: spacingY._20,
    paddingBottom: spacingY._40,
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