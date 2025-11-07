import { prisma } from '~/server/utils/prisma'
import { requireRole } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const child = await requireRole(event, 'child')
  const attemptId = getRouterParam(event, 'attemptId')!

  const attempt = await prisma.lessonAttempt.findUnique({
    where: { id: attemptId },
    include: { lesson: { include: { tasks: true } } }
  })
  if (!attempt || attempt.childId !== child.id) throw createError({ statusCode: 404 })
  if (attempt.status !== 'draft') throw createError({ statusCode: 400, statusMessage: 'Нельзя отправить в текущем статусе' })

  const totalTasks = attempt.lesson.tasks.length
  const answered = await prisma.taskAnswer.count({ where: { attemptId } })
  if (answered < totalTasks) throw createError({ statusCode: 400, statusMessage: 'Ответьте на все задания' })

  await prisma.lessonAttempt.update({
    where: { id: attemptId },
    data: { status: 'submitted', submittedAt: new Date() }
  })

  return { ok: true }
})