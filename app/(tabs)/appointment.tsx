import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import ScreenWrapper from '@/components/ScreenWrapper'
import Typo from '@/components/Typo'
import { colors } from '@/constants/theme'

const appointment = () => {
  return (
    <ScreenWrapper>
      <Typo color={colors.white}>Randevular</Typo>
    </ScreenWrapper>
  )
}

export default appointment

const styles = StyleSheet.create({})