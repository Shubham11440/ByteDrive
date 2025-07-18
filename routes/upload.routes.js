const express = require('express')
const multer = require('multer')
const router = express.Router()
const { uploadToSupabase } = require('../utils/supabaseUpload')
const { requireAuth } = require('../middleware/auth')
const supabase = require('../config/supabase')

const storage = multer.memoryStorage()
const upload = multer({ storage })

// Upload a file to a specific folder
router.post(
  '/upload-file',
  requireAuth,
  upload.single('file'),
  async (req, res) => {
    try {
      const file = req.file
      const userId = req.user.id
      const currentPath = req.body.currentPath || '' 

      if (!file) {
        return res.status(400).json({ error: 'No file provided.' })
      }

      // Pass the full context to the helper
      const publicUrl = await uploadToSupabase(file, userId, currentPath)
      res.redirect(`/home/${currentPath}`) 
    } catch (err) {
      console.error('Upload route error:', err)
      res.status(500).json({ error: 'Upload failed' })
    }
  }
)

// Create a new folder
router.post('/create-folder', requireAuth, async (req, res) => {
  const { folderName, currentPath } = req.body
  const user = req.user.id

  if (!folderName || folderName.includes('/') || folderName.includes('..')) {
    return res.status(400).send('Invalid folder name.')
  }

  const placeholderPath = `uploads/${user}/${
    currentPath ? currentPath + '/' : ''
  }${folderName}/.placeholder`

  try {
    const { error } = await supabase.storage
      .from(process.env.SUPABASE_BUCKET)
      .upload(placeholderPath, Buffer.from(''))
    if (error) throw error
    res.redirect(`/home/${currentPath}`)
  } catch (err) {
    console.error('Create folder error:', err)
    res.status(500).send('Failed to create folder.')
  }
})

// Move a file
router.post('/move-file', requireAuth, async (req, res) => {
  const { fromPath, destinationFolder } = req.body
  const user = req.user.id

  // The fromPath from the form should already be the full path in storage
  const sourcePath = fromPath
  if (!sourcePath || !sourcePath.startsWith(`uploads/${user}/`)) {
    return res.status(403).send('Forbidden: Invalid source path.')
  }

  const filename = sourcePath.split('/').pop()
  const destinationPath = `${destinationFolder}/${filename}` // destinationFolder is the full path of the target folder

  try {
    const { error } = await supabase.storage
      .from(process.env.SUPABASE_BUCKET)
      .move(sourcePath, destinationPath)
    if (error) throw error
    // Redirect to the folder where the file was moved FROM
    const sourceFolder = fromPath
      .substring(0, fromPath.lastIndexOf('/'))
      .replace(`uploads/${user}/`, '')
    res.redirect(`/home/${sourceFolder}`)
  } catch (err) {
    console.error('Move file error:', err)
    res.status(500).send('Failed to move file.')
  }
})

// Delete a file
router.post('/delete-file', requireAuth, async (req, res) => {
  const { filePath } = req.body // This path is relative to the user's folder
  const user = req.user.id
  const fullPathInStorage = `uploads/${user}/${filePath}`

  if (!filePath) return res.status(400).send('File path is required.')

  try {
    const { error } = await supabase.storage
      .from(process.env.SUPABASE_BUCKET)
      .remove([fullPathInStorage])
    if (error) throw error
    const sourceFolder = filePath.substring(0, filePath.lastIndexOf('/'))
    res.redirect(`/home/${sourceFolder}`)
  } catch (err) {
    console.error('Delete file error:', err)
    res.status(500).send('Failed to delete file.')
  }
})

module.exports = router
