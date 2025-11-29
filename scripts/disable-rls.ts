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

async function disableRLS() {
  console.log("⚠️  Disabling Row Level Security (RLS)...\n");
  console.log("⚠️  WARNING: This removes security features. Only use for development!\n");

  try {
    // Disable RLS on all tables
    console.log("📋 Disabling RLS on tables...");
    for (const table of TABLES) {
      await sql.unsafe(`ALTER TABLE ${table} DISABLE ROW LEVEL SECURITY;`);
      console.log(`  ✅ ${table}`);
    }

    // Verify RLS is disabled
    console.log("\n🔍 Verifying RLS status...");
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
      const status = row.rowsecurity ? "⚠️  Still Enabled" : "✅ Disabled";
      console.log(`  ${row.tablename}: ${status}`);
    }

    console.log("\n✨ RLS disabled successfully!");
    console.log("⚠️  Remember: This is not recommended for production.\n");
  } catch (error) {
    console.error("\n❌ Error disabling RLS:", error);
    if (error instanceof Error) {
      console.error("   Message:", error.message);
    }
    process.exit(1);
  } finally {
    await sql.end();
  }
}

disableRLS()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });

