---
name: new-db-query
description: Use when adding a new SQLite query, creating a migration, or modifying the database schema in KaloriTabak. Triggers on "add a query", "new migration", "yeni tablo", "veritabanı", "SQLite".
---

# New DB Query Skill

## Use this skill when
- Adding a new query function to `db/queries/`
- Creating a new migration file
- Modifying an existing table schema

## Do not use this skill when
- Reading data in a component (use the store instead)
- The data you need is already covered by an existing query

## Instructions

### Adding a Query Function

1. Find the correct file in `db/queries/` — e.g., recipes → `db/queries/recipes.ts`

2. All query functions receive the `db` instance from `db/index.ts`. Pattern:
```typescript
import { getDb } from '@/db'

export async function getRecipes(): Promise<Recipe[]> {
  const db = getDb()
  const result = await db.getAllAsync<Recipe>(
    'SELECT * FROM recipes ORDER BY created_at DESC'
  )
  return result
}

export async function saveRecipe(recipe: Recipe): Promise<void> {
  const db = getDb()
  await db.runAsync(
    `INSERT INTO recipes (id, name, ...) VALUES (?, ?, ...)`,
    [recipe.id, recipe.name, ...]
  )
}
```

3. Always use **parameterized queries** — never string interpolation for user input.

4. IDs are UUIDs: `import { generateId } from '@/utils/uuid'`

5. Dates as strings: `new Date().toISOString().split('T')[0]` → `'YYYY-MM-DD'`

6. Prices stored as kuruş (integer): `Math.round(priceTL * 100)`

### Adding a Migration

1. Create file: `db/migrations/0XX_description.ts` (next number in sequence)

2. Migration format:
```typescript
import { SQLiteDatabase } from 'expo-sqlite'

export async function up(db: SQLiteDatabase): Promise<void> {
  await db.execAsync(`
    ALTER TABLE recipes ADD COLUMN new_field TEXT;
  `)
}
```

3. Register in `db/index.ts` migrations array — migrations run in order, only once each.

4. **Never modify existing migrations** — always add a new one.

## Safety
- Always test with `runAsync` for writes, `getAllAsync`/`getFirstAsync` for reads
- CASCADE deletes are set on FK relationships — check `docs/04-database.md` before deleting

## References
- Full schema: `docs/04-database.md`