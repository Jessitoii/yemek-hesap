import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '@/constants/colors';
import { typography } from '@/constants/typography';

interface ProfileSectionProps {
  title: string;
  children: React.ReactNode;
}

export const ProfileSection: React.FC<ProfileSectionProps> = ({ title, children }) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.accent} />
        <Text style={styles.title}>{title}</Text>
      </View>
      <View style={styles.content}>
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  accent: {
    width: 4,
    height: 20,
    backgroundColor: colors.primary,
    borderRadius: 2,
    marginRight: 10,
  },
  title: {
    fontSize: 18,
    fontFamily: typography.fontSemiBold,
    color: colors.textPrimary,
  },
  content: {
    width: '100%',
  },
});
