const supabase = require('../config/supabase')

// This is your existing "hard" auth middleware. It redirects if not logged in.
const requireAuth = async (req, res, next) => {
  const token = req.cookies['supabase-auth-token']
  if (!token) return res.redirect('/user/login')

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

// ADD THIS NEW "SOFT" AUTH MIDDLEWARE
// It checks for a user but doesn't block the page if they're not logged in.
const checkUser = async (req, res, next) => {
  const token = req.cookies['supabase-auth-token']
  if (token) {
    const {
      data: { user },
    } = await supabase.auth.getUser(token)
    if (user) {
      // If a valid user is found, attach them to the request
      req.user = user
    } else {
      // If token is invalid, clear it
      res.clearCookie('supabase-auth-token')
      req.user = null
    }
  } else {
    req.user = null
  }
  next()
}

// Export both functions
module.exports = { requireAuth, checkUser }
