import jwt from 'jsonwebtoken'
// protect() = any logged-in user, protect('employer') = only employers
export const protect = (...roles) => (req, res, next) => {
  try {
    const p = jwt.verify((req.headers.authorization || '').replace('Bearer ', ''), process.env.JWT_SECRET)
    if (roles.length && !roles.includes(p.role)) return res.status(403).json({ message: 'You are not allowed to do this.' })
    req.user = p
    next()
  } catch {
    res.status(401).json({ message: 'Please log in first.' })
  }
}
