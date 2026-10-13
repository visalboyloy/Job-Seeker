import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useStore } from '../store.jsx'

function Shell({ title, children, foot }) {
  return (
    <div className="mx-auto max-w-sm">
      <h1 className="mb-5 text-3xl font-bold tracking-tight">{title}</h1>
      {children}
      <p className="mt-5 text-sm">{foot}</p>
    </div>
  )
}
const Field = ({ label, ...p }) => <label className="block text-sm">{label}<input required className="field mt-1" {...p} /></label>

export function Login() {
  const { login } = useStore()
  const nav = useNavigate()
  const [f, setF] = useState({ email: '', password: '' })
  const [err, setErr] = useState('')
  const submit = async (e) => { e.preventDefault(); const r = await login(f.email, f.password); r ? setErr(r) : nav('/') }
  return (
    <Shell title="Log in" foot={<>New here? <Link className="underline" to="/register">Create an account</Link></>}>
      <form onSubmit={submit} className="space-y-3">
        <Field label="Email" type="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} />
        <Field label="Password" type="password" value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} />
        {err && <p role="alert" className="text-sm text-red-700">{err}</p>}
        <button className="btn w-full">Log in</button>
      </form>
    </Shell>
  )
}

export function Register() {
  const { register } = useStore()
  const nav = useNavigate()
  const [f, setF] = useState({ role: 'seeker', name: '', company: '', email: '', password: '' })
  const [err, setErr] = useState('')
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })
  const submit = async (e) => {
    e.preventDefault()
    if (f.password.length < 6) return setErr('Use a password with at least 6 characters.')
    const r = await register(f)
    r ? setErr(r) : nav(f.role === 'employer' ? '/employer' : '/')
  }
  return (
    <Shell title="Create your account" foot={<>Already registered? <Link className="underline" to="/login">Log in</Link></>}>
      <form onSubmit={submit} className="space-y-3">
        <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Account type">
          {[['seeker', "I'm looking for a job"], ['employer', "I'm hiring"]].map(([v, l]) => (
            <button type="button" key={v} role="radio" aria-checked={f.role === v} onClick={() => setF({ ...f, role: v })}
              className={`rounded-md border px-2 py-2 text-sm ${f.role === v ? 'border-ink bg-ink text-white' : 'border-ink/30'}`}>{l}</button>
          ))}
        </div>
        <Field label="Full name" value={f.name} onChange={set('name')} />
        {f.role === 'employer' && <Field label="Company name" value={f.company} onChange={set('company')} />}
        <Field label="Email" type="email" value={f.email} onChange={set('email')} />
        <Field label="Password" type="password" value={f.password} onChange={set('password')} />
        {err && <p role="alert" className="text-sm text-red-700">{err}</p>}
        <button className="btn w-full">Create account</button>
      </form>
    </Shell>
  )
}
