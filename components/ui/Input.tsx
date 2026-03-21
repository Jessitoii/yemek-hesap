import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  TextInput, 
  View, 
  KeyboardTypeOptions, 
  ViewStyle, 
  TextStyle 
} from 'react-native';
import { colors } from '../../constants/colors';
import { spacing, radius } from '../../constants/theme';
import { typography } from '../../constants/typography';

interface InputProps {
  label?: string;
  error?: string;
  value: string;
  onChangeText: (text: string) => void;
  keyboardType?: KeyboardTypeOptions;
  placeholder?: string;
  style?: ViewStyle;
  inputStyle?: TextStyle;
  secureTextEntry?: boolean;
  leftIcon?: React.ReactNode;
  multiline?: boolean;
  numberOfLines?: number;
}


export const Input: React.FC<InputProps> = ({
  label,
  error,
  value,
  onChangeText,
  keyboardType = 'default',
  placeholder,
  style,
  inputStyle,
  secureTextEntry,
  leftIcon,
  multiline,
  numberOfLines,
}) => {

  const [isFocused, setIsFocused] = useState(false);

  const getContainerStyle = (): ViewStyle => {
    if (error) {
      return { borderColor: colors.error, borderWidth: 1 };
    }
    if (isFocused) {
      return { borderColor: colors.primary, borderWidth: 1 };
    }
    return { borderColor: colors.border, borderWidth: 1 };
  };

  const onBlur = () => {
    setIsFocused(false);
  };

  const onFocus = () => {
    setIsFocused(true);
  };

  return (
    <View style={[styles.container, style]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={[
        styles.inputWrapper, 
        getContainerStyle(),
        multiline && { height: 'auto', minHeight: 120, alignItems: 'flex-start', paddingVertical: spacing.sm }
      ]}>
        {leftIcon ? <View style={[styles.leftIcon, multiline && { marginTop: spacing.xs }]}>{leftIcon}</View> : null}
        <TextInput
          style={[
            styles.input, 
            inputStyle,
            multiline && { textAlignVertical: 'top' }
          ]}
          value={value}
          onChangeText={onChangeText}
          keyboardType={keyboardType}
          placeholder={placeholder}
          placeholderTextColor={colors.textDisabled}
          onFocus={onFocus}
          onBlur={onBlur}
          secureTextEntry={secureTextEntry}
          multiline={multiline}
          numberOfLines={numberOfLines}
        />
      </View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: spacing.sm,
    width: '100%',
  },
  label: {
    fontFamily: typography.fontMedium,
    fontSize: typography.base,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
    marginLeft: 1,
  },
  inputWrapper: {
    height: 52,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
  },
  leftIcon: {
    marginRight: spacing.sm,
  },
  input: {
    fontFamily: typography.fontRegular,
    fontSize: typography.base,
    color: colors.textPrimary,
    flex: 1,
  },

  errorText: {
    fontFamily: typography.fontRegular,
    fontSize: typography.sm,
    color: colors.error,
    marginTop: spacing.xs,
    marginLeft: 1,
  },
});
