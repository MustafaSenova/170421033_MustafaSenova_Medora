import { Alert, Pressable, StyleSheet, Text, View } from 'react-native'
import React, { useRef, useState } from 'react'
import ScreenWrapper from '@/components/ScreenWrapper'
import Typo from '@/components/Typo'
import { colors, spacingX, spacingY } from '@/constants/theme'
import { verticalScale } from '@/utils/styling'
import BackButton from '@/components/BackButton'
import Input from '@/components/Input'
import * as Icons from 'phosphor-react-native'
import Button from '@/components/Button'
import { useRouter } from 'expo-router'

const Login = () => {

  const emailRef = useRef("");
  const passwordRef = useRef("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async () => {
    if(!emailRef.current || !passwordRef.current ){
      Alert.alert('Giriş Yap',"Lütfen tüm alanları doldurun");
      return;
    }

  }



  return (
    <ScreenWrapper>
      <View style={styles.container}>
        <BackButton iconSize={28}></BackButton>

        <View style={{ gap: 5, marginTop: spacingY._20 }}>
          <Typo size={30} fontWeight={"800"}>
            Merhaba,
          </Typo>
          <Typo size={30} fontWeight={"800"}>
            Tekrar Hoş Geldin
          </Typo>

        </View>

        <View style={styles.form}>
          <Typo size={14} color={colors.textLighter}>
            Sağlık verilerinizi takip etmek için giriş yapınız
          </Typo>
          <Input
            placeholder='Mailinizi giriniz'
            onChangeText={(value) => (emailRef.current = value)}
            icon={<Icons.At size={verticalScale(26)} color={colors.neutral350} weight='fill' />}


          />
          <Input
            placeholder='Şifrenizi giriniz'
            secureTextEntry
            onChangeText={(value) => (passwordRef.current = value)}
            icon={<Icons.Lock size={verticalScale(26)} color={colors.neutral350} weight='fill' />}


          />

          <Typo size={14} color={colors.text} style={{ alignSelf: 'flex-end' }}>Şifremi Unuttum</Typo>

          <Button loading={isLoading} onPress={handleSubmit}>
            <Typo fontWeight={"700"} color={colors.black} size={21}>
              Giriş Yap

            </Typo>

          </Button>
        </View>

        <View style={styles.footer}>
          <Typo size={15}>Hesabınız yok mu?</Typo>
          <Pressable onPress={()=> router.navigate("/(auth)/register")}>
            <Typo size={15} fontWeight={'700'} color={colors.primary}>Kayıt Olun</Typo>

          </Pressable>



        </View>

      </View>
    </ScreenWrapper>
  )
}

export default Login

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: spacingY._30,
    paddingHorizontal: spacingX._20,
  },
  welcomeText: {
    fontSize: verticalScale(20),
    fontWeight: "bold",
    color: colors.text,
  },
  form: {
    gap: spacingY._20,
  },
  forgotPassword: {
    textAlign: "right",
    fontWeight: "500",
    color: colors.text,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 5,
  },
  footerText: {
    textAlign: "center",
    color: colors.text,
    fontSize: verticalScale(15),
  }


})