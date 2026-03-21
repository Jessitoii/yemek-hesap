import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { colors } from '@/constants/colors';
import { typography } from '@/constants/typography';
import { Gender } from '@/types/user';

interface BodyFatModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (value: number) => void;
  gender: Gender;
  height: number;
}

export const BodyFatModal: React.FC<BodyFatModalProps> = ({ 
  visible, 
  onClose, 
  onSave,
  gender,
  height: userHeight
}) => {
  const [waist, setWaist] = useState('');
  const [neck, setNeck] = useState('');
  const [hip, setHip] = useState('');
  const [result, setResult] = useState<number | null>(null);

  const calculateBodyFat = () => {
    const w = parseFloat(waist);
    const n = parseFloat(neck);
    const h = userHeight;
    const hi = parseFloat(hip);

    if (isNaN(w) || isNaN(n) || (gender === Gender.FEMALE && isNaN(hi))) {
      Alert.alert('Hata', 'Lütfen tüm değerleri geçerli sayılar olarak giriniz.');
      return;
    }

    let bfp = 0;
    if (gender === Gender.MALE) {
      // BFP = 495 / (1.0324 - 0.19077 * log10(waist - neck) + 0.15456 * log10(height)) - 450
      bfp = 495 / (1.0324 - 0.19077 * Math.log10(w - n) + 0.15456 * Math.log10(h)) - 450;
    } else {
      // BFP = 495 / (1.29579 - 0.35004 * log10(waist + hip - neck) + 0.22100 * log10(height)) - 450
      bfp = 495 / (1.29579 - 0.35004 * Math.log10(w + hi - n) + 0.22100 * Math.log10(h)) - 450;
    }

    setResult(parseFloat(bfp.toFixed(1)));
  };

  const getCategory = (bfp: number) => {
    if (gender === Gender.MALE) {
      if (bfp < 6) return { label: 'Temel', color: '#BDBDBD' };
      if (bfp < 14) return { label: 'Fit', color: colors.success };
      if (bfp < 18) return { label: 'Normal', color: colors.primary };
      if (bfp < 25) return { label: 'Ortalamanın Üstü', color: colors.warning };
      return { label: 'Obez', color: colors.error };
    } else {
      if (bfp < 14) return { label: 'Temel', color: '#BDBDBD' };
      if (bfp < 21) return { label: 'Fit', color: colors.success };
      if (bfp < 25) return { label: 'Normal', color: colors.primary };
      if (bfp < 32) return { label: 'Ortalamanın Üstü', color: colors.warning };
      return { label: 'Obez', color: colors.error };
    }
  };

  const category = result !== null ? getCategory(result) : null;

  return (
    <Modal visible={visible} onClose={onClose} title="Vücut Yağ Oranı Hesapla">
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.description}>
          Navy (ABD Deniz Kuvvetleri) yöntemini kullanarak vücut yağ oranınızı tahmin edin. Tüm ölçümler cm cinsinden olmalıdır.
        </Text>

        <View style={styles.form}>
          <Input 
            label="Bel Çevresi (En ince yer)" 
            placeholder="Örn: 85" 
            keyboardType="numeric"
            value={waist}
            onChangeText={setWaist}
          />
          <Input 
            label="Boyun Çevresi (Gıdı altı)" 
            placeholder="Örn: 40" 
            keyboardType="numeric"
            value={neck}
            onChangeText={setNeck}
          />
          {gender === Gender.FEMALE && (
            <Input 
              label="Kalça Çevresi (En geniş yer)" 
              placeholder="Örn: 95" 
              keyboardType="numeric"
              value={hip}
              onChangeText={setHip}
            />
          )}

          <Button 
            variant='primary' 
            label="Hesapla"
            onPress={calculateBodyFat} 
            style={styles.calcButton}
          />
        </View>

        {result !== null && (
          <View style={styles.resultContainer}>
            <Text style={styles.resultLabel}>Tahmini Vücut Yağı</Text>
            <Text style={styles.resultValue}>%{result}</Text>
            {category && (
              <View style={[styles.badgeContainer, { backgroundColor: category.color + '20' }]}>
                <Text style={[styles.badgeText, { color: category.color }]}>{category.label}</Text>
              </View>
            )}
            
            <Button 
              variant='outline' 
              label="Profile Kaydet"
              onPress={() => onSave(result)} 
              style={styles.saveButton}
            />
          </View>
        )}
      </ScrollView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingBottom: 20,
  },
  description: {
    fontSize: 14,
    fontFamily: typography.fontRegular,
    color: colors.textSecondary,
    marginBottom: 20,
    lineHeight: 20,
  },
  form: {
    gap: 16,
  },
  calcButton: {
    marginTop: 8,
  },
  buttonText: {
    fontSize: 16,
    fontFamily: typography.fontSemiBold,
    color: colors.textOnPrimary,
  },
  resultContainer: {
    marginTop: 24,
    padding: 20,
    backgroundColor: colors.surfaceAlt,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  resultLabel: {
    fontSize: 14,
    fontFamily: typography.fontMedium,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  resultValue: {
    fontSize: 32,
    fontFamily: typography.fontBold,
    color: colors.textPrimary,
    marginBottom: 12,
  },
  badgeContainer: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 20,
  },
  badgeText: {
    fontSize: 14,
    fontFamily: typography.fontBold,
  },
  saveButton: {
    width: '100%',
  },
});
