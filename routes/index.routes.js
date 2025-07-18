const express = require('express')
const router = express.Router()
// Import BOTH middleware functions
const { requireAuth, checkUser } = require('../middleware/auth')
const supabase = require('../config/supabase')

// --- Root Route / Landing Page ---
// Apply the 'checkUser' middleware ONLY to this route.
router.get('/', checkUser, (req, res) => {
  // req.user will either be the user object or null.
  res.render('index', { user: req.user })
})

// --- Home / Drive Route ---
// Apply the strict 'requireAuth' middleware to the dynamic home route.
router.get(/^\/home(\/.*)?$/, requireAuth, async (req, res) => {
  try {
    const user = req.user
    const currentPath = req.params[0] ? req.params[0].substring(1) : ''
    const fullPathInStorage = `uploads/${user.id}/${currentPath}`

    const { data: listData, error: listError } = await supabase.storage
      .from(process.env.SUPABASE_BUCKET)
      .list(fullPathInStorage.replace(/\/$/, ''), {
        limit: 1000,
        sortBy: { column: 'name', order: 'asc' },
      })

    if (listError) {
      console.error(
        `Error listing files for path "${fullPathInStorage}":`,
        listError.message
      )
      return res.render('home', {
        user,
        files: [],
        allFolders: [],
        currentPath,
        breadcrumbs: [],
      })
    }

    const items = listData.filter((item) => item.name !== '.placeholder')

    const pathParts = currentPath.split('/').filter((p) => p)
    const breadcrumbs = pathParts.map((part, index) => ({
      name: part,
      path: `/${pathParts.slice(0, index + 1).join('/')}`,
    }))

    const processedItems = items.map((item) => {
      const itemRelativePath = `${currentPath ? currentPath + '/' : ''}${
        item.name
      }`
      if (item.id === null) {
        return { ...item, type: 'folder', path: itemRelativePath }
      }
      const itemFullPathInStorage = `uploads/${user.id}/${itemRelativePath}`
      const {
        data: { publicUrl },
      } = supabase.storage
        .from(process.env.SUPABASE_BUCKET)
        .getPublicUrl(itemFullPathInStorage)
      return { ...item, publicUrl, path: itemRelativePath, type: 'file' }
    })

    const { data: allItemsInRoot, error: allItemsError } =
      await supabase.storage
        .from(process.env.SUPABASE_BUCKET)
        .list(`uploads/${user.id}`, { limit: 1000 })

    const allFolders = allItemsError
      ? []
      : allItemsInRoot
          .filter((item) => item.id === null)
          .map((f) => ({ name: f.name, path: f.name }))

    res.render('home', {
      user,
      files: processedItems,
      allFolders,
      currentPath,
      breadcrumbs,
    })
  } catch (err) {
    console.error('Critical error in /home route:', err)
    res.status(500).send('A critical error occurred on the server.')
  }
})

module.exports = router
