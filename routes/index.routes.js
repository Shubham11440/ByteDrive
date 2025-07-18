// routes/index.routes.js
const express = require('express')
const router = express.Router()
const { requireAuth } = require('../middleware/auth')
const supabase = require('../config/supabase') // Import supabase client

// Public landing page
router.get('/', (req, res) => {
  res.render('index')
})

// Protected home page route
router.get('/home', requireAuth, async (req, res) => {
  try {
    const user = req.user
    let files = [] // Default to an empty array

    // Fetch the list of files from the user's folder in Supabase Storage
    const { data, error } = await supabase.storage
      .from(process.env.SUPABASE_BUCKET)
      .list(`uploads/${user.id}`, {
        limit: 100, // You can adjust the limit as needed
        offset: 0,
        sortBy: { column: 'created_at', order: 'desc' },
      })

    if (error) {
      console.error('Error listing files:', error.message)
      // Don't crash the page, just render with no files
    } else {
      // Add the public URL to each file object for easy access in the template
      files = data.map((file) => {
        const {
          data: { publicUrl },
        } = supabase.storage
          .from(process.env.SUPABASE_BUCKET)
          .getPublicUrl(`uploads/${user.id}/${file.name}`)
        return { ...file, publicUrl }
      })
    }

    // Render the home page, passing the user and their files
    res.render('home', { user, files })
  } catch (err) {
    console.error('Error in /home route:', err)
    res.status(500).send('An error occurred.')
  }
})

module.exports = router
