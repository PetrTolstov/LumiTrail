import { prisma } from '~/server/utils/prisma'
import { requireUser } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  await requireUser(event)
  const lessonId = getRouterParam(event, 'lessonId')!
  return prisma.task.findMany({
    where: { lessonId },
    orderBy: { orderIndex: 'asc' },
    include: { options: true }
  })
})