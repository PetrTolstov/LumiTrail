import { prisma } from '~/server/utils/prisma'
import { requireUser } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)

  if (user.role !== 'parent') {
    throw createError({ statusCode: 403, statusMessage: 'Forbidden' })
  }

  const programId = getRouterParam(event, 'id')
  if (!programId) {
    throw createError({ statusCode: 400, statusMessage: 'Program ID required' })
  }

  const program = await prisma.program.findUnique({
    where: { id: programId },
    select: { ownerId: true }
  })

  if (!program) {
    throw createError({ statusCode: 404, statusMessage: 'Program not found' })
  }

  if (program.ownerId !== user.id) {
    throw createError({ statusCode: 403, statusMessage: 'Forbidden' })
  }

  await prisma.program.delete({
    where: { id: programId }
  })

  return { success: true }
})
