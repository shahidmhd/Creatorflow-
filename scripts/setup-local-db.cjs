const fs = require("node:fs");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

const root = path.resolve(__dirname, "..");
require("dotenv").config({ path: path.join(root, ".env") });

function run(command, args, env = process.env) {
  const result = spawnSync(command, args, { cwd: root, env, stdio: "inherit" });
  if (result.error) throw new Error(`Could not start ${path.basename(command)}: ${result.error.code}`);
  if (result.status !== 0) throw new Error(`${path.basename(command)} failed; setup stopped. See the error above.`);
}

function findPsql() {
  if (process.env.PSQL_PATH) return process.env.PSQL_PATH;
  if (spawnSync("psql", ["--version"], { stdio: "ignore" }).status === 0) return "psql";
  const installations = path.join(process.env.ProgramFiles || "C:\\Program Files", "PostgreSQL");
  if (process.platform === "win32" && fs.existsSync(installations)) {
    for (const version of fs.readdirSync(installations).sort((a, b) => b.localeCompare(a, undefined, { numeric: true }))) {
      const candidate = path.join(installations, version, "bin", "psql.exe");
      if (fs.existsSync(candidate)) return candidate;
    }
  }
  throw new Error("psql was not found. Install PostgreSQL client tools or set PSQL_PATH to the psql executable.");
}

async function main() {
  let url;
  try { url = new URL(process.env.DATABASE_URL); }
  catch { throw new Error("Set a valid PostgreSQL DATABASE_URL in the root .env file."); }
  if (!["postgres:", "postgresql:"].includes(url.protocol) || !["localhost", "127.0.0.1", "[::1]"].includes(url.hostname)) {
    throw new Error("This setup command only supports PostgreSQL on localhost, 127.0.0.1, or ::1.");
  }
  const username = decodeURIComponent(url.username);
  const password = decodeURIComponent(url.password);
  const database = decodeURIComponent(url.pathname.slice(1));
  if (!username || !password || !database) throw new Error("DATABASE_URL must include a username, password, and database name.");
  if ([username, password, database].some(value => value.includes("\0"))) throw new Error("Database settings cannot contain null characters.");

  const admin = process.env.PGUSER || "postgres";
  console.log(`Setting up local database ${database} for ${username} on ${url.hostname}:${url.port || "5432"}.`);
  console.log(`When prompted, enter the PostgreSQL installation password for ${admin}.`);
  run(findPsql(), [
    "-X", "-v", "ON_ERROR_STOP=1", "-h", url.hostname.replace(/^\[|\]$/g, ""),
    "-p", url.port || "5432", "-U", admin, "-d", "postgres",
    "-f", path.join(__dirname, "setup-local-db.sql"),
  ], {
    ...process.env, PGCONNECT_TIMEOUT: "5",
    CONTENTREWARDS_DB_USER: username,
    CONTENTREWARDS_DB_PASSWORD: password,
    CONTENTREWARDS_DB_NAME: database,
  });

  // Verify the application login before applying any schema changes.
  const { PrismaClient } = require("@prisma/client");
  const prisma = new PrismaClient();
  try { await prisma.$queryRaw`SELECT 1`; }
  catch { throw new Error("The application login failed. If the role already existed, its password was left unchanged; make DATABASE_URL match that role's credentials."); }
  finally { await prisma.$disconnect(); }

  const prismaPackage = require.resolve("prisma/package.json");
  const prismaCli = path.resolve(path.dirname(prismaPackage), require(prismaPackage).bin.prisma);
  run(process.execPath, [prismaCli, "migrate", "deploy", "--schema", path.join(root, "apps/api/prisma/schema.prisma")]);
  console.log("Database connection verified and existing migrations applied. Restart the API with npm run dev.");
}

main().catch(error => {
  console.error(error.message);
  process.exitCode = 1;
});
