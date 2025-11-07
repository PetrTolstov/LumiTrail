import { prisma } from '~/server/utils/prisma'
import { requireUser } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)

  if (user.role !== 'parent') {
    throw createError({ statusCode: 403, statusMessage: 'Forbidden' })
  }

  const taskId = getRouterParam(event, 'taskId')
  if (!taskId) {
    throw createError({ statusCode: 400, statusMessage: 'Task ID required' })
  }

  const task = await prisma.task.findUnique({
    where: { id: taskId },
    include: {
      lesson: {
        include: {
          program: { select: { ownerId: true } }
        }
      }
    }
  })

  if (!task) {
    throw createError({ statusCode: 404, statusMessage: 'Task not found' })
  }

  if (task.lesson.program.ownerId !== user.id) {
    throw createError({ statusCode: 403, statusMessage: 'Forbidden' })
  }

  await prisma.task.delete({
    where: { id: taskId }
  })

  return { success: true }
})
