import { SQLiteDatabase } from 'expo-sqlite';

export const migration_001_user = {
  name: '001_user',
  run: async (db: SQLiteDatabase) => {
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS user (
        id                        INTEGER PRIMARY KEY DEFAULT 1,

        -- personal info
        name                      TEXT NOT NULL,
        gender                    TEXT,                         -- 'male' | 'female'
        age                       INTEGER,
        height_cm                 REAL,
        weight_kg                 REAL,
        body_fat_percent          REAL,                         -- optional

        -- activity & goal
        activity_level            TEXT,                         -- 'sedentary' | 'light' | 'moderate' | 'very_active'
        goal                      TEXT,                         -- 'lose_weight' | 'gain_weight' | 'stay_fit' | 'eat_healthy' | 'reduce_spending'

        -- calculated targets (auto-updated when profile or goal changes)
        daily_calorie_goal        INTEGER,
        daily_protein_goal_g      REAL,
        daily_carbs_goal_g        REAL,
        daily_fat_goal_g          REAL,
        daily_budget_goal_tl      REAL,
        daily_step_goal           INTEGER DEFAULT 10000,

        -- notification settings
        notif_meal_reminder       INTEGER DEFAULT 0,            -- 0 | 1
        notif_calorie_alert       INTEGER DEFAULT 0,
        notif_water_reminder      INTEGER DEFAULT 0,
        notif_streak_warning      INTEGER DEFAULT 0,
        notif_weekly_summary      INTEGER DEFAULT 0,

        -- notification times
        breakfast_time            TEXT DEFAULT '08:00',
        lunch_time                TEXT DEFAULT '12:30',
        dinner_time               TEXT DEFAULT '19:00',
        water_interval_hours      INTEGER DEFAULT 2,
        water_start_time          TEXT DEFAULT '08:00',
        water_end_time            TEXT DEFAULT '22:00',
        weekly_summary_day        TEXT DEFAULT 'sunday',

        -- app state
        onboarding_completed      INTEGER DEFAULT 0,
        data_retention_days       INTEGER DEFAULT 365,
        created_at                TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at                TEXT DEFAULT CURRENT_TIMESTAMP
      );
    `);
  },
};
