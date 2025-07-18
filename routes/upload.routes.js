// routes/upload.routes.js
const express = require('express')
const multer = require('multer')
const router = express.Router()
const { uploadToSupabase } = require('../utils/supabaseUpload')
const { requireAuth } = require('../middleware/auth')

const storage = multer.memoryStorage()
const upload = multer({ storage })

router.post(
  '/upload-file',
  requireAuth,
  upload.single('file'),
  async (req, res) => {
    try {
      const file = req.file
      const userId = req.user.id
      if (!file) return res.status(400).json({ error: 'No file provided.' })

      const publicUrl = await uploadToSupabase(file, userId)
      res.redirect('/home?message=File uploaded successfully!')
    } catch (err) {
      console.error(err)
      res.status(500).json({ error: 'Upload failed' })
    }
  }
)

module.exports = router
