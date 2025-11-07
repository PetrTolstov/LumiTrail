import { prisma } from '~/server/utils/prisma'
import { requireUser } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const programId = getRouterParam(event, 'id')!
  const user = await requireUser(event)

  const lessons = await prisma.lesson.findMany({
    where: { programId },
    orderBy: { orderIndex: 'asc' }
  })

  if (user.role !== 'child') return lessons

  const passed = await prisma.lessonAttempt.findMany({
    where: { childId: user.id, status: 'passed' },
    select: { lessonId: true }
  })
  const passedIds = new Set(passed.map((a: { lessonId: string }) => a.lessonId))

  return lessons.map((l: any, idx: number, arr: any[]) => {
    const prereqOk = !l.prerequisiteLessonId || passedIds.has(l.prerequisiteLessonId)
    const orderOk = arr.slice(0, idx).every((prev: any) => passedIds.has(prev.id))
    return { ...l, isUnlocked: prereqOk && orderOk }
  })
})