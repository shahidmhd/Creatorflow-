import "dotenv/config";
import { app } from "./app";
import { prisma } from "./repositories/prisma";

const PORT = parseInt(process.env.PORT ?? "4000", 10);

async function main() {
  await prisma.$connect();
  console.log("✅ Database connected");

  try {
    await prisma.user.count();
  } catch (err) {
    console.log("🔄 Database tables not found or uninitialized. Syncing schema...", err);
    try {
      const { execSync } = await import("child_process");
      execSync("npx prisma db push --accept-data-loss", { cwd: process.cwd(), stdio: "inherit" });
      console.log("✅ Database schema synchronized successfully");
    } catch (pushErr) {
      console.error("❌ Failed to sync database schema:", pushErr);
    }
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 CreatorFlow API running on port ${PORT}`);
    console.log(`   Environment: ${process.env.NODE_ENV ?? "development"}`);
  });
}

main().catch((err) => {
  console.error("❌ Failed to start server:", err);
  process.exit(1);
});

process.on("SIGTERM", async () => {
  await prisma.$disconnect();
  process.exit(0);
});
