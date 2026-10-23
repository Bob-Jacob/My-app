const express = require("express");
const path = require("path");
const { MongoClient } = require("mongodb");

const PORT = process.env.PORT || 3000;
// These come from environment variables so they are easy to change later with Docker (-e / docker-compose)
const MONGO_URL = process.env.MONGO_URL || "mongodb://admin:password@localhost:27017";
const DB_NAME = process.env.DB_NAME || "my-db";
const COLLECTION = "users";
const PROFILE_ID = 1; // single-user demo app

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

let collection;

async function connectToMongo() {
  // Retry loop: when you containerize, the DB container may start after the app
  for (let attempt = 1; attempt <= 10; attempt++) {
    try {
      const client = new MongoClient(MONGO_URL, { serverSelectionTimeoutMS: 3000 });
      await client.connect();
      collection = client.db(DB_NAME).collection(COLLECTION);
      console.log(`Connected to MongoDB (db: ${DB_NAME})`);
      return;
    } catch (err) {
      console.log(`MongoDB connection failed (attempt ${attempt}/10): ${err.message}`);
      await new Promise((r) => setTimeout(r, 3000));
    }
  }
  console.error("Could not connect to MongoDB. Exiting.");
  process.exit(1);
}

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", dbConnected: Boolean(collection) });
});

// Read the profile
app.get("/get-profile", async (req, res) => {
  try {
    const profile = await collection.findOne({ userid: PROFILE_ID }, { projection: { _id: 0 } });
    res.json(
      profile || { userid: PROFILE_ID, name: "", email: "", interests: "" }
    );
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create or update the profile
app.post("/update-profile", async (req, res) => {
  try {
    const { name = "", email = "", interests = "" } = req.body;
    const profile = { userid: PROFILE_ID, name, email, interests };
    await collection.updateOne({ userid: PROFILE_ID }, { $set: profile }, { upsert: true });
    res.json(profile);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

connectToMongo().then(() => {
  app.listen(PORT, () => console.log(`App running at http://localhost:${PORT}`));
});
