import { defineConfig } from "drizzle-kit";
import { config } from "dotenv";

// Determine which environment file to load
// Use DRIZZLE_ENV=production for production migrations
const envFile = process.env.DRIZZLE_ENV === "production"
  ? ".env.production"
  : ".env.local";

config({ path: envFile });

console.log(`[drizzle] Using environment: ${envFile}`);

export default defineConfig({
  schema: "./database/drizzle/schema/index.ts",
  out: "./database/drizzle/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
