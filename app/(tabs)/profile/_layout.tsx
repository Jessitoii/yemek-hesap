import { Stack } from 'expo-router'

export default function ProfileLayout() {
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="edit" />
            <Stack.Screen name="meal-times" />
            <Stack.Screen name="change-goal" />
        </Stack>
    )
}