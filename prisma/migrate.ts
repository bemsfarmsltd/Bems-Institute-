import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { randomUUID, createHash } from "node:crypto";
import pg from "pg";

if (existsSync(".env.local")) {
  process.loadEnvFile(".env.local");
}

async function runMigrations() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set");
  }

  const pool = new pg.Pool({ connectionString });
  const client = await pool.connect();

  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS "_prisma_migrations" (
        "id" VARCHAR(36) PRIMARY KEY,
        "checksum" VARCHAR(64) NOT NULL,
        "finished_at" TIMESTAMPTZ,
        "migration_name" VARCHAR(255) NOT NULL UNIQUE,
        "logs" TEXT,
        "rolled_back_at" TIMESTAMPTZ,
        "started_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "applied_steps_count" INTEGER NOT NULL DEFAULT 0
      );
    `);

    const migrationsDir = join(process.cwd(), "prisma", "migrations");
    const entries = readdirSync(migrationsDir, { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => d.name)
      .sort();

    for (const folder of entries) {
      const sqlPath = join(migrationsDir, folder, "migration.sql");
      if (!existsSync(sqlPath)) continue;

      const existing = await client.query(
        `SELECT id FROM "_prisma_migrations" WHERE "migration_name" = $1 AND "finished_at" IS NOT NULL`,
        [folder]
      );

      if (existing.rowCount && existing.rowCount > 0) {
        console.log(`✓ Migration already applied: ${folder}`);
        continue;
      }

      const sql = readFileSync(sqlPath, "utf8");
      const checksum = createHash("sha256").update(sql).digest("hex");

      console.log(`→ Applying migration: ${folder}...`);
      await client.query("BEGIN");
      try {
        await client.query(sql);
        await client.query(
          `INSERT INTO "_prisma_migrations" ("id", "checksum", "finished_at", "migration_name", "applied_steps_count")
           VALUES ($1, $2, now(), $3, 1)
           ON CONFLICT ("migration_name") DO UPDATE SET "finished_at" = now(), "applied_steps_count" = 1`,
          [randomUUID(), checksum, folder]
        );
        await client.query("COMMIT");
        console.log(`✓ Applied migration: ${folder}`);
      } catch (err) {
        await client.query("ROLLBACK");
        throw err;
      }
    }

    console.log("All Prisma SQL migrations applied to database successfully.");
  } finally {
    client.release();
    await pool.end();
  }
}

runMigrations().catch((err) => {
  console.error("Migration error:", err);
  process.exit(1);
});
