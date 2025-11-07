import { z } from 'zod'
import { prisma } from '~/server/utils/prisma'
import { requireRole } from '~/server/utils/auth'

const schema = z.object({
  taskId: z.string().min(1),
  answerText: z.string().optional(),
  selectedOptionId: z.string().optional(),
  fileUrl: z.string().optional()
})

export default defineEventHandler(async (event) => {
  const child = await requireRole(event, 'child')
  const attemptId = getRouterParam(event, 'attemptId')!
  const input = schema.parse(await readBody(event))

  const attempt = await prisma.lessonAttempt.findUnique({
    where: { id: attemptId },
    include: { lesson: { include: { tasks: true } } }
  })
  if (!attempt || attempt.childId !== child.id) throw createError({ statusCode: 404 })

  const prev = await prisma.taskAnswer.findFirst({ where: { attemptId, taskId: input.taskId } })
  if (prev) {
    return prisma.taskAnswer.update({
      where: { id: prev.id },
      data: { answerText: input.answerText ?? null, selectedOptionId: input.selectedOptionId ?? null, fileUrl: input.fileUrl ?? null }
    })
  }
  return prisma.taskAnswer.create({
    data: { attemptId, taskId: input.taskId, answerText: input.answerText ?? null, selectedOptionId: input.selectedOptionId ?? null, fileUrl: input.fileUrl ?? null }
  })
})