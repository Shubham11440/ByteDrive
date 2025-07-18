const supabase = require('../config/supabase')

async function uploadToSupabase(file, userId, currentPath = '') {
  if (!file || !userId) {
    throw new Error('File and User ID are required for upload.')
  }

  // Construct the path including the current folder
  const folderPath = `uploads/${userId}/${currentPath}`
  const filePath = `${folderPath.replace(/\/$/, '')}/${Date.now()}_${
    file.originalname
  }`

  const { data, error } = await supabase.storage
    .from(process.env.SUPABASE_BUCKET)
    .upload(filePath, file.buffer, {
      contentType: file.mimetype,
      upsert: false,
    })

  if (error) {
    console.error('Supabase upload error:', error)
    throw error
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(process.env.SUPABASE_BUCKET).getPublicUrl(data.path)

  return publicUrl
}

module.exports = { uploadToSupabase }
