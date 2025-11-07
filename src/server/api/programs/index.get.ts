import { prisma } from '~/server/utils/prisma'
import { requireUser } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)

  const owned = getQuery(event).owned === '1'
  if (owned && user.role === 'parent') {
    return prisma.program.findMany({ where: { ownerId: user.id }, orderBy: { createdAt: 'desc' } })
  }
  if (user.role === 'child') {
    return prisma.program.findMany({
      where: { programMembers: { some: { childId: user.id } } },
      orderBy: { createdAt: 'desc' }
    })
  }
  return []
})