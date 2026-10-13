import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ago, useStore } from '../store.jsx'

const TYPES = ['Full-time', 'Part-time', 'Contract', 'Internship']

export function Jobs() {
  const { jobs } = useStore()
  const [q, setQ] = useState('')
  const [loc, setLoc] = useState('')
  const [type, setType] = useState('')
  const list = jobs.filter((j) =>
    (`${j.title} ${j.company}`).toLowerCase().includes(q.toLowerCase()) &&
    j.location.toLowerCase().includes(loc.toLowerCase()) && (!type || j.type === type))
  return (
    <>
      <h1 className="mb-6 max-w-xl text-4xl font-bold leading-tight tracking-tight">Find the job that fits, then apply in a minute.</h1>
      <div className="mb-6 grid gap-3 sm:grid-cols-[2fr_1fr_1fr]">
        <input className="field" placeholder="Job title or company" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search" />
        <input className="field" placeholder="Location" value={loc} onChange={(e) => setLoc(e.target.value)} aria-label="Location" />
        <select className="field" value={type} onChange={(e) => setType(e.target.value)} aria-label="Job type">
          <option value="">All job types</option>
          {TYPES.map((t) => <option key={t}>{t}</option>)}
        </select>
      </div>
      <p className="mb-2 text-sm text-ink/60">{list.length} {list.length === 1 ? 'job' : 'jobs'} found</p>
      <ul className="divide-y divide-ink/15 border-y border-ink/15">
        {list.map((j) => (
          <li key={j.id}>
            <Link to={`/jobs/${j.id}`} className="flex flex-wrap items-baseline gap-x-6 gap-y-1 py-4 hover:bg-white">
              <span className="min-w-60 flex-1">
                <span className="block text-lg font-medium">{j.title}</span>
                <span className="text-ink/70">{j.company}</span>
              </span>
              <span className="text-sm">{j.location} · {j.type}</span>
              <span className="w-28 text-right text-sm text-ink/60">{ago(j.posted)}</span>
            </Link>
          </li>
        ))}
      </ul>
      {!list.length && <p className="py-8">No jobs match. Clear a filter to see more.</p>}
    </>
  )
}

export function JobDetail() {
  const { id } = useParams()
  const { jobs, me, apps, apply } = useStore()
  const job = jobs.find((j) => j.id === id)
  const [form, setForm] = useState({ resume: '', cover: '' })
  const [done, setDone] = useState(false)
  const [err, setErr] = useState('')
  if (!job) return <p>This job is no longer available. <Link className="underline" to="/">Back to jobs</Link></p>
  const applied = done || (me && apps.some((a) => a.jobId === id && a.seekerId === me.id))
  const submit = async (e) => { e.preventDefault(); const r = await apply(id, form); r ? setErr(r) : setDone(true) }
  return (
    <div className="grid gap-10 md:grid-cols-[3fr_2fr]">
      <article>
        <Link to="/" className="text-sm underline">All jobs</Link>
        <h1 className="mt-3 text-3xl font-bold tracking-tight">{job.title}</h1>
        <p className="mt-1 text-lg">{job.company}</p>
        <p className="mt-3 inline-block bg-sun px-2 py-0.5 text-sm font-medium">{job.salary || 'Salary not listed'}</p>
        <p className="mt-3 text-sm text-ink/70">{job.location} · {job.type} · Posted {ago(job.posted).toLowerCase()}</p>
        <p className="mt-6 max-w-prose whitespace-pre-line leading-relaxed">{job.description}</p>
      </article>
      <aside className="h-fit border border-ink/20 bg-white p-5">
        <h2 className="mb-3 text-lg font-medium">Apply for this job</h2>
        {!me ? <p><Link className="underline" to="/login">Log in</Link> as a job seeker to apply.</p>
          : me.role !== 'seeker' ? <p>Employer accounts can't apply. Use a job seeker account.</p>
          : applied ? <p className="font-medium text-sea">Application sent. Track it under My applications.</p>
          : (
            <form onSubmit={submit} className="space-y-3">
              <label className="block text-sm">Resume link<input required type="url" className="field mt-1" placeholder="https://drive.google.com/…" value={form.resume} onChange={(e) => setForm({ ...form, resume: e.target.value })} /></label>
              <label className="block text-sm">Cover letter<textarea required rows={5} className="field mt-1" value={form.cover} onChange={(e) => setForm({ ...form, cover: e.target.value })} /></label>
              {err && <p role="alert" className="text-sm text-red-700">{err}</p>}
              <button className="btn w-full">Send application</button>
            </form>
          )}
      </aside>
    </div>
  )
}
