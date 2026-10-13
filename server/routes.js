import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { User, Job, Application } from './models.js'
import { protect } from './middleware.js'

const r = Router()
const sign = (u) => jwt.sign({ id: u.id, role: u.role }, process.env.JWT_SECRET, { expiresIn: '7d' })
const wrap = (fn) => (req, res) => fn(req, res).catch((e) => res.status(500).json({ message: e.message }))

// ---------- Auth ----------
r.post('/auth/register', wrap(async (req, res) => {
  const { name, company, email, password, role } = req.body
  if (!name || !email || !password || !['seeker', 'employer'].includes(role)) return res.status(400).json({ message: 'Please fill in all fields.' })
  if (await User.findOne({ email: email.toLowerCase() })) return res.status(409).json({ message: 'An account with this email already exists.' })
  const u = await User.create({ name, company, email, role, password: await bcrypt.hash(password, 10) })
  res.status(201).json({ token: sign(u), user: u })
}))
r.post('/auth/login', wrap(async (req, res) => {
  const u = await User.findOne({ email: (req.body.email || '').toLowerCase() })
  if (!u || !(await bcrypt.compare(req.body.password || '', u.password))) return res.status(401).json({ message: 'Email or password is incorrect.' })
  res.json({ token: sign(u), user: u })
}))

// ---------- Jobs ----------
r.get('/jobs', wrap(async (_q, res) => res.json(await Job.find().sort({ posted: -1 }))))
r.post('/jobs', protect('employer'), wrap(async (req, res) => {
  const { title, location, type, salary, description } = req.body
  const me = await User.findById(req.user.id)
  res.status(201).json(await Job.create({ title, location, type, salary, description, employerId: me.id, company: me.company || me.name }))
}))
r.delete('/jobs/:id', protect('employer'), wrap(async (req, res) => {
  const j = await Job.findOne({ _id: req.params.id, employerId: req.user.id })
  if (!j) return res.status(404).json({ message: 'Job not found.' })
  await j.deleteOne()
  await Application.deleteMany({ jobId: j.id })
  res.json({ ok: true })
}))

// ---------- Applications ----------
r.post('/applications', protect('seeker'), wrap(async (req, res) => {
  const { jobId, cover, resume } = req.body
  if (!(await Job.findById(jobId))) return res.status(404).json({ message: 'Job not found.' })
  if (await Application.findOne({ jobId, seekerId: req.user.id })) return res.status(409).json({ message: 'You already applied for this job.' })
  const me = await User.findById(req.user.id)
  res.status(201).json(await Application.create({ jobId, cover, resume, seekerId: me.id, name: me.name, email: me.email }))
}))
r.get('/applications', protect(), wrap(async (req, res) => {
  if (req.user.role === 'seeker') return res.json(await Application.find({ seekerId: req.user.id }).sort({ date: -1 }))
  const ids = (await Job.find({ employerId: req.user.id })).map((j) => j.id)
  res.json(await Application.find({ jobId: { $in: ids } }).sort({ date: -1 }))
}))
r.patch('/applications/:id', protect('employer'), wrap(async (req, res) => {
  const a = await Application.findById(req.params.id)
  const j = a && (await Job.findOne({ _id: a.jobId, employerId: req.user.id }))
  if (!j) return res.status(404).json({ message: 'Application not found.' })
  if (!['Pending', 'Shortlisted', 'Hired', 'Rejected'].includes(req.body.status)) return res.status(400).json({ message: 'Invalid status.' })
  a.status = req.body.status
  await a.save()
  res.json(a)
}))
export default r
