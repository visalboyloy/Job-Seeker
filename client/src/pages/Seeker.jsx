import { Link } from 'react-router-dom'
import { ago, useStore } from '../store.jsx'

export const statusStyle = { Pending: 'bg-ink/10', Shortlisted: 'bg-sun', Hired: 'bg-sea text-white', Rejected: 'bg-red-100 text-red-800' }

export function MyApplications() {
  const { apps, jobs, me } = useStore()
  const mine = apps.filter((a) => a.seekerId === me.id)
  return (
    <>
      <h1 className="mb-6 text-3xl font-bold tracking-tight">My applications</h1>
      {!mine.length && <p>You haven't applied yet. <Link className="underline" to="/">Browse jobs</Link> and send your first application.</p>}
      <ul className="divide-y divide-ink/15 border-y border-ink/15">
        {mine.map((a) => {
          const j = jobs.find((x) => x.id === a.jobId)
          return (
            <li key={a.id} className="flex flex-wrap items-center justify-between gap-3 py-4">
              <div>
                <p className="font-medium">{j ? <Link className="underline" to={`/jobs/${j.id}`}>{j.title}</Link> : 'Job removed'}</p>
                <p className="text-sm text-ink/70">{j?.company} · Applied {ago(a.date).toLowerCase()}</p>
              </div>
              <span className={`rounded px-2 py-1 text-sm font-medium ${statusStyle[a.status]}`}>{a.status}</span>
            </li>
          )
        })}
      </ul>
    </>
  )
}
