import { defineEventHandler, send } from 'h3'
import { lookup as mime } from 'mrmime'

export default defineEventHandler(async (event) => {
    const key = event.context.params?.path as string
    const buf = await useStorage('uploads').getItemRaw(key)
    if (!buf) throw createError({ statusCode: 404 })
    event.node.res.setHeader('Content-Type', mime(key) || 'application/octet-stream')
    return send(event, buf)
})
