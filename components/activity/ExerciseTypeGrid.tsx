import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { colors } from '../../constants/colors';
import { typography } from '../../constants/typography';
import * as Icons from 'phosphor-react-native';
import { ExerciseType, exercises } from '../../constants/exercises';

interface ExerciseTypeGridProps {
  selectedType: ExerciseType | null;
  onSelect: (type: ExerciseType) => void;
}

export const ExerciseTypeGrid: React.FC<ExerciseTypeGridProps> = ({
  selectedType,
  onSelect,
}) => {
  return (
    <View style={styles.grid}>
      {exercises.map((item) => {
        const IconComponent = (Icons as any)[item.icon] || Icons.Pulse;
        const isSelected = selectedType === item.type;

        return (
          <TouchableOpacity
            key={item.id}
            style={[
              styles.item,
              isSelected && styles.itemSelected
            ]}
            onPress={() => onSelect(item.type)}
          >
            <View style={[
              styles.iconWrapper,
              isSelected && styles.iconWrapperSelected
            ]}>
              <IconComponent 
                size={28} 
                color={isSelected ? colors.surface : colors.pink} 
                weight={isSelected ? 'fill' : 'regular'}
              />
            </View>
            <Text style={[
              styles.itemLabel,
              isSelected && styles.itemLabelBold
            ]}>
              {item.name}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    padding: 10,
  },
  item: {
    width: '23%',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderRadius: 12,
  },
  itemSelected: {
    // Styling for selected container if needed
  },
  iconWrapper: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.pinkLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  iconWrapperSelected: {
    backgroundColor: colors.pink,
    borderColor: colors.pinkDark,
  },
  itemLabel: {
    fontFamily: typography.fontRegular,
    fontSize: typography.xs,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  itemLabelBold: {
    fontFamily: typography.fontBold,
    color: colors.pinkDark,
  },
});
