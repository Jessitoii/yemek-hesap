import { Text, StyleSheet } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from "../../../constants/colors";
import { typography } from "../../../constants/typography";

export default function ProfileScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <Text style={styles.title}>Profil</Text>
      <Text style={styles.subtitle}>Ayarların ve kişisel hedeflerin.</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontFamily: typography.fontBold,
    fontSize: typography.xxl,
    color: colors.textPrimary,
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: typography.fontRegular,
    fontSize: typography.base,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
