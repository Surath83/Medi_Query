const express = require('express')
const dotenv = require('dotenv')
const { MongoClient } = require('mongodb')
const cors = require('cors')
const fetch = (...args) =>
  import('node-fetch').then(({ default: fetch }) => fetch(...args))

dotenv.config()
const app = express()
app.use(cors())
app.use(express.json())

const uri = process.env.MONGO_URI
const client = new MongoClient(uri)
let collection

// 🔗 Connect to MongoDB
async function connectDB () {
  await client.connect()
  const db = client.db('ENQUIRY')
  collection = db.collection('A_Z_medidb')
  console.log('✅ Connected to MongoDB Atlas')
}

// 🌍 Get nearby medical shops
app.post('/get_medical_shops', async (req, res) => {
  const { latitude, longitude } = req.body
  const lat = parseFloat(latitude)
  const lon = parseFloat(longitude)

  if (!lat || !lon) {
    return res.status(400).json({ error: 'Latitude and longitude required' })
  }

  const RADIUS = 10000
  const MAX_RESULTS = 40

  const query = `[out:json][timeout:25];
  (
    node["amenity"="pharmacy"](around:${RADIUS},${lat},${lon});
    node["shop"="chemist"](around:${RADIUS},${lat},${lon});
    node["shop"="drugstore"](around:${RADIUS},${lat},${lon});
  );
  out center qt ${MAX_RESULTS};`

  try {
    const response = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `data=${encodeURIComponent(query)}`
    })

    const data = await response.json()
    const elements = data.elements || []

    const shops = elements.slice(0, MAX_RESULTS).map(el => ({
      id: el.id,
      name: el.tags?.name || 'Medical Shop',
      lat: el.lat,
      lon: el.lon,
      address:
        el.tags?.['addr:street'] ||
        el.tags?.['operator'] ||
        el.tags?.['addr:full'] ||
        'Address not available'
    }))

    res.json(shops)
  } catch (err) {
    console.error('❌ Error fetching nearby shops:', err)
    res.status(500).json({ error: 'Failed to fetch nearby medical shops' })
  }
})

// 🔎 Suggestions endpoint
app.get('/suggestions', async (req, res) => {
  const query = req.query.q
  if (!query || query.trim() === '') return res.json([])

  try {
    const regex = new RegExp('^' + query, 'i')
    const results = await collection
      .find({ name: regex })
      .limit(6)
      .project({ name: 1, _id: 0 })
      .toArray()

    res.json(results)
  } catch (err) {
    console.error('❌ Error fetching suggestions:', err)
    res.status(500).json({ error: 'Internal Server Error' })
  }
})

// 💊 Medicine details endpoint
app.get('/medicine', async (req, res) => {
  const name = req.query.name
  if (!name || name.trim() === '')
    return res.status(400).json({ error: 'Medicine name required' })

  try {
    const result = await collection.findOne(
      { name: new RegExp('^' + name + '$', 'i') },
      {
        projection: {
          name: 1,
          manufacturer_name: 1,
          'price(₹)': 1,
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
          'Habit Forming': 1,
          'Therapeutic Class': 1
        }
      }
    )

    if (!result) return res.status(404).json({ error: 'Medicine not found' })

    if (result['price(₹)'] !== undefined) {
      result.price = result['price(₹)']
    }

    res.json(result)
  } catch (err) {
    console.error('❌ Error fetching medicine:', err)
    res.status(500).json({ error: 'Internal Server Error' })
  }
})

// 🔗 Similar medicines endpoint
app.get('/similar', async (req, res) => {
  const { comp1, comp2 } = req.query
  if (!comp1) return res.status(400).json({ error: 'Composition required' })

  try {
    const query = { short_composition1: comp1 }
    if (comp2 && comp2.trim() !== '') query.short_composition2 = comp2

    const similarMeds = await collection
      .find(query)
      .project({
        name: 1,
        manufacturer_name: 1,
        'price(₹)': 1,
        short_composition1: 1,
        short_composition2: 1
      })
      .toArray()

    const formatted = similarMeds.map(item => ({
      ...item,
      price: item['price(₹)']
    }))

    res.json(formatted)
  } catch (err) {
    console.error('❌ Error fetching similar medicines:', err)
    res.status(500).json({ error: 'Internal Server Error' })
  }
})

const HOST = process.env.HOST || '0.0.0.0'
const PORT = process.env.PORT || 5000

connectDB().then(() => {
  app.listen(PORT, HOST, () =>
    console.log(`🚀 Server running on http://${HOST}:${PORT}`)
  )
})
