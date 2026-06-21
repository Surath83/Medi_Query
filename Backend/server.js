const express = require('express')
const dotenv = require('dotenv')
const { MongoClient } = require('mongodb')
const cors = require('cors')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { createClient } = require('redis')

const fetch = (...args) =>
  import('node-fetch').then(({ default: fetch }) => fetch(...args))

dotenv.config()

const app = express()

app.use(cors())
app.use(express.json())

// =============================
// ENVIRONMENT CHECKS
// =============================

if (!process.env.MONGO_URI) {
  throw new Error('MONGO_URI missing')
}

if (!process.env.MONGO_LOGIN_URI) {
  throw new Error('MONGO_LOGIN_URI missing')
}

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET missing')
}

// =============================
// MONGO CLIENTS
// =============================

const medicineClient = new MongoClient(process.env.MONGO_URI)

const authClient = new MongoClient(process.env.MONGO_LOGIN_URI)

// Redis Client
const redisClient = createClient({
  socket: {
    host: '127.0.0.1',
    port: 6379
  }
})

redisClient.on('error', err => {
  console.error('Redis Error:', err)
})

let collection
let usersCollection

// =============================
// CONNECT DATABASES
// =============================

async function connectDB () {
  // Medicines DB
  await medicineClient.connect()

  const medicineDB = medicineClient.db('ENQUIRY')

  collection = medicineDB.collection('A_Z_medidb')

  // Auth DB
  await authClient.connect()

  const authDB = authClient.db('MediQueryAuth')

  usersCollection = authDB.collection('users')

  // Redis
  await redisClient.connect()

  await redisClient.set('redis_test', 'connected')
  const test = await redisClient.get('redis_test')

  console.log('✅ Redis Connected:', test)

  console.log('Medicine Collection:', collection.collectionName)

  console.log('Users Collection:', usersCollection.collectionName)

  console.log('✅ Connected to MongoDB Atlas')
}

//register
app.post('/auth/register', async (req, res) => {
  try {
    const { username, email, password } = req.body

    if (!username || !email || !password) {
      return res.status(400).json({
        message: 'All fields are required'
      })
    }

    const existingUser = await usersCollection.findOne({
      email
    })

    if (existingUser) {
      return res.status(400).json({
        message: 'Email already exists'
      })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const newUser = {
      username,
      email,
      password: hashedPassword,
      createdAt: new Date()
    }

    const result = await usersCollection.insertOne(newUser)

    const token = jwt.sign(
      {
        id: result.insertedId,
        email
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )

    res.status(201).json({
      message: 'User registered successfully',
      token
    })
  } catch (error) {
    console.error(error)

    res.status(500).json({
      message: 'Server Error'
    })
  }
})

//login
app.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body

    const user = await usersCollection.findOne({
      email
    })

    if (!user) {
      return res.status(401).json({
        message: 'Invalid email or password'
      })
    }

    const validPassword = await bcrypt.compare(password, user.password)

    if (!validPassword) {
      return res.status(401).json({
        message: 'Invalid email or password'
      })
    }

    const token = jwt.sign(
      {
        id: user._id,
        email: user.email
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )

    res.json({
      message: 'Login successful',
      token,
      user: {
        username: user.username,
        email: user.email
      }
    })
  } catch (error) {
    console.error(error)

    res.status(500).json({
      message: 'Server Error'
    })
  }
})

function verifyToken (req, res, next) {
  const authHeader = req.headers.authorization

  if (!authHeader) {
    return res.status(401).json({
      message: 'Access denied'
    })
  }

  const token = authHeader.split(' ')[1]

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET)

    req.user = verified

    next()
  } catch (err) {
    return res.status(401).json({
      message: 'Invalid token'
    })
  }
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
    const cacheKey = `shops:${lat}:${lon}`

    const cached = await redisClient.get(cacheKey)

    if (cached) {
      console.log(`⚡ CACHE HIT [MEDICAL_SHOPS] -> ${cacheKey}`)
      return res.json(JSON.parse(cached))
    }

    console.log(`❌ CACHE MISS [MEDICAL_SHOPS] -> ${cacheKey}`)
    console.log(`🌍 Overpass API Request Executed`)
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

    await redisClient.setEx(cacheKey, 600, JSON.stringify(shops))
    console.log(`💾 CACHE STORED -> ${cacheKey}`)
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
    const cacheKey = `suggestions:${query.toLowerCase()}`

    const cached = await redisClient.get(cacheKey)

    if (cached) {
      console.log(`⚡ CACHE HIT [SIMILAR] -> ${cacheKey}`)
      return res.json(JSON.parse(cached))
    }

    console.log(`❌ CACHE MISS [SIMILAR] -> ${cacheKey}`)
    console.log(`📦 MongoDB Query Executed`)

    const regex = new RegExp('^' + query, 'i')
    const results = await collection
      .find({ name: regex })
      .limit(6)
      .project({ name: 1, _id: 0 })
      .toArray()

    await redisClient.setEx(cacheKey, 1800, JSON.stringify(results))
    console.log(`💾 CACHE STORED -> ${cacheKey}`)
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
    const cacheKey = `medicine:${name.toLowerCase()}`

    // Check Redis first
    const cachedMedicine = await redisClient.get(cacheKey)

    if (cachedMedicine) {
      console.log(`⚡ CACHE HIT [MEDICINE] -> ${cacheKey}`)
      return res.json(JSON.parse(cachedMedicine))
    }

    console.log(`❌ CACHE MISS [MEDICINE] -> ${cacheKey}`)
    console.log(`📦 MongoDB Query Executed`)

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

    // Store in Redis for 1 hour
    await redisClient.setEx(cacheKey, 3600, JSON.stringify(result))
    console.log(`💾 CACHE STORED -> ${cacheKey}`)
    res.json(result)
  } catch (err) {
    console.error('❌ Error fetching medicine:', err)
    res.status(500).json({ error: 'Internal Server Error' })
  }
})

// 🔗 Similar medicines endpoint
app.get('/similar', async (req, res) => {
  const { comp1, comp2 } = req.query

  if (!comp1) {
    return res.status(400).json({
      error: 'Composition required'
    })
  }

  try {
    const cacheKey = `similar:${comp1}:${comp2 || ''}`

    const cached = await redisClient.get(cacheKey)

    if (cached) {
      console.log(`⚡ Redis HIT: ${cacheKey}`)

      return res.json(JSON.parse(cached))
    }

    const query = {
      short_composition1: comp1
    }

    if (comp2 && comp2.trim() !== '') {
      query.short_composition2 = comp2
    }

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

    await redisClient.setEx(cacheKey, 3600, JSON.stringify(formatted))

    console.log(`💾 CACHE STORED -> ${cacheKey}`)
    res.json(formatted)
  } catch (err) {
    console.error(err)

    res.status(500).json({
      error: 'Internal Server Error'
    })
  }
})

const HOST = process.env.HOST || '0.0.0.0'
const PORT = process.env.PORT || 5000

connectDB().then(() => {
  app.listen(PORT, HOST, () =>
    console.log(`🚀 Server running on http://${HOST}:${PORT}`)
  )
})

//jwt
function verifyToken (req, res, next) {
  const authHeader = req.headers.authorization

  if (!authHeader) {
    return res.status(401).json({
      message: 'Access denied'
    })
  }

  const token = authHeader.split(' ')[1]

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET)

    req.user = verified

    next()
  } catch {
    return res.status(401).json({
      message: 'Invalid token'
    })
  }
}

app.get('/redis-status', async (req, res) => {
  try {
    await redisClient.set('test', 'working')

    const value = await redisClient.get('test')

    res.json({
      redis: value
    })
  } catch (err) {
    res.status(500).json({
      error: err.message
    })
  }
})
