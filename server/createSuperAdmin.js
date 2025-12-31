require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const readline = require("readline");
const connectDB = require("./config/db");
const User = require("./models/User");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

const createSuperAdmin = async () => {
  try {
    await connectDB();

    console.log("\n--- Create Super Admin User ---\n");

    const name = await question("Enter Name: ");
    const email = await question("Enter Email: ");
    const password = await question("Enter Password: ");

    if (!name || !email || !password) {
      console.log("All fields are required!");
      process.exit(1);
    }

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      console.log("User already exists with this email!");
      process.exit(1);
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "superadmin",
    });

    console.log(`\nSuper Admin '${user.name}' created successfully!`);
  } catch (error) {
    console.error("Error creating super admin:", error.message);
  } finally {
    rl.close();
    mongoose.connection.close();
    process.exit(0);
  }
};

createSuperAdmin();
