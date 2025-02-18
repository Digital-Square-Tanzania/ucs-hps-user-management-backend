import prisma from "../../config/prisma.js";
import { RoleType } from "@prisma/client";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
dotenv.config(); // Load environment variables

import { UserStatus } from "@prisma/client";

class UserSeeder {
  static async seed() {
    try {
      console.log("🌱 Seeding users...");

      // Get passwords from environment variables
      const systemDevPassword = process.env.SYS_DEV_PWD;
      const mohAdminPassword = process.env.MOH_ADMIN_PWD;

      if (!systemDevPassword || !mohAdminPassword) {
        throw new Error("❌ Missing SYS_DEV_PWD or MOH_ADMIN_PWD in environment variables.");
      }

      // Hash the passwords
      const saltRounds = 10;
      const hashedSystemDevPassword = await bcrypt.hash(systemDevPassword, saltRounds);
      const hashedMohAdminPassword = await bcrypt.hash(mohAdminPassword, saltRounds);

      // Get role IDs dynamically
      const systemDevRole = await prisma.role.findUnique({ where: { name: RoleType.SYSTEM_DEVELOPER } });
      const mohAdminRole = await prisma.role.findUnique({ where: { name: RoleType.MOH_ADMIN } });

      if (!systemDevRole || !mohAdminRole) {
        throw new Error("❌ RoleType SYSTEM_DEVELOPER or MOH_ADMIN not found in the database.");
      }

      // User data
      const users = [
        {
          firstName: "Kizito",
          middleName: "S.",
          lastName: "Mrema",
          email: process.env.SYS_DEV_EMAIL,
          password: hashedSystemDevPassword,
          roleId: systemDevRole.id,
          status: UserStatus.ACTIVE,
          joinDate: new Date(),
          phoneNumber: "+255755437887",
        },
        {
          firstName: "MOH",
          middleName: "Admin",
          lastName: "User",
          email: process.env.MOH_ADMIN_EMAIL,
          password: hashedMohAdminPassword,
          roleId: mohAdminRole.id,
          status: UserStatus.ACTIVE,
          joinDate: new Date(),
          phoneNumber: "+255715437887",
        },
      ];

      // Insert or update users
      for (const user of users) {
        await prisma.user.upsert({
          where: { email: user.email },
          update: {},
          create: user,
        });
      }

      console.log("✅ Users seeded successfully.");
    } catch (error) {
      console.error("❌ Seeding failed:", error);
    } finally {
      await prisma.$disconnect();
    }
  }
}

export default UserSeeder;
