const express = require('express')
const dotenv = require('dotenv')
const { MongoClient, ObjectId } = require('mongodb')
const cors = require('cors')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { createClient } = require('redis')

const fetch = (...args) =>
  import('node-fetch').then(({ default: fetch }) => fetch(...args))

dotenv.config()

const app = express()

// ============================================================
// CONFIGURATION
// ============================================================

const HOST = process.env.HOST || '0.0.0.0'
const PORT = Number(process.env.PORT) || 5000

if (!process.env.MONGO_URI) {
  throw new Error('MONGO_URI missing')
}

if (!process.env.MONGO_LOGIN_URI) {
  throw new Error('MONGO_LOGIN_URI missing')
}

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET missing')
}

if (process.env.JWT_SECRET.length < 32) {
  throw new Error('JWT_SECRET must be at least 32 characters long')
}

// ============================================================
// CORS
// ============================================================

const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS
      .split(',')
      .map(origin => origin.trim())
      .filter(Boolean)
  : []

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests without Origin header
      // such as Postman, curl, server-to-server requests
      if (!origin) {
        return callback(null, true)
      }

      if (
        allowedOrigins.length === 0 ||
        allowedOrigins.includes('*') ||
        allowedOrigins.includes(origin)
      ) {
        return callback(null, true)
      }

      return callback(new Error('CORS origin not allowed'))
    },
    credentials: true
  })
)

// ============================================================
// EXPRESS
// ============================================================

app.use(express.json({ limit: '1mb' }))

app.disable('x-powered-by')

// ============================================================
// MONGODB
// ============================================================

const medicineClient = new MongoClient(
  process.env.MONGO_URI,
  {
    serverSelectionTimeoutMS: 10000
  }
)

const authClient = new MongoClient(
  process.env.MONGO_LOGIN_URI,
  {
    serverSelectionTimeoutMS: 10000
  }
)

let collection = null
let usersCollection = null

// ============================================================
// REDIS
// ============================================================

let redisClient = null
let redisAvailable = false

if (process.env.REDIS_URL) {
  console.log('Redis URL detected')

  redisClient = createClient({
    url: process.env.REDIS_URL
  })

  redisClient.on('error', error => {
    redisAvailable = false

    console.error(
      '[REDIS ERROR]',
      error.message
    )
  })

  redisClient.on('ready', () => {
    redisAvailable = true

    console.log('Redis ready')
  })

  redisClient.on('end', () => {
    redisAvailable = false

    console.log('Redis connection closed')
  })

  redisClient.on('reconnecting', () => {
    console.log('Redis reconnecting...')
  })
} else {
  console.log(
    'REDIS_URL not configured. Redis cache disabled.'
  )
}

// ============================================================
// REDIS HELPERS
// ============================================================

async function redisGet(key) {
  if (!redisClient || !redisAvailable) {
    console.log(`[CACHE DISABLED] GET ${key}`)
    return null
  }

  try {
    const value = await redisClient.get(key)

    if (value !== null) {
      console.log(`[CACHE HIT] ${key}`)
    } else {
      console.log(`[CACHE MISS] ${key}`)
    }

    return value
  } catch (error) {
    redisAvailable = false

    console.error(
      `[REDIS GET ERROR] ${key}:`,
      error.message
    )

    return null
  }
}

async function redisSetEx(key, seconds, value) {
  if (!redisClient || !redisAvailable) {
    console.log(
      `[CACHE SET SKIPPED] ${key} | Redis unavailable`
    )

    return false
  }

  try {
    await redisClient.setEx(
      key,
      seconds,
      value
    )

    console.log(
      `[CACHE SET] ${key} | TTL: ${seconds}s`
    )

    return true
  } catch (error) {
    redisAvailable = false

    console.error(
      `[REDIS SET ERROR] ${key}:`,
      error.message
    )

    return false
  }
}

// ============================================================
// REGEX HELPER
// ============================================================

function escapeRegex(value) {
  return value.replace(
    /[.*+?^${}()|[\]\\]/g,
    '\\$&'
  )
}

// ============================================================
// AUTH HELPERS
// ============================================================

function createToken(user) {
  return jwt.sign(
    {
      id: user._id.toString(),
      email: user.email
    },
    process.env.JWT_SECRET,
    {
      expiresIn:
        process.env.JWT_EXPIRES_IN || '7d'
    }
  )
}

function sanitizeUser(user) {
  return {
    id: user._id,
    username: user.username,
    email: user.email
  }
}

function verifyToken(req, res, next) {
  const authHeader =
    req.headers.authorization

  if (!authHeader) {
    return res.status(401).json({
      message: 'Access denied'
    })
  }

  const parts =
    authHeader.split(' ')

  if (
    parts.length !== 2 ||
    parts[0] !== 'Bearer' ||
    !parts[1]
  ) {
    return res.status(401).json({
      message:
        'Invalid authorization header'
    })
  }

  try {
    const verified = jwt.verify(
      parts[1],
      process.env.JWT_SECRET
    )

    req.user = verified

    next()
  } catch (error) {
    return res.status(401).json({
      message:
        'Invalid or expired token'
    })
  }
}

// ============================================================
// HEALTH CHECK
// ============================================================

app.get('/health', async (req, res) => {
  let mongo = false
  let authMongo = false

  try {
    await medicineClient
      .db('ENQUIRY')
      .command({
        ping: 1
      })

    mongo = true
  } catch {}

  try {
    await authClient
      .db('MediQueryAuth')
      .command({
        ping: 1
      })

    authMongo = true
  } catch {}

  const healthy =
    mongo &&
    authMongo

  return res
    .status(healthy ? 200 : 503)
    .json({
      status: healthy
        ? 'ok'
        : 'degraded',

      mongo,
      authMongo,

      redis: redisAvailable
    })
})

// ============================================================
// AUTH - REGISTER
// ============================================================

app.post(
  '/auth/register',
  async (req, res) => {
    try {
      if (!usersCollection) {
        return res.status(503).json({
          message:
            'Authentication service unavailable'
        })
      }

      const {
        username,
        email,
        password
      } = req.body

      if (
        typeof username !== 'string' ||
        typeof email !== 'string' ||
        typeof password !== 'string'
      ) {
        return res.status(400).json({
          message:
            'Invalid request'
        })
      }

      const normalizedUsername =
        username.trim()

      const normalizedEmail =
        email.trim().toLowerCase()

      if (
        !normalizedUsername ||
        !normalizedEmail ||
        !password
      ) {
        return res.status(400).json({
          message:
            'All fields are required'
        })
      }

      if (
        normalizedUsername.length < 2
      ) {
        return res.status(400).json({
          message:
            'Username is too short'
        })
      }

      if (password.length < 8) {
        return res.status(400).json({
          message:
            'Password must be at least 8 characters'
        })
      }

      const existingEmail =
        await usersCollection.findOne({
          email: normalizedEmail
        })

      if (existingEmail) {
        return res.status(409).json({
          message:
            'Email already exists'
        })
      }

      const existingUsername =
        await usersCollection.findOne({
          username:
            normalizedUsername
        })

      if (existingUsername) {
        return res.status(409).json({
          message:
            'Username already exists'
        })
      }

      const hashedPassword =
        await bcrypt.hash(
          password,
          12
        )

      const newUser = {
        username:
          normalizedUsername,

        email:
          normalizedEmail,

        password:
          hashedPassword,

        createdAt:
          new Date(),

        updatedAt:
          new Date()
      }

      const result =
        await usersCollection.insertOne(
          newUser
        )

      const createdUser = {
        _id:
          result.insertedId,

        username:
          normalizedUsername,

        email:
          normalizedEmail
      }

      const token =
        createToken(createdUser)

      return res.status(201).json({
        message:
          'User registered successfully',

        token,

        user:
          sanitizeUser(createdUser)
      })
    } catch (error) {
      if (error.code === 11000) {
        const duplicateField =
          Object.keys(
            error.keyPattern || {}
          )[0]

        return res.status(409).json({
          message:
            duplicateField === 'email'
              ? 'Email already exists'
              : 'Username already exists'
        })
      }

      console.error(
        'Registration error:',
        error
      )

      return res.status(500).json({
        message:
          'Server Error'
      })
    }
  }
)

// ============================================================
// AUTH - LOGIN
// ============================================================

app.post(
  '/auth/login',
  async (req, res) => {
    try {
      if (!usersCollection) {
        return res.status(503).json({
          message:
            'Authentication service unavailable'
        })
      }

      const {
        email,
        password
      } = req.body

      if (
        typeof email !== 'string' ||
        typeof password !== 'string'
      ) {
        return res.status(400).json({
          message:
            'Email and password are required'
        })
      }

      const normalizedEmail =
        email.trim().toLowerCase()

      if (
        !normalizedEmail ||
        !password
      ) {
        return res.status(400).json({
          message:
            'Email and password are required'
        })
      }

      const user =
        await usersCollection.findOne({
          email:
            normalizedEmail
        })

      if (!user) {
        return res.status(401).json({
          message:
            'Invalid email or password'
        })
      }

      if (
        typeof user.password !==
          'string' ||
        !user.password.startsWith('$2')
      ) {
        console.error(
          `Invalid password hash for ${normalizedEmail}`
        )

        return res.status(500).json({
          message:
            'Account authentication data is invalid'
        })
      }

      const validPassword =
        await bcrypt.compare(
          password,
          user.password
        )

      if (!validPassword) {
        return res.status(401).json({
          message:
            'Invalid email or password'
        })
      }

      const token =
        createToken(user)

      return res.status(200).json({
        message:
          'Login successful',

        token,

        user:
          sanitizeUser(user)
      })
    } catch (error) {
      console.error(
        'Login error:',
        error
      )

      return res.status(500).json({
        message:
          'Server Error'
      })
    }
  }
)

// ============================================================
// AUTH - CURRENT USER
// ============================================================

app.get(
  '/auth/me',
  verifyToken,
  async (req, res) => {
    try {
      const user =
        await usersCollection.findOne(
          {
            _id:
              new ObjectId(
                req.user.id
              )
          },
          {
            projection: {
              password: 0
            }
          }
        )

      if (!user) {
        return res.status(404).json({
          message:
            'User not found'
        })
      }

      return res.json({
        user:
          sanitizeUser(user)
      })
    } catch (error) {
      console.error(
        'Auth verification error:',
        error
      )

      return res.status(500).json({
        message:
          'Server Error'
      })
    }
  }
)

// ============================================================
// MEDICAL SHOPS
// ============================================================

app.post(
  '/get_medical_shops',
  async (req, res) => {
    const {
      latitude,
      longitude
    } = req.body

    const lat =
      Number(latitude)

    const lon =
      Number(longitude)

    if (
      !Number.isFinite(lat) ||
      !Number.isFinite(lon) ||
      lat < -90 ||
      lat > 90 ||
      lon < -180 ||
      lon > 180
    ) {
      return res.status(400).json({
        error:
          'Valid latitude and longitude required'
      })
    }

    const RADIUS = 10000
    const MAX_RESULTS = 40

    const query = `
      [out:json][timeout:25];
      (
        node["amenity"="pharmacy"](around:${RADIUS},${lat},${lon});
        node["shop"="chemist"](around:${RADIUS},${lat},${lon});
        node["shop"="drugstore"](around:${RADIUS},${lat},${lon});
      );
      out center qt ${MAX_RESULTS};
    `

    try {
      const cacheKey =
        `shops:${lat.toFixed(4)}:${lon.toFixed(4)}`

      const cached =
        await redisGet(cacheKey)

      if (cached) {
        return res.json(
          JSON.parse(cached)
        )
      }

      const response =
        await fetch(
          'https://overpass-api.de/api/interpreter',
          {
            method: 'POST',

            headers: {
              'Content-Type':
                'application/x-www-form-urlencoded'
            },

            body:
              `data=${encodeURIComponent(query)}`
          }
        )

      if (!response.ok) {
        throw new Error(
          `Overpass returned ${response.status}`
        )
      }

      const data =
        await response.json()

      const elements =
        data.elements || []

      const shops =
        elements
          .slice(0, MAX_RESULTS)
          .map(el => ({
            id:
              el.id,

            name:
              el.tags?.name ||
              'Medical Shop',

            lat:
              el.lat,

            lon:
              el.lon,

            address:
              el.tags?.['addr:street'] ||
              el.tags?.operator ||
              el.tags?.['addr:full'] ||
              'Address not available'
          }))

      await redisSetEx(
        cacheKey,
        600,
        JSON.stringify(shops)
      )

      return res.json(shops)
    } catch (error) {
      console.error(
        'Error fetching nearby shops:',
        error
      )

      return res.status(500).json({
        error:
          'Failed to fetch nearby medical shops'
      })
    }
  }
)

// ============================================================
// MEDICINE SUGGESTIONS
// ============================================================

app.get(
  '/suggestions',
  async (req, res) => {
    const query =
      typeof req.query.q === 'string'
        ? req.query.q.trim()
        : ''

    if (!query) {
      return res.json([])
    }

    try {
      const cacheKey =
        `suggestions:${query.toLowerCase()}`

      const cached =
        await redisGet(cacheKey)

      if (cached) {
        return res.json(
          JSON.parse(cached)
        )
      }

      const escapedQuery =
        escapeRegex(query)

      const regex =
        new RegExp(
          '^' +
            escapedQuery,
          'i'
        )

      const results =
        await collection
          .find({
            name: regex
          })
          .limit(6)
          .project({
            name: 1,
            _id: 0
          })
          .toArray()

      await redisSetEx(
        cacheKey,
        1800,
        JSON.stringify(results)
      )

      return res.json(results)
    } catch (error) {
      console.error(
        'Error fetching suggestions:',
        error
      )

      return res.status(500).json({
        error:
          'Internal Server Error'
      })
    }
  }
)

// ============================================================
// MEDICINE DETAILS
// ============================================================

app.get(
  '/medicine',
  async (req, res) => {
    const name =
      typeof req.query.name === 'string'
        ? req.query.name.trim()
        : ''

    if (!name) {
      return res.status(400).json({
        error:
          'Medicine name required'
      })
    }

    try {
      const cacheKey =
        `medicine:${name.toLowerCase()}`

      const cachedMedicine =
        await redisGet(cacheKey)

      if (cachedMedicine) {
        return res.json(
          JSON.parse(cachedMedicine)
        )
      }

      const escapedName =
        escapeRegex(name)

      const result =
        await collection.findOne(
          {
            name:
              new RegExp(
                '^' +
                  escapedName +
                  '$',
                'i'
              )
          },
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
              'Habit Forming': 1,
              'Therapeutic Class': 1
            }
          }
        )

      if (!result) {
        return res.status(404).json({
          error:
            'Medicine not found'
        })
      }

      if (
        result['price(₹)'] !==
        undefined
      ) {
        result.price =
          result['price(₹)']
      }

      await redisSetEx(
        cacheKey,
        3600,
        JSON.stringify(result)
      )

      return res.json(result)
    } catch (error) {
      console.error(
        'Error fetching medicine:',
        error
      )

      return res.status(500).json({
        error:
          'Internal Server Error'
      })
    }
  }
)

// ============================================================
// SIMILAR MEDICINES
// ============================================================

app.get(
  '/similar',
  async (req, res) => {
    const {
      comp1,
      comp2
    } = req.query

    if (
      typeof comp1 !== 'string' ||
      !comp1.trim()
    ) {
      return res.status(400).json({
        error:
          'Composition required'
      })
    }

    try {
      const cacheKey =
        `similar:${comp1}:${comp2 || ''}`

      const cached =
        await redisGet(cacheKey)

      if (cached) {
        return res.json(
          JSON.parse(cached)
        )
      }

      const query = {
        short_composition1:
          comp1
      }

      if (
        typeof comp2 === 'string' &&
        comp2.trim()
      ) {
        query.short_composition2 =
          comp2
      }

      const similarMeds =
        await collection
          .find(query)
          .project({
            name: 1,
            manufacturer_name: 1,
            'price(₹)': 1,
            short_composition1: 1,
            short_composition2: 1
          })
          .toArray()

      const formatted =
        similarMeds.map(item => ({
          ...item,

          price:
            item['price(₹)']
        }))

      await redisSetEx(
        cacheKey,
        3600,
        JSON.stringify(formatted)
      )

      return res.json(formatted)
    } catch (error) {
      console.error(
        'Similar medicine error:',
        error
      )

      return res.status(500).json({
        error:
          'Internal Server Error'
      })
    }
  }
)

// ============================================================
// REDIS STATUS
// ============================================================

app.get(
  '/redis-status',
  async (req, res) => {
    if (
      !redisClient ||
      !redisAvailable
    ) {
      return res.status(503).json({
        redis:
          'unavailable'
      })
    }

    try {
      await redisClient.set(
        'test',
        'working'
      )

      const value =
        await redisClient.get(
          'test'
        )

      return res.json({
        redis:
          value
      })
    } catch (error) {
      return res.status(503).json({
        redis:
          'unavailable',

        error:
          error.message
      })
    }
  }
)

// ============================================================
// GLOBAL ERROR HANDLER
// ============================================================

app.use(
  (error, req, res, next) => {
    console.error(
      'Unhandled application error:',
      error
    )

    if (
      error.message ===
      'CORS origin not allowed'
    ) {
      return res.status(403).json({
        message:
          'CORS origin not allowed'
      })
    }

    return res.status(500).json({
      message:
        'Internal Server Error'
    })
  }
)

// ============================================================
// SERVER STARTUP
// ============================================================

async function connectDB() {
  await medicineClient.connect()

  const medicineDB =
    medicineClient.db('ENQUIRY')

  collection =
    medicineDB.collection(
      'A_Z_medidb'
    )

  await authClient.connect()

  const authDB =
    authClient.db(
      'MediQueryAuth'
    )

  usersCollection =
    authDB.collection(
      'users'
    )

  await usersCollection.createIndex(
    { email: 1 },
    { unique: true }
  )

  await usersCollection.createIndex(
    { username: 1 },
    { unique: true }
  )

  console.log(
    'Medicine Collection:',
    collection.collectionName
  )

  console.log(
    'Users Collection:',
    usersCollection.collectionName
  )

  console.log(
    'MongoDB connected'
  )

  // ----------------------------------------------------------
  // REDIS CONNECTION
  // ----------------------------------------------------------

  if (redisClient) {
    try {
      if (!redisClient.isOpen) {
        await redisClient.connect()
      }

      redisAvailable = true

      console.log(
        'Redis connected'
      )
    } catch (error) {
      redisAvailable = false

      console.error(
        'Redis unavailable. Continuing without Redis:',
        error.message
      )
    }
  } else {
    console.log(
      'REDIS_URL not configured. Redis cache disabled.'
    )
  }
}

async function startServer() {
  try {
    await connectDB()

    app.listen(
      PORT,
      HOST,
      () => {
        console.log(
          `Server running on ${HOST}:${PORT}`
        )
      }
    )
  } catch (error) {
    console.error(
      'Server startup failed:',
      error
    )

    process.exit(1)
  }
}

// ============================================================
// GRACEFUL SHUTDOWN
// ============================================================

async function shutdown(signal) {
  console.log(
    `${signal} received. Shutting down...`
  )

  try {
    if (
      redisClient &&
      redisClient.isOpen
    ) {
      await redisClient.quit()

      console.log(
        'Redis connection closed'
      )
    }

    if (medicineClient) {
      await medicineClient.close()

      console.log(
        'Medicine MongoDB connection closed'
      )
    }

    if (authClient) {
      await authClient.close()

      console.log(
        'Auth MongoDB connection closed'
      )
    }
  } catch (error) {
    console.error(
      'Shutdown error:',
      error
    )
  } finally {
    process.exit(0)
  }
}

process.on(
  'SIGINT',
  () => shutdown('SIGINT')
)

process.on(
  'SIGTERM',
  () => shutdown('SIGTERM')
)

// ============================================================
// START
// ============================================================

startServer()
