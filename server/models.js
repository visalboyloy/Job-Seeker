import mongoose from 'mongoose'
const { Schema, model } = mongoose
// Send "id" instead of "_id" and never send the password
const opts = { toJSON: { versionKey: false, transform: (_d, r) => { r.id = r._id.toString(); delete r._id; delete r.password } } }

export const User = model('User', new Schema({
  name: { type: String, required: true }, company: String,
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['seeker', 'employer'], required: true },
}, opts))

export const Job = model('Job', new Schema({
  employerId: String, company: String, title: { type: String, required: true },
  location: String, type: String, salary: String, description: String,
  posted: { type: Number, default: Date.now },
}, opts))

export const Application = model('Application', new Schema({
  jobId: String, seekerId: String, name: String, email: String, cover: String, resume: String,
  status: { type: String, enum: ['Pending', 'Shortlisted', 'Hired', 'Rejected'], default: 'Pending' },
  date: { type: Number, default: Date.now },
}, opts))
