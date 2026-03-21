import React from 'react';
import { StyleSheet, View, ActivityIndicator, ViewStyle } from 'react-native';
import { colors } from '../../constants/colors';

interface LoadingSpinnerProps {
  style?: ViewStyle;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ style }) => {
  return (
    <View style={[styles.container, style]}>
      <ActivityIndicator size="large" color={colors.primary} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
