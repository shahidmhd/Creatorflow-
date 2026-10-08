import { prisma } from "../src/repositories/prisma";

async function main() {
  const email = "admin@creatorflow.app";
  const username = "admin";

  const admin = await prisma.$executeRawUnsafe(`
    INSERT INTO "User" ("id", "supabaseId", "email", "name", "username", "passwordHash", "role", "isActive", "createdAt", "updatedAt")
    VALUES (
      gen_random_uuid(),
      'sb_admin_001',
      'admin@creatorflow.app',
      'CreatorFlow Admin',
      'admin',
      'admin123',
      'ADMIN',
      true,
      NOW(),
      NOW()
    )
    ON CONFLICT ("username") DO UPDATE 
    SET "passwordHash" = 'admin123', "role" = 'ADMIN', "isActive" = true;
  `);

  console.log("✅ Admin user seeded successfully!");
  console.log("   Username: admin");
  console.log("   Password: admin123");
  console.log("   Role: ADMIN");
}

main()
  .catch((e) => {
    console.error("Error creating admin:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
