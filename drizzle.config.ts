import { config as loadEnv } from "dotenv";
import { defineConfig } from "drizzle-kit";

// Reads DATABASE_URL from `.env`, so a plain `npx drizzle-kit push` works
// against whichever database (local, Neon, Supabase, VPS) is configured there.
loadEnv({ quiet: true });

const url = process.env.DATABASE_URL;
if (!url) {
  throw new Error(
    "DATABASE_URL is not set. Copy .env.example to .env and paste your database connection string (see DEPLOYMENT.md, step 5).",
  );
}

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dbCredentials: { url },
});
