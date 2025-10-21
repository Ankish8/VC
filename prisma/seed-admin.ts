import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import crypto from "crypto";

const prisma = new PrismaClient();

async function main() {
  const adminEmail = "ankish@vectorcraft.com";

  // Generate a secure random password
  const password = crypto.randomBytes(12).toString("base64").slice(0, 16);

  // Hash the password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Check if admin user already exists
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (existingAdmin) {
    // Update existing user to be admin
    await prisma.user.update({
      where: { email: adminEmail },
      data: {
        isAdmin: true,
        password: hashedPassword,
        mustChangePassword: false,
      },
    });

    console.log("\n=================================");
    console.log("ADMIN USER UPDATED");
    console.log("=================================");
    console.log("Email:", adminEmail);
    console.log("Password:", password);
    console.log("=================================");
    console.log("\nIMPORTANT: Save these credentials securely!");
    console.log("The password cannot be recovered later.\n");
  } else {
    // Create new admin user
    await prisma.user.create({
      data: {
        email: adminEmail,
        password: hashedPassword,
        name: "Admin",
        isAdmin: true,
        mustChangePassword: false,
        subscriptionType: "lifetime",
        paymentStatus: "completed",
      },
    });

    console.log("\n=================================");
    console.log("ADMIN USER CREATED");
    console.log("=================================");
    console.log("Email:", adminEmail);
    console.log("Password:", password);
    console.log("=================================");
    console.log("\nIMPORTANT: Save these credentials securely!");
    console.log("The password cannot be recovered later.\n");
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("Error creating admin user:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
