const express = require("express");
const dotenv = require("dotenv");
const { MongoClient } = require("mongodb");
const cors = require("cors");

dotenv.config();
const app = express();
app.use(cors());

const uri = process.env.MONGO_URI;
const client = new MongoClient(uri);

let collection;

async function connectDB() {
  await client.connect();
  const db = client.db("ENQUIRY");
  collection = db.collection("A_Z_medidb");
  console.log("✅ Connected to MongoDB Atlas");
}

/**
 * 🔎 Suggestions endpoint
 * Returns only medicine name
 * Example: http://10.233.33.102:5000/suggestions?q=Augm
 */
app.get("/suggestions", async (req, res) => {
  const query = req.query.q;
  if (!query || query.trim() === "") return res.json([]);

  try {
    const regex = new RegExp("^" + query, "i"); // starts with
    const results = await collection
      .find({ name: regex })
      .limit(6)
      .project({ name: 1, _id: 0 }) // ✅ only return name, no _id, no price
      .toArray();

    res.json(results);
  } catch (err) {
    console.error("❌ Error fetching suggestions:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

/**
 * 💊 Medicine details endpoint
 * Returns full medicine info + substitutes
 * Example: http://10.233.33.102:5000/medicine?name=Augmentin%20625%20Duo%20Tablet
 */
app.get("/medicine", async (req, res) => {
  const name = req.query.name;
  if (!name || name.trim() === "")
    return res.status(400).json({ error: "Medicine name required" });

  try {
    const result = await collection.findOne(
      { name: new RegExp("^" + name + "$", "i") },
      {
        projection: {
          name: 1,
          manufacturer_name: 1,
          "price(₹)": 1,
          short_composition1: 1,
          short_composition2: 1,
          type: 1,
          pack_size_label: 1,
          Consolidated_Side_Effects: 1,
          use0: 1,
          use1: 1,
          use2: 1,
          use3: 1,
          use4: 1,
          substitute0: 1,
          substitute1: 1,
          substitute2: 1,
          substitute3: 1,
          substitute4: 1,
          "Habit Forming": 1,
          "Therapeutic Class": 1,
        },
      }
    );

    if (!result) return res.status(404).json({ error: "Medicine not found" });

    // Rename price(₹) to price
    if (result["price(₹)"] !== undefined) {
      result.price = result["price(₹)"];
    }

    res.json(result);
  } catch (err) {
    console.error("❌ Error fetching medicine:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

/**
 * 🔗 Similar medicines endpoint
 */
app.get("/similar", async (req, res) => {
  const { comp1, comp2 } = req.query;
  if (!comp1) return res.status(400).json({ error: "Composition required" });

  try {
    const query = { short_composition1: comp1 };
    if (comp2 && comp2.trim() !== "") query.short_composition2 = comp2;

    const similarMeds = await collection
      .find(query)
      .project({
        name: 1,
        manufacturer_name: 1,
        "price(₹)": 1,
        short_composition1: 1,
        short_composition2: 1,
      })
      .toArray();

    const formatted = similarMeds.map((item) => ({
      ...item,
      price: item["price(₹)"],
    }));

    res.json(formatted);
  } catch (err) {
    console.error("❌ Error fetching similar medicines:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

const HOST = process.env.HOST || "0.0.0.0";
const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, HOST, () =>
    console.log(`🚀 Server running on http://${HOST}:${PORT}`)
  );
});
