import React from 'react'
import { View, Text, StyleSheet } from 'react-native'

export type AvatarState = 'idle' | 'celebrate' | 'sad' | 'thinking' | 'wave' | 'point'

interface AvatarProps {
  state?: AvatarState
  size?: number
}

const EMOJIS: Record<AvatarState, string> = {
  idle: '🍽️',
  celebrate: '🎉',
  sad: '😔',
  thinking: '🤔',
  wave: '👋',
  point: '👉',
}

export function Avatar({ state = 'idle', size = 80 }: AvatarProps) {
  return (
    <View style={[styles.container, { width: size, height: size, borderRadius: size / 2 }]}>
      <Text style={{ fontSize: size * 0.5 }}>{EMOJIS[state]}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F0F0F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
})