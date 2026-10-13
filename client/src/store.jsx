import { createContext, useContext, useEffect, useState } from 'react'
import axios from 'axios'

// One Axios instance: base URL from .env + JWT token added to every request
export const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api' })
api.interceptors.request.use((c) => {
  const t = localStorage.getItem('jp_token')
  if (t) c.headers.Authorization = `Bearer ${t}`
  return c
})
const errText = (e) => e.response?.data?.message || 'Something went wrong. Is the server running?'

const Ctx = createContext()
export const useStore = () => useContext(Ctx)
const day = 86400000
export const ago = (t) => { const d = Math.max(0, Math.floor((Date.now() - t) / day)); return d === 0 ? 'Today' : d === 1 ? 'Yesterday' : `${d} days ago` }

export function StoreProvider({ children }) {
  const [me, setMe] = useState(() => JSON.parse(localStorage.getItem('jp_me') || 'null'))
  const [jobs, setJobs] = useState([])
  const [apps, setApps] = useState([])

  useEffect(() => { api.get('/jobs').then((r) => setJobs(r.data)).catch(() => {}) }, [])
  useEffect(() => {
    if (!me) return setApps([])
    api.get('/applications').then((r) => setApps(r.data)).catch(() => logout())
  }, [me])

  const start = ({ token, user }) => { localStorage.setItem('jp_token', token); localStorage.setItem('jp_me', JSON.stringify(user)); setMe(user) }
  const register = async (f) => { try { start((await api.post('/auth/register', f)).data) } catch (e) { return errText(e) } }
  const login = async (email, password) => { try { start((await api.post('/auth/login', { email, password })).data) } catch (e) { return errText(e) } }
  const logout = () => { localStorage.removeItem('jp_token'); localStorage.removeItem('jp_me'); setMe(null) }

  const postJob = async (j) => { const { data } = await api.post('/jobs', j); setJobs((p) => [data, ...p]) }
  const deleteJob = async (id) => { await api.delete(`/jobs/${id}`); setJobs((p) => p.filter((j) => j.id !== id)); setApps((p) => p.filter((a) => a.jobId !== id)) }
  const apply = async (jobId, d) => { try { const { data } = await api.post('/applications', { jobId, ...d }); setApps((p) => [...p, data]) } catch (e) { return errText(e) } }
  const setStatus = async (id, status) => { const { data } = await api.patch(`/applications/${id}`, { status }); setApps((p) => p.map((a) => (a.id === id ? data : a))) }

  return <Ctx.Provider value={{ me, jobs, apps, register, login, logout, postJob, deleteJob, apply, setStatus }}>{children}</Ctx.Provider>
}
