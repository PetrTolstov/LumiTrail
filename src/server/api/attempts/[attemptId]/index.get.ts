import { prisma } from '~/server/utils/prisma'
import { requireUser } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const attemptId = getRouterParam(event, 'attemptId')!
  const attempt = await prisma.lessonAttempt.findUnique({
    where: { id: attemptId },
    include: { 
      taskAnswers: {
        include: {
          task: {
            include: {
              options: true
            }
          }
        }
      }, 
      lesson: true 
    }
  })
  if (!attempt) throw createError({ statusCode: 404 })
  if (user.role === 'child' && attempt.childId !== user.id) throw createError({ statusCode: 403 })
  return attempt
})