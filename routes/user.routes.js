// routes/user.routes.js
const express = require('express')
const router = express.Router()
const supabase = require('../config/supabase')

// --- Render Pages ---
router.get('/register', (req, res) => {
  res.render('register')
})
router.get('/login', (req, res) => {
  res.render('login')
})

// --- Auth Logic ---
router.post('/register', async (req, res) => {
  const { email, password, username } = req.body
  const { data, error } = await supabase.auth.signUp({
    email: email,
    password: password,
    options: { data: { username: username } },
  })
  if (error)
    return res.status(400).send(`Registration failed: ${error.message}`)
  console.error('--- FULL SUPABASE REGISTRATION ERROR ---')
  console.log(error)
  console.error('--------------------------------------')
  res.redirect('/user/login?message=Registration successful! Please log in.')
})

router.post('/login', async (req, res) => {
  const { email, password } = req.body
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email,
    password: password,
  })
  if (error) return res.status(400).send(`Login failed: ${error.message}`)
  res.cookie('supabase-auth-token', data.session.access_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: data.session.expires_in * 1000,
  })
  res.redirect('/home')
})

router.get('/logout', (req, res) => {
  res.clearCookie('supabase-auth-token')
  res.redirect('/user/login')
})

module.exports = router
