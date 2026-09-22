import dotenv from "dotenv";
import bcrypt from "bcryptjs";

import connectDB from "../config/db.js";
import User from "../models/User.js";

dotenv.config();

const createSuperAdmin = async () => {
  try {
    await connectDB();

    const existingUser = await User.findOne({
      email: "superadmin@example.com",
    });

    if (existingUser) {
      console.log("SuperAdmin already exists");
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash(
      "SuperAdmin123!",
      12
    );

    await User.create({
      name: "Super Admin",
      email: "superadmin@example.com",
      password: hashedPassword,
      role: "SuperAdmin",
    });

    console.log("SuperAdmin created successfully");

    process.exit(0);
  } catch (error) {
    console.error("Error creating SuperAdmin:", error);
    process.exit(1);
  }
};

createSuperAdmin();