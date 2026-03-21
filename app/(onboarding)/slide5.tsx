import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { SlideContainer } from '@/components/onboarding/SlideContainer';
import { colors } from '@/constants/colors';
import { typography } from '@/constants/typography';
import { useOnboarding } from './_layout';
import { Gender } from '@/types/user';

export default function Slide5Profile() {
  const { data, updateData } = useOnboarding();
  const [gender, setGender] = useState(data.gender);
  const [age, setAge] = useState(data.age.toString());
  const [height, setHeight] = useState(data.height.toString());
  const [weight, setWeight] = useState(data.weight.toString());

  const ageNum = parseInt(age);
  const heightNum = parseInt(height);
  const weightNum = parseFloat(weight);

  const isValid = 
    ageNum >= 10 && ageNum <= 120 &&
    heightNum >= 50 && heightNum <= 300 &&
    weightNum >= 20 && weightNum <= 500;

  const handleNext = () => {
    updateData({ 
      gender, 
      age: ageNum, 
      height: heightNum, 
      weight: weightNum 
    });
  };

  return (
    <SlideContainer 
      onNext={handleNext}
      isNextDisabled={!isValid}
      gradientColors={['#FAFAFA', '#FAFAFA']}
    >
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} style={styles.container}>
          <Text style={styles.title}>Kendinizi Tanıtın</Text>
          <Text style={styles.subtitle}>Günlük ihtiyacınızı hesaplamak için bu bilgilere ihtiyacımız var.</Text>

          <View style={styles.section}>
            <Text style={styles.label}>Cinsiyet</Text>
            <View style={styles.genderRow}>
              <TouchableOpacity 
                style={[styles.genderButton, gender === Gender.MALE && styles.genderButtonActive]}
                onPress={() => setGender(Gender.MALE)}
              >
                <Text style={[styles.genderText, gender === Gender.MALE && styles.genderTextActive]}>Erkek</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.genderButton, gender === Gender.FEMALE && styles.genderButtonActive]}
                onPress={() => setGender(Gender.FEMALE)}
              >
                <Text style={[styles.genderText, gender === Gender.FEMALE && styles.genderTextActive]}>Kadın</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputRow}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Yaş</Text>
              <TextInput
                style={styles.input}
                value={age}
                onChangeText={setAge}
                keyboardType="number-pad"
                maxLength={3}
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Boy (cm)</Text>
              <TextInput
                style={styles.input}
                value={height}
                onChangeText={setHeight}
                keyboardType="number-pad"
                maxLength={3}
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Kilo (kg)</Text>
              <TextInput
                style={styles.input}
                value={weight}
                onChangeText={setWeight}
                keyboardType="decimal-pad"
                maxLength={5}
              />
            </View>
          </View>

          <View style={styles.infoBox}>
            <Text style={styles.infoText}>
              * Verileriniz cihazınızda güvenle saklanır, hesaplama dışında kullanılmaz.
            </Text>
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
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 32,
  },
  label: {
    fontFamily: typography.fontBold,
    fontSize: typography.sm,
    color: colors.textSecondary,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  genderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  genderButton: {
    flex: 0.48,
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: colors.borderLight,
    alignItems: 'center',
    backgroundColor: colors.surface,
  },
  genderButtonActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight + '20',
  },
  genderText: {
    fontFamily: typography.fontSemiBold,
    fontSize: typography.md,
    color: colors.textSecondary,
  },
  genderTextActive: {
    color: colors.primaryDark,
    fontFamily: typography.fontBold,
  },
  inputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 40,
  },
  inputGroup: {
    flex: 0.3,
  },
  input: {
    height: 56,
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: colors.borderLight,
    paddingHorizontal: 16,
    textAlign: 'center',
    fontFamily: typography.fontBold,
    fontSize: typography.xl,
    color: colors.textPrimary,
  },
  infoBox: {
    backgroundColor: colors.surfaceAlt,
    padding: 16,
    borderRadius: 16,
    marginTop: 'auto',
  },
  infoText: {
    fontFamily: typography.fontRegular,
    fontSize: typography.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  }
});
