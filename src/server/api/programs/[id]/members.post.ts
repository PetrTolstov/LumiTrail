import { z } from 'zod'
import { prisma } from '~/server/utils/prisma'
import { requireRole } from '~/server/utils/auth'

const schema = z.object({ childEmail: z.string().email() })

export default defineEventHandler(async (event) => {
  const parent = await requireRole(event, 'parent')
  const programId = getRouterParam(event, 'id')!
  const { childEmail } = schema.parse(await readBody(event))

  const program = await prisma.program.findUnique({ where: { id: programId } })
  if (!program || program.ownerId !== parent.id) throw createError({ statusCode: 404 })

  const child = await prisma.user.findUnique({ where: { email: childEmail } })
  if (!child || child.role !== 'child') throw createError({ statusCode: 400, statusMessage: 'Ребёнок не найден' })

  await prisma.programMember.upsert({
    where: { programId_childId: { programId, childId: child.id } },
    update: {},
    create: { programId, childId: child.id }
  })

  return { ok: true }
})