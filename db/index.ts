import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from "@shared/schema";
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from 'fs';

// Obtenir le chemin absolu du répertoire db
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const dbPath = join(__dirname, 'sqlite.db');

// Créer le répertoire s'il n'existe pas
const dbDir = dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// Initialiser la base de données SQLite
const sqlite = new Database(dbPath);

// Activer les clés étrangères
sqlite.pragma('foreign_keys = ON');

// Exporter l'instance de la base de données
export const db = drizzle(sqlite, { schema });