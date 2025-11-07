import { z } from 'zod'
import { prisma } from '~/server/utils/prisma'
import { requireRole } from '~/server/utils/auth'

const schema = z.object({
  promptText: z.string().optional(),
  promptImageUrl: z.string().optional(),
  answerType: z.enum(['text','choices','file']),
  orderIndex: z.number().int().min(0)
})

export default defineEventHandler(async (event) => {
  const parent = await requireRole(event, 'parent')
  const lessonId = getRouterParam(event, 'lessonId')!

  const lesson = await prisma.lesson.findUnique({ where: { id: lessonId }, include: { program: true } })
  if (!lesson || lesson.program.ownerId !== parent.id) throw createError({ statusCode: 404 })

  const data = schema.parse(await readBody(event))
  return prisma.task.create({ data: { ...data, lessonId } })
})