import { z } from 'zod'
import { PrismaClient } from '@prisma/client'
import { prisma } from '~/server/utils/prisma'
import { requireRole } from '~/server/utils/auth'

const schema = z.object({ status: z.enum(['passed','failed']), xp: z.number().int().min(0).default(0) })

export default defineEventHandler(async (event) => {
  const parent = await requireRole(event, 'parent')
  const attemptId = getRouterParam(event, 'attemptId')!
  const { status, xp } = schema.parse(await readBody(event))

  const attempt = await prisma.lessonAttempt.findUnique({
    where: { id: attemptId },
    include: { lesson: { include: { program: true } } }
  })
  if (!attempt) throw createError({ statusCode: 404 })
  if (attempt.lesson.program.ownerId !== parent.id) throw createError({ statusCode: 403 })

  const result = await prisma.$transaction(async (tx: any) => {
    await tx.lessonAttempt.update({
      where: { id: attemptId },
      data: { status, reviewedAt: new Date(), reviewedBy: parent.id, awardedXp: status === 'passed' ? xp : 0 }
    })
    if (status === 'passed' && xp > 0) {
      await tx.xpLedger.create({ data: { userId: attempt.childId, delta: xp, source: `lesson_attempt:${attemptId}` } })
      await tx.user.update({ where: { id: attempt.childId }, data: { xpTotal: { increment: xp } } })
    }
    return { ok: true }
  })
  return result
})