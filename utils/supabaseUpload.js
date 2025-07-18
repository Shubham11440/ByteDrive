// utils/supabaseUpload.js
const supabase = require('../config/supabase')

async function uploadToSupabase(file, userId) {
  if (!file || !userId) throw new Error('File and User ID are required.')

  const filePath = `uploads/${userId}/${Date.now()}_${file.originalname}`

  const { data, error } = await supabase.storage
    .from(process.env.SUPABASE_BUCKET)
    .upload(filePath, file.buffer, {
      contentType: file.mimetype,
      upsert: false,
    })

  if (error) throw error

  const {
    data: { publicUrl },
  } = supabase.storage.from(process.env.SUPABASE_BUCKET).getPublicUrl(data.path)

  return publicUrl
}

module.exports = { uploadToSupabase }
