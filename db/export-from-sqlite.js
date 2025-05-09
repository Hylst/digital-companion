import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as path from 'path';
import * as fs from 'fs';
import { fileURLToPath } from 'url';

// Obtenir le chemin absolu du répertoire db
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, 'sqlite.db');
const tablesJsonDir = path.join(__dirname, 'tables_json');

// Vérifier si la base de données existe
if (!fs.existsSync(dbPath)) {
  console.error(`Base de données introuvable: ${dbPath}`);
  process.exit(1);
}

// Initialiser la base de données SQLite
const sqlite = new Database(dbPath);

// Créer le répertoire pour les fichiers JSON s'il n'existe pas
if (!fs.existsSync(tablesJsonDir)) {
  fs.mkdirSync(tablesJsonDir, { recursive: true });
  console.log(`Répertoire créé: ${tablesJsonDir}`);
}

// Fonction pour exporter les données vers des fichiers JSON
async function exportDataToJson() {
  try {
    // Exporter les utilisateurs
    const users = sqlite.prepare('SELECT * FROM users').all();
    fs.writeFileSync(path.join(tablesJsonDir, 'users.json'), JSON.stringify(users, null, 2));
    console.log(`${users.length} utilisateurs exportés`);

    // Exporter les companions
    const companions = sqlite.prepare('SELECT * FROM companions').all();
    fs.writeFileSync(path.join(tablesJsonDir, 'companions.json'), JSON.stringify(companions, null, 2));
    console.log(`${companions.length} companions exportés`);

    // Exporter les conversations
    const conversations = sqlite.prepare('SELECT * FROM conversations').all();
    fs.writeFileSync(path.join(tablesJsonDir, 'conversations.json'), JSON.stringify(conversations, null, 2));
    console.log(`${conversations.length} conversations exportées`);

    // Exporter les messages
    const messages = sqlite.prepare('SELECT * FROM messages').all();
    fs.writeFileSync(path.join(tablesJsonDir, 'messages.json'), JSON.stringify(messages, null, 2));
    console.log(`${messages.length} messages exportés`);

    // Exporter les api_keys
    const apiKeys = sqlite.prepare('SELECT * FROM api_keys').all();
    fs.writeFileSync(path.join(tablesJsonDir, 'api_keys.json'), JSON.stringify(apiKeys, null, 2));
    console.log(`${apiKeys.length} clés API exportées`);

    // Exporter les settings
    const settings = sqlite.prepare('SELECT * FROM settings').all();
    fs.writeFileSync(path.join(tablesJsonDir, 'settings.json'), JSON.stringify(settings, null, 2));
    console.log(`${settings.length} paramètres exportés`);

    console.log('Exportation des données terminée avec succès!');
  } catch (error) {
    console.error('Erreur lors de l\'exportation des données:', error);
    throw error;
  }
}

// Exécuter l'exportation
try {
  await exportDataToJson();
  console.log('Exportation vers JSON terminée!');
  // Fermer la connexion à la base de données
  sqlite.close();
} catch (error) {
  console.error('Erreur lors de l\'exportation:', error);
  process.exit(1);
}