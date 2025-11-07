import { z } from 'zod'
import { prisma } from '~/server/utils/prisma'
import { requireRole } from '~/server/utils/auth'

const schema = z.object({ title: z.string().min(1), description: z.string().optional() })

export default defineEventHandler(async (event) => {
  const parent = await requireRole(event, 'parent')
  const { title, description } = schema.parse(await readBody(event))
  const program = await prisma.program.create({
    data: { ownerId: parent.id, title, description: description ?? null }
  })
  return program
})