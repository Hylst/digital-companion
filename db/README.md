# Gestion de la Base de Données SQLite

Ce répertoire contient les scripts et fichiers nécessaires pour gérer la base de données SQLite de l'application DigitalCompanion.

## Structure

- `sqlite.db` - La base de données SQLite principale
- `migrate-to-sqlite.js` - Script pour migrer des données JSON vers SQLite
- `export-from-sqlite.js` - Script pour exporter les données SQLite vers JSON
- `tables_json/` - Répertoire contenant les fichiers JSON des tables
- `migrations/` - Répertoire contenant les migrations Drizzle

## Utilisation

### Migration vers SQLite

Pour migrer des données JSON vers la base de données SQLite :

```bash
node db/migrate-to-sqlite.js
```

Ce script va :
1. Supprimer la base de données SQLite existante si elle existe
2. Créer une nouvelle base de données avec toutes les tables nécessaires
3. Importer les données depuis les fichiers JSON dans le répertoire `tables_json/`

### Exportation depuis SQLite

Pour exporter les données de la base de données SQLite vers des fichiers JSON :

```bash
node db/export-from-sqlite.js
```

Ce script va :
1. Exporter toutes les tables de la base de données vers des fichiers JSON
2. Sauvegarder ces fichiers dans le répertoire `tables_json/`

## Partage et Versionnement

Les fichiers JSON exportés peuvent être versionnés dans Git pour faciliter le partage et la collaboration. La base de données SQLite elle-même (`sqlite.db`) est ignorée par Git (ajoutée dans `.gitignore`).

Pour partager l'état de la base de données :

1. Exécutez le script d'exportation
2. Committez les fichiers JSON générés
3. Poussez vers le dépôt distant

Les autres développeurs pourront ensuite importer ces données en utilisant le script de migration.