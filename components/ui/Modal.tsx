import React, { useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  Modal as RNModal, 
  Pressable, 
  Dimensions, 
  ViewStyle, 
  TextStyle 
} from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withSpring, 
  runOnJS 
} from 'react-native-reanimated';
import { colors } from '../../constants/colors';
import { radius, spacing, shadow } from '../../constants/theme';
import { typography } from '../../constants/typography';

const { height } = Dimensions.get('window');

interface ModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({
  visible,
  onClose,
  title,
  children,
}) => {
  const translateY = useSharedValue(height);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      opacity.value = withTiming(0.5, { duration: 300 });
      translateY.value = withSpring(0, { damping: 20 });
    } else {
      opacity.value = withTiming(0, { duration: 300 });
      translateY.value = withTiming(height, { duration: 300 });
    }
  }, [visible]);

  const animatedBackdropStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
    };
  });

  const animatedContentStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
    };
  });

  const handleClose = () => {
    opacity.value = withTiming(0, { duration: 300 });
    translateY.value = withTiming(height, { duration: 300 }, (finished) => {
      if (finished) {
        runOnJS(onClose)();
      }
    });
  };

  return (
    <RNModal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <Pressable 
          style={StyleSheet.absoluteFill} 
          onPress={handleClose}
        >
          <Animated.View style={[styles.backdrop, animatedBackdropStyle]} />
        </Pressable>
        
        <Animated.View style={[styles.content, animatedContentStyle, shadow.lg]}>
          <View style={styles.handle} />
          {title ? (
            <View style={styles.header}>
              <Text style={styles.title}>{title}</Text>
            </View>
          ) : null}
          <View style={styles.body}>
            {children}
          </View>
        </Animated.View>
      </View>
    </RNModal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000',
  },
  content: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    minHeight: height * 0.4,
    paddingBottom: spacing.xxxl,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: colors.border,
    borderRadius: radius.full,
    alignSelf: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  title: {
    fontFamily: typography.fontBold,
    fontSize: typography.lg,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  body: {
    padding: spacing.lg,
  },
});
