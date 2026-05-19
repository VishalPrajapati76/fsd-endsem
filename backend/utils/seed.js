/**
 * Seed Script — Creates demo admin and user accounts
 * Run: node utils/seed.js
 */
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });
const mongoose = require("mongoose");
const User = require("../models/User");

const users = [
  { name: "Admin User", email: "admin@complaint.com", password: "admin123", role: "admin" },
  { name: "Demo User", email: "user@complaint.com", password: "user1234", role: "user" },
];

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    for (const u of users) {
      const exists = await User.findOne({ email: u.email });
      if (exists) { console.log(`⏭  Skipping ${u.email} (already exists)`); continue; }
      await User.create(u);
      console.log(`✅ Created ${u.role}: ${u.email}`);
    }

    console.log("\n🎉 Seed complete!");
    console.log("   Admin — admin@complaint.com / admin123");
    console.log("   User  — user@complaint.com  / user1234");
  } catch (err) {
    console.error("❌ Seed error:", err.message);
  } finally {
    mongoose.disconnect();
  }
};

seed();
