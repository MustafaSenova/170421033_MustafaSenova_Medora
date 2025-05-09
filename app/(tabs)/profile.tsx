import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import Button from '@/components/Button'
import Typo from '@/components/Typo'
import { colors } from '@/constants/theme'
import { signOut } from 'firebase/auth'
import { auth } from '@/config/firebase'
import { useAuth } from '@/contexts/authContext'
import ScreenWrapper from '@/components/ScreenWrapper'

const profile = () => {
  const {user} = useAuth();

  console.log("user :",user)

  const handleLogout = async () => {
    await signOut(auth);
  };

  return (
    <ScreenWrapper>
      <Text>profile</Text>
      <Button onPress={handleLogout}>
        <Typo color={colors.white}>Çıkış Yap</Typo>
      </Button>
    </ScreenWrapper>
  )
}

export default profile

const styles = StyleSheet.create({})