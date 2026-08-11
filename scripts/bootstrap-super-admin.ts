import { PrismaClient } from "@prisma/client";

const email = process.env.SUPER_ADMIN_BOOTSTRAP_EMAIL?.trim().toLowerCase();
if (!email) {
  throw new Error("Set SUPER_ADMIN_BOOTSTRAP_EMAIL to the verified account email before running this one-time bootstrap.");
}

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error("No account exists for SUPER_ADMIN_BOOTSTRAP_EMAIL. Create and verify that account first.");
  if (!user.verified) throw new Error("The bootstrap account must have a verified email.");
  if (user.role === "SUPER_ADMIN") throw new Error("The specified account is already a super administrator; refusing to make a duplicate change.");

  await prisma.$transaction([
    prisma.user.update({ where: { id: user.id }, data: { role: "SUPER_ADMIN" } }),
    prisma.auditLog.create({
      data: {
        action: "SUPER_ADMIN_BOOTSTRAPPED",
        targetId: user.id,
        metadata: JSON.stringify({ source: "scripts/bootstrap-super-admin.ts" }),
      },
    }),
  ]);
  console.log("Super administrator bootstrap completed for the designated verified account.");
}

main()
  .catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : "Super administrator bootstrap failed.");
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
