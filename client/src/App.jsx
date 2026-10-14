import { Link, NavLink, Navigate, Route, Routes, useNavigate } from 'react-router-dom'
import { useStore } from './store.jsx'
import { Jobs, JobDetail } from './pages/Jobs.jsx'
import { Login, Register } from './pages/Auth.jsx'
import { Employer } from './pages/Employer.jsx'
import { MyApplications } from './pages/Seeker.jsx'

function Guard({ role, children }) {
  const { me } = useStore()
  if (!me) return <Navigate to="/login" replace />
  if (me.role !== role) return <Navigate to="/" replace />
  return children
}

export default function App() {
  const { me, logout } = useStore()
  const nav = useNavigate()
  const link = ({ isActive }) => `px-2 py-1 ${isActive ? 'border-b-2 border-sun' : 'hover:text-sea'}`
  return (
    <>
      <header className="border-b border-ink/15 bg-white">
        <nav className="mx-auto flex max-w-5xl flex-wrap items-center gap-x-5 gap-y-2 px-4 py-3">
          <Link to="/" className="mr-auto text-xl font-bold tracking-tight">Job Seeker by William</Link>
          <NavLink to="/" end className={link}>Browse jobs</NavLink>
          {me?.role === 'seeker' && <NavLink to="/applications" className={link}>My applications</NavLink>}
          {me?.role === 'employer' && <NavLink to="/employer" className={link}>Employer dashboard</NavLink>}
          {me ? (
            <>
              <span className="text-sm text-ink/60">{me.name}</span>
              <button className="btn-ghost" onClick={() => { logout(); nav('/') }}>Log out</button>
            </>
          ) : (
            <>
              <NavLink to="/login" className={link}>Log in</NavLink>
              <Link to="/register" className="btn">Create account</Link>
            </>
          )}
        </nav>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-8">
        <Routes>
          <Route path="/" element={<Jobs />} />
          <Route path="/jobs/:id" element={<JobDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/applications" element={<Guard role="seeker"><MyApplications /></Guard>} />
          <Route path="/employer" element={<Guard role="employer"><Employer /></Guard>} />
          <Route path="*" element={<p>Page not found. <Link className="underline" to="/">Back to jobs</Link></p>} />
        </Routes>
      </main>
    </>
  )
}
