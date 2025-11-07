import { z } from 'zod'
import { prisma } from '~/server/utils/prisma'
import { requireRole } from '~/server/utils/auth'

const schema = z.object({
  title: z.string().trim().min(1),
  description: z.string().trim().optional().transform(v => (v === '' ? undefined : v)),
  orderIndex: z.coerce.number().int().min(0).optional(),
  prerequisiteLessonId: z.string().optional().nullable()
})

export default defineEventHandler(async (event) => {
  const parent = await requireRole(event, 'parent')
  const programId = getRouterParam(event, 'id')!
  const input = schema.parse(await readBody(event))

  const program = await prisma.program.findUnique({ where: { id: programId } })
  if (!program || program.ownerId !== parent.id) throw createError({ statusCode: 404 })

  const index = input.orderIndex ?? await prisma.lesson.count({ where: { programId } })

  const lesson = await prisma.lesson.create({
    data: {
      programId,
      title: input.title,
      description: input.description ?? null,
      orderIndex: index,
      prerequisiteLessonId: input.prerequisiteLessonId ?? null
    }
  })
  return lesson
})
