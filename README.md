# DigitalCompanion

Une application de compagnon numérique basée sur l'IA.

## Prérequis

- Node.js (version 18 ou supérieure)
- npm (gestionnaire de paquets Node.js)

## Installation

Pour installer les dépendances nécessaires, exécutez la commande suivante dans le répertoire du projet :

```bash
npm install
```

## Configuration de la base de données

L'application utilise SQLite comme base de données. Pour initialiser la base de données avec les données de test :

```bash
node db/migrate-to-sqlite.js
```

Cette commande crée une base de données SQLite avec les tables nécessaires et importe les données depuis les fichiers JSON dans le répertoire `db/tables_json/`.

## Démarrage de l'application

### Démarrage en mode développement

Pour lancer l'application en mode développement :

```bash
npm run dev
```

Cette commande démarre le serveur backend avec le frontend intégré. L'application sera accessible à l'adresse suivante dans votre navigateur :

```
http://localhost:3000
```

### Construction pour la production

Pour construire l'application pour la production :

```bash
npm run build
```

Puis pour démarrer l'application en mode production :

```bash
npm start
```

## Structure du projet

- `client/` - Code source du frontend (React)
- `server/` - Code source du backend (Express)
- `db/` - Scripts et fichiers de base de données
- `shared/` - Types et schémas partagés entre le frontend et le backend

## Fonctionnalités

- Création et gestion de compagnons IA personnalisés
- Conversations avec les compagnons IA
- Stockage des conversations dans une base de données SQLite
- Interface utilisateur moderne et réactive

## Dépannage

Si vous rencontrez des problèmes lors du démarrage de l'application :

1. Vérifiez que toutes les dépendances sont installées correctement avec `npm install`
2. Assurez-vous que la base de données a été correctement initialisée avec `node db/migrate-to-sqlite.js`
3. Vérifiez les logs du serveur pour identifier d'éventuelles erreurs