import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { Card } from '../ui/Card';
import { colors } from '../../constants/colors';
import { typography } from '../../constants/typography';
import * as Icons from 'phosphor-react-native';
import { Exercise } from '@/types/activity';
import { exercises as ExerciseListData } from '@/constants/exercises';

interface ExerciseCardProps {
  exercise: Exercise;
  onDelete?: (id: string) => void;
}

export const ExerciseCard: React.FC<ExerciseCardProps> = ({
  exercise,
  onDelete,
}) => {
  const meta = ExerciseListData.find(e => e.type === exercise.type);
  const IconComponent = meta ? (Icons as any)[meta.icon] || Icons.Pulse : Icons.Pulse;

  return (
    <Card style={styles.card}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <IconComponent size={24} color={colors.pink} weight="fill" />
        </View>
        <View style={styles.info}>
          <Text style={styles.name}>{exercise.name}</Text>
          <Text style={styles.details}>
            {exercise.durationMinutes} dk • {exercise.burnedCalories} kcal
          </Text>
        </View>
        <TouchableOpacity 
          style={styles.deleteButton}
          onPress={() => onDelete?.(exercise.id)}
        >
          <Icons.Trash size={20} color={colors.error} />
        </TouchableOpacity>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginVertical: 6,
    padding: 12,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.pinkLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  info: {
    flex: 1,
  },
  name: {
    fontFamily: typography.fontBold,
    fontSize: typography.base,
    color: colors.textPrimary,
  },
  details: {
    fontFamily: typography.fontRegular,
    fontSize: typography.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  deleteButton: {
    padding: 8,
  },
});
