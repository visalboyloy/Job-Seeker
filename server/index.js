import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import mongoose from 'mongoose'
import routes from './routes.js'

const app = express()
app.use(cors({ origin: process.env.CLIENT_URL || true }))
app.use(express.json())

// Reuse one database connection (needed for Vercel serverless)
let conn
app.use(async (_q, res, next) => {
  try { conn ??= mongoose.connect(process.env.MONGO_URI); await conn; next() }
  catch (e) { conn = null; res.status(500).json({ message: 'Database connection failed.' }) }
})
app.get('/', (_q, res) => res.json({ status: 'Job Portal API is running' }))
app.use('/api', routes)

if (!process.env.VERCEL) app.listen(process.env.PORT || 5000, () => console.log('API running on http://localhost:' + (process.env.PORT || 5000)))
export default app
