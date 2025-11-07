import { prisma } from '~/server/utils/prisma'
import { requireRole } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const parent = await requireRole(event, 'parent')
  return prisma.lessonAttempt.findMany({
    where: {
      lesson: { program: { ownerId: parent.id } },
      status: { in: ['submitted','under_review'] }
    },
    orderBy: { submittedAt: 'desc' },
    take: 50
  })
})