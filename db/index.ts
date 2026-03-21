import * as SQLite from 'expo-sqlite';
import { migrations } from './migrations';

let database: SQLite.SQLiteDatabase | null = null;

/**
 * Opens the database connection.
 */
export async function getDB(): Promise<SQLite.SQLiteDatabase> {
  if (database) return database;
  database = await SQLite.openDatabaseAsync('kaloritabak.db');
  return database;
}

/**
 * Runs pending migrations sequentially.
 */
export async function runMigrations() {
  const db = await getDB();
  
  // Create migrations table if not exists
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS migrations (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      executed_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Get executed migrations
  const executedMigrationsRows = await db.getAllAsync<{ name: string }>(
    'SELECT name FROM migrations'
  );
  const executedMigrations = new Set(executedMigrationsRows.map(row => row.name));

  for (const migration of migrations) {
    if (!executedMigrations.has(migration.name)) {
      console.log(`Running migration: ${migration.name}`);
      try {
        await migration.run(db);
        await db.runAsync('INSERT INTO migrations (name) VALUES (?)', migration.name);
        console.log(`Migration ${migration.name} complete.`);
      } catch (error) {
        console.error(`Migration ${migration.name} failed:`, error);
        throw error; // Stop further migrations if one fails
      }
    }
  }
}

/**
 * Initializes the database.
 */
export async function initDB() {
  await runMigrations();
  console.log('Database initialized successfully.');
}
