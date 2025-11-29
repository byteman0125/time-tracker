import postgres from "postgres";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error("❌ DATABASE_URL environment variable is not set!");
  process.exit(1);
}

const sql = postgres(connectionString, { prepare: false });

const TABLES = [
  "profiles",
  "interview_steps",
  "interviews",
  "time_tracking",
  "transcriptions",
  "tech_interviews",
];

async function setupRLS() {
  console.log("🔒 Setting up Row Level Security (RLS)...\n");

  try {
    // Enable RLS on all tables
    console.log("📋 Enabling RLS on tables...");
    for (const table of TABLES) {
      await sql.unsafe(`ALTER TABLE ${table} ENABLE ROW LEVEL SECURITY;`);
      console.log(`  ✅ ${table}`);
    }

    // Drop existing policies if they exist
    console.log("\n🗑️  Cleaning up existing policies...");
    for (const table of TABLES) {
      await sql.unsafe(`DROP POLICY IF EXISTS "Allow all on ${table}" ON ${table};`);
    }

    // Create permissive policies
    console.log("\n🔓 Creating unrestricted policies...");
    for (const table of TABLES) {
      await sql.unsafe(`
        CREATE POLICY "Allow all on ${table}"
          ON ${table}
          FOR ALL
          USING (true)
          WITH CHECK (true);
      `);
      console.log(`  ✅ ${table}`);
    }

    // Verify RLS is enabled
    console.log("\n🔍 Verifying RLS setup...");
    const result = await sql.unsafe(`
      SELECT 
        tablename,
        rowsecurity
      FROM pg_tables
      WHERE schemaname = 'public'
        AND tablename IN (${TABLES.map((t) => `'${t}'`).join(", ")})
      ORDER BY tablename;
    `);

    console.log("\n📊 RLS Status:");
    const rows = Array.from(result) as unknown as Array<{ tablename: string; rowsecurity: boolean }>;
    for (const row of rows) {
      const status = row.rowsecurity ? "✅ Enabled" : "❌ Disabled";
      console.log(`  ${row.tablename}: ${status}`);
    }

    console.log("\n✨ RLS setup completed successfully!");
    console.log("\n💡 All tables now have unrestricted access via RLS policies.");
    console.log("   This works with both direct connections and Supabase client.\n");
  } catch (error) {
    console.error("\n❌ Error setting up RLS:", error);
    if (error instanceof Error) {
      console.error("   Message:", error.message);
    }
    process.exit(1);
  } finally {
    await sql.end();
  }
}

setupRLS()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });

