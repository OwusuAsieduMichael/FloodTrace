/**
 * Applies local Supabase migrations to the remote database using DATABASE_URL from .env.local
 * Usage: node scripts/apply-migrations.mjs
 */
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const envPath = path.join(process.cwd(), ".env.local");

if (!fs.existsSync(envPath)) {
  console.error("Missing .env.local with DATABASE_URL");
  process.exit(1);
}

const envContent = fs.readFileSync(envPath, "utf8");
const match = envContent.match(/^DATABASE_URL=(.+)$/m);

if (!match?.[1]) {
  console.error("DATABASE_URL not found in .env.local");
  process.exit(1);
}

const dbUrl = match[1].trim();

console.log("Pushing migrations to remote database...");
execSync(`npx supabase db push --db-url "${dbUrl.replace(/"/g, '\\"')}"`, {
  stdio: "inherit",
  env: process.env,
});

console.log("Migrations applied successfully.");
