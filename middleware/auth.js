// middleware/auth.js
const supabase = require('../config/supabase')

const requireAuth = async (req, res, next) => {
  const token = req.cookies['supabase-auth-token']

  if (!token) {
    return res.redirect('/user/login')
  }

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(token)

  if (error || !user) {
    res.clearCookie('supabase-auth-token')
    return res.redirect('/user/login')
  }

  req.user = user
  next()
}

module.exports = { requireAuth }
