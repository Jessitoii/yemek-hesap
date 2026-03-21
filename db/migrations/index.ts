import { migration_001_user } from './001_user';
import { migration_002_ingredients } from './002_ingredients';
import { migration_003_recipes } from './003_recipes';
import { migration_004_recipe_ingredients } from './004_recipe_ingredients';
import { migration_005_price_history } from './005_price_history';
import { migration_006_daily_log } from './006_daily_log';
import { migration_007_meals } from './007_meals';
import { migration_008_activity_log } from './008_activity_log';
import { migration_009_streak } from './009_streak';
import { migration_010_meal_plans } from './010_meal_plans';
import { migration_011_cache } from './011_cache';
import * as water_012 from './012_water';

export const migrations = [
  migration_001_user,
  migration_002_ingredients,
  migration_003_recipes,
  migration_004_recipe_ingredients,
  migration_005_price_history,
  migration_006_daily_log,
  migration_007_meals,
  migration_008_activity_log,
  migration_009_streak,
  migration_010_meal_plans,
  migration_011_cache,
  { name: '012_water', run: water_012.up },
];
