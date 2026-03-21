import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { SlideContainer } from '@/components/onboarding/SlideContainer';
import { ActivityLevelOption } from '@/components/onboarding/ActivityLevelOption';
import { colors } from '@/constants/colors';
import { typography } from '@/constants/typography';
import { useOnboarding } from './_layout';
import { ActivityLevel } from '@/types/user';
import { Couch, Bicycle, Barbell, Lightning } from 'phosphor-react-native';

export default function Slide6Activity() {
  const { data, updateData } = useOnboarding();
  const [selectedActivity, setSelectedActivity] = useState<ActivityLevel>(data.activityLevel);

  const handleNext = () => {
    updateData({ activityLevel: selectedActivity });
  };

  const activityLevels = [
    { 
      type: ActivityLevel.SEDENTARY, 
      title: 'Hareketsiz', 
      description: 'Masa başı iş, az veya hiç egzersiz.',
      icon: Couch
    },
    { 
      type: ActivityLevel.LIGHTLY_ACTIVE, 
      title: 'Az Hareketli', 
      description: 'Hafif egzersiz, haftada 1-3 gün.',
      icon: Bicycle
    },
    { 
      type: ActivityLevel.MODERATELY_ACTIVE, 
      title: 'Orta Hareketli', 
      description: 'Düzenli egzersiz, haftada 3-5 gün.',
      icon: Barbell
    },
    { 
      type: ActivityLevel.VERY_ACTIVE, 
      title: 'Çok Hareketli', 
      description: 'Ağır egzersiz veya fiziksel iş.',
      icon: Lightning
    },
  ];

  return (
    <SlideContainer 
      onNext={handleNext}
      gradientColors={['#FAFAFA', '#FAFAFA']}
    >
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1 }}>
          <View style={styles.container}>
            <Text style={styles.title}>Hareket Seviyeniz</Text>
            <Text style={styles.subtitle}>Günlük enerji ihtiyacınızı belirlememize yardımcı olun.</Text>

            <View style={styles.list}>
              {activityLevels.map((level) => {
                const Icon = level.icon;
                return (
                  <ActivityLevelOption
                    key={level.type}
                    title={level.title}
                    description={level.description}
                    icon={<Icon size={24} color={selectedActivity === level.type ? colors.primary : colors.textSecondary} />}
                    isSelected={selectedActivity === level.type}
                    onPress={() => setSelectedActivity(level.type)}
                  />
                );
              })}
              <View style={{height: 20}} />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SlideContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20,
  },
  title: {
    fontFamily: typography.fontExtraBold,
    fontSize: typography.xxxl,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontFamily: typography.fontRegular,
    fontSize: typography.md,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  list: {
    flex: 1,
  }
});
