import { z } from 'zod'
import { prisma } from '~/server/utils/prisma'
import { requireRole } from '~/server/utils/auth'

const schema = z.object({ lessonId: z.string().min(1) })

export default defineEventHandler(async (event) => {
  const child = await requireRole(event, 'child')
  const { lessonId } = schema.parse(await readBody(event))

  const active = await prisma.lessonAttempt.findFirst({
    where: { lessonId, childId: child.id, status: { in: ['draft','submitted','under_review'] } },
    include: { taskAnswers: true }
  })
  if (active) return active

  return prisma.lessonAttempt.create({
    data: { lessonId, childId: child.id, status: 'draft' },
    include: { taskAnswers: true }
  })
})