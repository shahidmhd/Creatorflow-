import "dotenv/config";
import { app } from "./app";
import { prisma } from "./repositories/prisma";

const PORT = parseInt(process.env.PORT ?? "4000", 10);

async function main() {
  await prisma.$connect();
  console.log("✅ Database connected");

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
