const mongoose = require("mongoose");
const User = require("./models/User");
const dotenv = require("dotenv");

// Load environment variables
dotenv.config();

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB for seeding");

    // Admin Users
    const adminUsers = [
      {
        name: "Admin User",
        email: "admin@example.com",
        password: process.env.SEED_ADMIN_PASSWORD,
        role: "admin",
      },
      {
        name: "System Administrator",
        email: "sysadmin@example.com",
        password: process.env.SEED_ADMIN_PASSWORD,
        role: "admin",
      },
    ];

    // First Line Support Users
    const firstLineUsers = [
      {
        name: "John Support",
        email: "john@support.com",
        password: process.env.SEED_USER_PASSWORD,
        role: "firstLineSupport",
      },
      {
        name: "Lisa Helpdesk",
        email: "lisa@support.com",
        password: process.env.SEED_USER_PASSWORD,
        role: "firstLineSupport",
      },
      {
        name: "Robert Techsupport",
        email: "robert@support.com",
        password: process.env.SEED_USER_PASSWORD,
        role: "firstLineSupport",
      },
    ];

    // Second Line Support Users
    const secondLineUsers = [
      {
        name: "Maria Specialist",
        email: "maria@specialist.com",
        password: process.env.SEED_USER_PASSWORD,
        role: "secondLineSupport",
      },
      {
        name: "Alex Technical",
        email: "alex@specialist.com",
        password: process.env.SEED_USER_PASSWORD,
        role: "secondLineSupport",
      },
    ];

    // Regular Users
    const regularUsers = [
      {
        name: "Regular User",
        email: "user@example.com",
        password: process.env.SEED_USER_PASSWORD,
        role: "user",
      },
      {
        name: "Jane Smith",
        email: "jane@example.com",
        password: process.env.SEED_USER_PASSWORD,
        role: "user",
      },
      {
        name: "Michael Johnson",
        email: "michael@example.com",
        password: process.env.SEED_USER_PASSWORD,
        role: "user",
      },
      {
        name: "Sarah Williams",
        email: "sarah@example.com",
        password: process.env.SEED_USER_PASSWORD,
        role: "user",
      },
      {
        name: "David Brown",
        email: "david@example.com",
        password: process.env.SEED_USER_PASSWORD,
        role: "user",
      },
    ];

    // Function to create users from a list and return created users
    const createUsers = async (usersList) => {
      const createdUsers = [];

      for (const userData of usersList) {
        const userExists = await User.findOne({ email: userData.email });
        if (!userExists) {
          const user = await User.create(userData);
          createdUsers.push(user);
          console.log(
            `${userData.role} user created: ${userData.name} (${userData.email})`
          );
        } else {
          console.log(`User already exists: ${userData.email}`);
          createdUsers.push(userExists); // Add existing user to the array for count tracking
        }
      }

      return createdUsers;
    };

    // Create all users
    const admins = await createUsers(adminUsers);
    const firstLineStaff = await createUsers(firstLineUsers);
    const secondLineStaff = await createUsers(secondLineUsers);
    const users = await createUsers(regularUsers);

    // Log summary statistics
    const totalUsers =
      admins.length +
      firstLineStaff.length +
      secondLineStaff.length +
      users.length;

    console.log("\nDatabase seeding completed successfully!");
    console.log("----------------------------------");
    console.log(`Total users in database: ${totalUsers}`);
    console.log(`Admin users: ${admins.length}`);
    console.log(`First line support: ${firstLineStaff.length}`);
    console.log(`Second line support: ${secondLineStaff.length}`);
    console.log(`Regular users: ${users.length}`);
    console.log(
      "\nYou can now run the seedTickets.js script to populate tickets"
    );
    console.log("----------------------------------");

    mongoose.connection.close();
  } catch (error) {
    console.error("Seeding error:", error);
    process.exit(1);
  }
};

seedDB();
