import { create } from 'zustand';
import { UserProfile, UserGoals, AppSettings } from '@/types/user';
import { getUser, updateUser, updateGoals } from '@/db/queries/user';

interface UserState {
  profile: UserProfile | null;
  goals: UserGoals | null;
  settings: AppSettings | null;
  isLoading: boolean;
  onboardingCompleted: boolean;

  // Actions
  loadUser: () => Promise<void>;
  updateProfile: (profile: Partial<UserProfile>) => Promise<void>;
  updateGoals: (goals: UserGoals) => Promise<void>;
  updateSettings: (settings: Partial<AppSettings>) => Promise<void>;
  setOnboardingCompleted: (completed: boolean) => Promise<void>;
}

export const useUserStore = create<UserState>((set, get) => ({
  profile: null,
  goals: null,
  settings: null,
  isLoading: true,
  onboardingCompleted: false,

  loadUser: async () => {
    set({ isLoading: true });
    try {
      const data = await getUser();
      if (data) {
        set({
          profile: data,
          goals: data,
          settings: data,
          onboardingCompleted: data.onboardingCompleted,
        });
      }
    } catch (error) {
      console.error('[UserStore] Error loading user:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  updateProfile: async (profileUpdates) => {
    const currentProfile = get().profile;
    if (!currentProfile) return;

    try {
      await updateUser(profileUpdates);
      set({ profile: { ...currentProfile, ...profileUpdates } });
    } catch (error) {
      console.error('[UserStore] Error updating profile:', error);
    }
  },

  updateGoals: async (goals) => {
    try {
      await updateGoals(goals);
      set({ goals });
    } catch (error) {
      console.error('[UserStore] Error updating goals:', error);
    }
  },

  updateSettings: async (settingsUpdates) => {
    const currentSettings = get().settings;
    if (!currentSettings) return;

    try {
      // In a real app, this would call a db update query for settings.
      // For now we persist it in memory and assume a placeholder db function.
      set({ settings: { ...currentSettings, ...settingsUpdates } });
    } catch (error) {
      console.error('[UserStore] Error updating settings:', error);
    }
  },

  setOnboardingCompleted: async (completed) => {
    try {
      await updateUser({ onboardingCompleted: completed });
      set({ onboardingCompleted: completed });
    } catch (error) {
      console.error('[UserStore] Error set onboarding completed:', error);
    }
  },
}));
