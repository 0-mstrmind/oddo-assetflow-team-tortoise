import mongoose from "mongoose";
import dotenv from "dotenv";
import Resource from "./src/modules/resource/resource.model.js";

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("Error: MONGODB_URI is not defined in the environment variables.");
  process.exit(1);
}

const resources = [
  {
    name: "Board Room A",
    type: "Conference Room",
    location: "Building A, 3rd Floor",
    status: "available",
  },
  {
    name: "Conference Room B",
    type: "Huddle Space",
    location: "Building B, 1st Floor",
    status: "available",
  },
  {
    name: "AV Equipment Cart",
    type: "Equipment",
    location: "IT Storage Room",
    status: "available",
  },
];

async function seed() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("Connected successfully!");

    console.log("Seeding resources...");
    for (const res of resources) {
      // Check if resource already exists by name to avoid duplicate seeds
      const exists = await Resource.findOne({ name: res.name });
      if (!exists) {
        await Resource.create(res);
        console.log(`+ Created resource: ${res.name}`);
      } else {
        console.log(`~ Resource already exists: ${res.name}`);
      }
    }

    console.log("Seeding completed successfully!");
  } catch (error) {
    console.error("Seeding failed:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB.");
  }
}

seed();
