import React from 'react'
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native'

export type AvatarState = 'idle' | 'celebrate' | 'sad' | 'thinking' | 'wave' | 'point'

interface AvatarProps {
  state?: AvatarState
  size?: number
  imageUrl?: string | null
  onPress?: () => void
  style?: any
}

const EMOJIS: Record<AvatarState, string> = {
  idle: '🍽️',
  celebrate: '🎉',
  sad: '😔',
  thinking: '🤔',
  wave: '👋',
  point: '👉',
}

export function Avatar({ state = 'idle', size = 80, imageUrl, onPress, style }: AvatarProps) {
  const Container = onPress ? TouchableOpacity : View;

  return (
    <Container 
      style={[styles.container, { width: size, height: size, borderRadius: size / 2 }, style]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {imageUrl ? (
        <Image 
          source={{ uri: imageUrl }} 
          style={{ width: size, height: size, borderRadius: size / 2 }}
          resizeMode="cover"
        />
      ) : (
        <Text style={{ fontSize: size * 0.5 }}>{EMOJIS[state]}</Text>
      )}
    </Container>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F0F0F0',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
})