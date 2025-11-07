import { prisma } from '~/server/utils/prisma'
import { requireUser } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const lessonId = getRouterParam(event, 'lessonId')!

  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    include: { program: { select: { id: true, ownerId: true, programMembers: true } } }
  })
  if (!lesson) throw createError({ statusCode: 404 })

  if (user.role === 'parent' && lesson.program.ownerId !== user.id) {
    throw createError({ statusCode: 403 })
  }
  if (user.role === 'child') {
    const member = lesson.program.programMembers.find((m: any) => m.childId === user.id)
    if (!member) throw createError({ statusCode: 403 })
  }

  return {
    id: lesson.id,
    title: lesson.title,
    description: lesson.description,
    programId: lesson.program.id,
    orderIndex: lesson.orderIndex,
    prerequisiteLessonId: lesson.prerequisiteLessonId
  }
})