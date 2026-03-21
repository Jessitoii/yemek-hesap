import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { SlideContainer } from '@/components/onboarding/SlideContainer';
import { GoalOption } from '@/components/onboarding/GoalOption';
import { colors } from '@/constants/colors';
import { typography } from '@/constants/typography';
import { useOnboarding } from './_layout';
import { GoalType } from '@/types/user';

export default function Slide4Goals() {
  const { data, updateData } = useOnboarding();
  const [selectedGoals, setSelectedGoals] = useState<GoalType[]>(data.goalType || []);

  const toggleGoal = (goal: GoalType) => {
    setSelectedGoals(prev => 
      prev.includes(goal) 
        ? prev.filter(g => g !== goal) 
        : [...prev, goal]
    );
  };

  const handleNext = () => {
    updateData({ goalType: selectedGoals });
  };

  const isNextDisabled = selectedGoals.length === 0;

  const goalsList = [
    { type: GoalType.LOSE_WEIGHT, label: 'Kilo Ver', emoji: '📉' },
    { type: GoalType.GAIN_WEIGHT, label: 'Kilo Al', emoji: '💪' },
    { type: GoalType.STAY_FIT, label: 'Formda Kal', emoji: '🧘' },
    { type: GoalType.EAT_HEALTHIER, label: 'Sağlıklı Beslen', emoji: '🥗' },
    { type: GoalType.REDUCE_SPENDING, label: 'Tasarruf Et', emoji: '💰' },
  ];

  return (
    <SlideContainer 
      onNext={handleNext}
      isNextDisabled={isNextDisabled}
      gradientColors={['#FCE4EC', '#FAFAFA']}
    >
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1 }}>
          <View style={styles.container}>
            <Text style={styles.title}>Hedefiniz Nedir?</Text>
            <Text style={styles.subtitle}>
              Birden fazla seçim yapabilirsiniz. Size en uygun planı hazırlayacağız.
            </Text>

            <View style={styles.list}>
              {goalsList.map((goal) => (
                <GoalOption
                  key={goal.type}
                  label={goal.label}
                  emoji={goal.emoji}
                  isSelected={selectedGoals.includes(goal.type)}
                  onPress={() => toggleGoal(goal.type)}
                />
              ))}
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
