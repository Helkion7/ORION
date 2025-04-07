const mongoose = require("mongoose");
const User = require("./models/User");
const dotenv = require("dotenv");

// Load environment variables
dotenv.config();

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB for seeding");

    // Create admin user if it doesn't exist
    const adminExists = await User.findOne({ email: "admin@example.com" });
    if (!adminExists) {
      await User.create({
        name: "Admin User",
        email: "admin@example.com",
        password: "Admin123!",
        role: "admin",
      });
      console.log("Admin user created");
    } else {
      console.log("Admin user already exists");
    }

    // Create regular user if it doesn't exist
    const userExists = await User.findOne({ email: "user@example.com" });
    if (!userExists) {
      await User.create({
        name: "Regular User",
        email: "user@example.com",
        password: "User123!",
        role: "user",
      });
      console.log("Regular user created");
    } else {
      console.log("Regular user already exists");
    }

    console.log("Database seeding completed");
    mongoose.connection.close();
  } catch (error) {
    console.error("Seeding error:", error);
    process.exit(1);
  }
};

seedDB();
