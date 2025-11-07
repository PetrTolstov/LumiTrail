import formidable from 'formidable'
import { join } from 'node:path'
import { mkdirSync, existsSync } from 'node:fs'

function ensureDir(dir: string) {
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
}

export default defineEventHandler(async (event) => {
  const uploadDir = join(process.cwd(), 'uploads')
  ensureDir(uploadDir)
  const form = formidable({ uploadDir, keepExtensions: true, maxFileSize: 10 * 1024 * 1024 })
  const { files } = await new Promise<any>((resolve, reject) => {
    form.parse(event.node.req, (err, fields, files) => err ? reject(err) : resolve({ fields, files }))
  })

  const file = Array.isArray(files.file) ? files.file[0] : files.file
  if (!file) throw createError({ statusCode: 400, statusMessage: 'No file' })
  const url = `/uploads/${file.newFilename}`
  return { url }
})