import { useState } from 'react'
import { ago, useStore } from '../store.jsx'
import { statusStyle } from './Seeker.jsx'

const empty = { title: '', location: '', type: 'Full-time', salary: '', description: '' }

export function Employer() {
  const { me, jobs, apps, postJob, deleteJob, setStatus } = useStore()
  const [f, setF] = useState(empty)
  const [open, setOpen] = useState(null)
  const mine = jobs.filter((j) => j.employerId === me.id)
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })
  const submit = (e) => { e.preventDefault(); postJob(f); setF(empty) }

  return (
    <div className="grid gap-10 md:grid-cols-[2fr_3fr]">
      <section>
        <h2 className="mb-3 text-xl font-bold">Post a job</h2>
        <form onSubmit={submit} className="space-y-3">
          <input required className="field" placeholder="Job title" value={f.title} onChange={set('title')} />
          <input required className="field" placeholder="Location (or Remote)" value={f.location} onChange={set('location')} />
          <select className="field" value={f.type} onChange={set('type')}>
            {['Full-time', 'Part-time', 'Contract', 'Internship'].map((t) => <option key={t}>{t}</option>)}
          </select>
          <input className="field" placeholder="Salary (optional)" value={f.salary} onChange={set('salary')} />
          <textarea required rows={6} className="field" placeholder="What will the person do? What do they need?" value={f.description} onChange={set('description')} />
          <button className="btn w-full">Publish job</button>
        </form>
      </section>

      <section>
        <h2 className="mb-3 text-xl font-bold">Your jobs and applicants</h2>
        {!mine.length && <p>No jobs yet. Publish your first job to start receiving applications.</p>}
        <ul className="space-y-4">
          {mine.map((j) => {
            const list = apps.filter((a) => a.jobId === j.id)
            return (
              <li key={j.id} className="border border-ink/20 bg-white">
                <div className="flex flex-wrap items-center justify-between gap-2 p-4">
                  <div>
                    <p className="font-medium">{j.title}</p>
                    <p className="text-sm text-ink/60">{j.location} · Posted {ago(j.posted).toLowerCase()}</p>
                  </div>
                  <div className="flex gap-2">
                    <button className="btn-ghost" onClick={() => setOpen(open === j.id ? null : j.id)} aria-expanded={open === j.id}>{list.length} applicants</button>
                    <button className="btn-ghost" onClick={() => confirm('Delete this job and its applications?') && deleteJob(j.id)}>Delete</button>
                  </div>
                </div>
                {open === j.id && (
                  <ul className="divide-y divide-ink/10 border-t border-ink/15">
                    {!list.length && <li className="p-4 text-sm">No applications yet.</li>}
                    {list.map((a) => (
                      <li key={a.id} className="space-y-2 p-4 text-sm">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <p><span className="font-medium">{a.name}</span> · {a.email}</p>
                          <select aria-label={`Status for ${a.name}`} className={`rounded px-2 py-1 font-medium ${statusStyle[a.status]}`} value={a.status} onChange={(e) => setStatus(a.id, e.target.value)}>
                            {Object.keys(statusStyle).map((s) => <option key={s}>{s}</option>)}
                          </select>
                        </div>
                        <p className="whitespace-pre-line text-ink/80">{a.cover}</p>
                        <a className="underline" href={a.resume} target="_blank" rel="noreferrer">Open resume</a>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            )
          })}
        </ul>
      </section>
    </div>
  )
}
