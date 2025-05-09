import { defineConfig } from "drizzle-kit";
import { join } from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

// Obtenir le chemin absolu du répertoire db
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const dbPath = join(__dirname, "db", "sqlite.db");

export default defineConfig({
  out: "./db/migrations",
  schema: "./shared/schema.ts",
  dialect: "sqlite",
  dbCredentials: {
    url: `file:${dbPath}`,
  },
  verbose: true,
});
