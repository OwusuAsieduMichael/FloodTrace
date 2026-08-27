/**
 * Idempotent demo officers for the Assign to dropdown.
 * Usage: node scripts/seed-demo-officers.mjs
 */
import { createClient } from "@supabase/supabase-js";
import fs from "node:fs";
import path from "node:path";

const DEMO_OFFICERS = [
  { email: "kwame.mensah@floodtrace.demo", fullName: "Kwame Mensah" },
  { email: "ama.boateng@floodtrace.demo", fullName: "Ama Boateng" },
  { email: "yaw.asante@floodtrace.demo", fullName: "Yaw Asante" },
  { email: "akosua.owusu@floodtrace.demo", fullName: "Akosua Owusu" },
  { email: "kofi.adjei@floodtrace.demo", fullName: "Kofi Adjei" },
  { email: "efua.darko@floodtrace.demo", fullName: "Efua Darko" },
  { email: "nana.agyeman@floodtrace.demo", fullName: "Nana Agyeman" },
];

function loadEnvLocal() {
  const envPath = path.join(process.cwd(), ".env.local");
  if (!fs.existsSync(envPath)) {
    throw new Error("Missing .env.local");
  }

  const values = {};
  for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (!match) {
      continue;
    }
    values[match[1]] = match[2].trim().replace(/^["']|["']$/g, "");
  }
  return values;
}

async function findUserIdByEmail(admin, email) {
  let page = 1;
  const perPage = 200;

  while (page <= 10) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage });
    if (error) {
      throw error;
    }

    const match = data.users.find(
      (user) => user.email?.toLowerCase() === email.toLowerCase()
    );
    if (match) {
      return match.id;
    }

    if (data.users.length < perPage) {
      return null;
    }

    page += 1;
  }

  return null;
}

async function ensureOfficer(admin, officer) {
  let userId = await findUserIdByEmail(admin, officer.email);

  if (!userId) {
    const { data, error } = await admin.auth.admin.createUser({
      email: officer.email,
      password: crypto.randomUUID() + crypto.randomUUID(),
      email_confirm: true,
      user_metadata: {
        full_name: officer.fullName,
        role: "authority",
      },
    });

    if (error) {
      throw new Error(`${officer.email}: ${error.message}`);
    }

    userId = data.user.id;
  }

  const { error: profileError } = await admin.from("profiles").upsert(
    {
      id: userId,
      full_name: officer.fullName,
      role: "authority",
      authority_status: "approved",
    },
    { onConflict: "id" }
  );

  if (profileError) {
    throw new Error(`${officer.fullName} profile: ${profileError.message}`);
  }

  return officer.fullName;
}

async function main() {
  const env = loadEnvLocal();
  const url = env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRole = env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRole) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required."
    );
  }

  const admin = createClient(url, serviceRole, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const names = [];
  for (const officer of DEMO_OFFICERS) {
    names.push(await ensureOfficer(admin, officer));
  }

  console.log(`Ready to assign: ${names.join(", ")}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
