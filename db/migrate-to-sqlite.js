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

// Supprimer la base de données existante si elle existe
if (fs.existsSync(dbPath)) {
  fs.unlinkSync(dbPath);
  console.log(`Base de données existante supprimée: ${dbPath}`);
}

// Initialiser la base de données SQLite
const sqlite = new Database(dbPath);

// Activer les clés étrangères
sqlite.pragma('foreign_keys = ON');

// Créer les tables
console.log('Création des tables...');

// Table users
sqlite.exec(`
  CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL
  );
`);

// Table companions
sqlite.exec(`
  CREATE TABLE companions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    avatar TEXT,
    description TEXT,
    personality TEXT NOT NULL,
    is_online INTEGER DEFAULT 1,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL,
    last_interaction TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );
`);

// Table conversations
sqlite.exec(`
  CREATE TABLE conversations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    companion_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (companion_id) REFERENCES companions(id)
  );
`);

// Table messages
sqlite.exec(`
  CREATE TABLE messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    conversation_id INTEGER NOT NULL,
    content TEXT NOT NULL,
    role TEXT NOT NULL,
    image_url TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL,
    FOREIGN KEY (conversation_id) REFERENCES conversations(id)
  );
`);

// Table api_keys
sqlite.exec(`
  CREATE TABLE api_keys (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    provider TEXT NOT NULL,
    key TEXT NOT NULL,
    is_valid INTEGER DEFAULT 1,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );
`);

// Table settings
sqlite.exec(`
  CREATE TABLE settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    active_model TEXT DEFAULT 'gemini',
    theme TEXT DEFAULT 'light',
    voice_enabled INTEGER DEFAULT 0,
    preferences TEXT DEFAULT '{}',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );
`);

console.log('Tables créées avec succès!');

// Fonction pour importer les données JSON
async function importJsonData() {
    try {
    // Importer les utilisateurs
    if (fs.existsSync(path.join(tablesJsonDir, 'users.json'))) {
      const usersData = JSON.parse(fs.readFileSync(path.join(tablesJsonDir, 'users.json'), 'utf8'));
      if (usersData.length > 0) {
        const insertUser = sqlite.prepare(`
          INSERT INTO users (id, username, password)
          VALUES (?, ?, ?)
        `);
        
        for (const user of usersData) {
          insertUser.run(user.id, user.username, user.password);
        }
        console.log(`${usersData.length} utilisateurs importés`);
      } else {
        console.log('Aucun utilisateur à importer');
      }
    }

    // Importer les companions
    if (fs.existsSync(path.join(tablesJsonDir, 'companions.json'))) {
      const companionsData = JSON.parse(fs.readFileSync(path.join(tablesJsonDir, 'companions.json'), 'utf8'));
      if (companionsData.length > 0) {
        const insertCompanion = sqlite.prepare(`
          INSERT INTO companions (id, user_id, name, role, avatar, description, personality, is_online, created_at, last_interaction)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        
        for (const companion of companionsData) {
          insertCompanion.run(
            companion.id,
            companion.user_id,
            companion.name,
            companion.role,
            companion.avatar,
            companion.description,
            companion.personality,
            companion.is_online ? 1 : 0,
            companion.created_at,
            companion.last_interaction
          );
        }
        console.log(`${companionsData.length} companions importés`);
      } else {
        console.log('Aucun companion à importer');
      }
    }

    // Importer les conversations
    if (fs.existsSync(path.join(tablesJsonDir, 'conversations.json'))) {
      const conversationsData = JSON.parse(fs.readFileSync(path.join(tablesJsonDir, 'conversations.json'), 'utf8'));
      if (conversationsData.length > 0) {
        const insertConversation = sqlite.prepare(`
          INSERT INTO conversations (id, user_id, companion_id, name, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?)
        `);
        
        for (const conversation of conversationsData) {
          insertConversation.run(
            conversation.id,
            conversation.user_id,
            conversation.companion_id,
            conversation.name,
            conversation.created_at,
            conversation.updated_at
          );
        }
        console.log(`${conversationsData.length} conversations importées`);
      } else {
        console.log('Aucune conversation à importer');
      }
    }

    // Importer les messages
    if (fs.existsSync(path.join(tablesJsonDir, 'messages.json'))) {
      const messagesData = JSON.parse(fs.readFileSync(path.join(tablesJsonDir, 'messages.json'), 'utf8'));
      if (messagesData.length > 0) {
        const insertMessage = sqlite.prepare(`
          INSERT INTO messages (id, conversation_id, content, role, image_url, created_at)
          VALUES (?, ?, ?, ?, ?, ?)
        `);
        
        for (const message of messagesData) {
          insertMessage.run(
            message.id,
            message.conversation_id,
            message.content,
            message.role,
            message.image_url,
            message.created_at
          );
        }
        console.log(`${messagesData.length} messages importés`);
      } else {
        console.log('Aucun message à importer');
      }
    }

    // Importer les api_keys
    if (fs.existsSync(path.join(tablesJsonDir, 'api_keys.json'))) {
      const apiKeysData = JSON.parse(fs.readFileSync(path.join(tablesJsonDir, 'api_keys.json'), 'utf8'));
      if (apiKeysData.length > 0) {
        const insertApiKey = sqlite.prepare(`
          INSERT INTO api_keys (id, user_id, provider, key, is_valid, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `);
        
        for (const apiKey of apiKeysData) {
          insertApiKey.run(
            apiKey.id,
            apiKey.user_id,
            apiKey.provider,
            apiKey.key,
            apiKey.is_valid ? 1 : 0,
            apiKey.created_at,
            apiKey.updated_at
          );
        }
        console.log(`${apiKeysData.length} clés API importées`);
      } else {
        console.log('Aucune clé API à importer');
      }
    }

    // Importer les settings
    if (fs.existsSync(path.join(tablesJsonDir, 'settings.json'))) {
      const settingsData = JSON.parse(fs.readFileSync(path.join(tablesJsonDir, 'settings.json'), 'utf8'));
      if (settingsData.length > 0) {
        const insertSetting = sqlite.prepare(`
          INSERT INTO settings (id, user_id, active_model, theme, voice_enabled, preferences, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `);
        
        for (const setting of settingsData) {
          insertSetting.run(
            setting.id,
            setting.user_id,
            setting.active_model,
            setting.theme,
            setting.voice_enabled ? 1 : 0,
            typeof setting.preferences === 'object' ? JSON.stringify(setting.preferences) : setting.preferences,
            setting.created_at,
            setting.updated_at
          );
        }
        console.log(`${settingsData.length} paramètres importés`);
      } else {
        console.log('Aucun paramètre à importer');
      }
    }

    console.log('Importation des données terminée avec succès!');
  } catch (error) {
    console.error('Erreur lors de l\'importation des données:', error);
    throw error;
  }
}

// Exécuter l'importation
try {
  await importJsonData();
  console.log('Migration vers SQLite terminée!');
  // Fermer la connexion à la base de données
  sqlite.close();
} catch (error) {
  console.error('Erreur lors de la migration:', error);
  process.exit(1);
}