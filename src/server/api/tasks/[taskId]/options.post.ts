import { z } from 'zod'
import { prisma } from '~/server/utils/prisma'
import { requireRole } from '~/server/utils/auth'

const schema = z.object({
  label: z.string().min(1),
  isCorrect: z.boolean()
})

export default defineEventHandler(async (event) => {
  const parent = await requireRole(event, 'parent')
  const taskId = getRouterParam(event, 'taskId')!

  const task = await prisma.task.findUnique({
    where: { id: taskId },
    include: { lesson: { include: { program: true } } }
  })
  if (!task || task.lesson.program.ownerId !== parent.id) throw createError({ statusCode: 404 })

  const body = schema.parse(await readBody(event))
  return prisma.taskOption.create({ data: { taskId, ...body } })
})