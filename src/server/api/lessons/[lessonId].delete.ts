import { prisma } from '~/server/utils/prisma'
import { requireUser } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)

  if (user.role !== 'parent') {
    throw createError({ statusCode: 403, statusMessage: 'Forbidden' })
  }

  const lessonId = getRouterParam(event, 'lessonId')
  if (!lessonId) {
    throw createError({ statusCode: 400, statusMessage: 'Lesson ID required' })
  }

  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    include: { program: { select: { ownerId: true } } }
  })

  if (!lesson) {
    throw createError({ statusCode: 404, statusMessage: 'Lesson not found' })
  }

  if (lesson.program.ownerId !== user.id) {
    throw createError({ statusCode: 403, statusMessage: 'Forbidden' })
  }

  await prisma.lesson.delete({
    where: { id: lessonId }
  })

  return { success: true }
})
