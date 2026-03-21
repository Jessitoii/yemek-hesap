import { StyleSheet, Text, View, ViewStyle, TextStyle } from 'react-native';
import { colors } from '../../constants/colors';
import { radius } from '../../constants/theme';
import { typography } from '../../constants/typography';

interface BadgeProps {
  label: string;
  color?: 'primary' | 'secondary' | 'accent' | 'error';
  style?: ViewStyle;
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  color = 'primary',
  style,
}) => {
  const getBadgeStyle = (): ViewStyle => {
    switch (color) {
      case 'primary':
        return { backgroundColor: colors.primaryLight };
      case 'secondary':
        return { backgroundColor: colors.secondaryLight };
      case 'accent':
        return { backgroundColor: colors.accentLight };
      case 'error':
        return { backgroundColor: colors.bordoLight };
      default:
        return { backgroundColor: colors.primaryLight };
    }
  };

  const getTextStyle = (): TextStyle => {
    switch (color) {
      case 'primary':
        return { color: colors.primaryDark };
      case 'secondary':
        return { color: colors.secondaryDark };
      case 'accent':
        return { color: colors.accentDark };
      case 'error':
        return { color: colors.bordoDark };
      default:
        return { color: colors.primaryDark };
    }
  };

  return (
    <View style={[styles.container, getBadgeStyle(), style]}>
      <Text style={[styles.label, getTextStyle()]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.sm,
    alignSelf: 'flex-start',
  },
  label: {
    fontFamily: typography.fontBold,
    fontSize: 10,
    textTransform: 'uppercase',
  },
});
