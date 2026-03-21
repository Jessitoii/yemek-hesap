import React from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  ViewStyle, 
} from 'react-native';
import { colors } from '../../constants/colors';
import { spacing, radius } from '../../constants/theme';
import { typography } from '../../constants/typography';
import { Avatar } from './Avatar';
import { Button } from './Button';

interface EmptyStateProps {
  title?: string;
  message: string;
  ctaLabel?: string;
  onCta?: () => void;
  icon?: React.ReactNode;
  style?: ViewStyle;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  message,
  ctaLabel,
  onCta,
  icon,
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      {icon ? (
        <View style={styles.iconWrapper}>{icon}</View>
      ) : (
        <Avatar state="idle" size={160} />
      )}
      
      {title && <Text style={styles.title}>{title}</Text>}
      <Text style={styles.message}>{message}</Text>
      
      {ctaLabel && onCta ? (
        <Button 
          label={ctaLabel} 
          onPress={onCta} 
          variant="secondary" 
          style={styles.button} 
        />
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: spacing.xl,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconWrapper: {
    marginBottom: spacing.md,
    backgroundColor: colors.surfaceAlt,
    padding: spacing.lg,
    borderRadius: radius.full,
  },
  title: {
    fontFamily: typography.fontExtraBold,
    fontSize: 20,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  message: {
    fontFamily: typography.fontMedium,
    fontSize: typography.md,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.xs,
    marginBottom: spacing.xl,
    lineHeight: 22,
  },
  button: {
    minWidth: 160,
  },
});
