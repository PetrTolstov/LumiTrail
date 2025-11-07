import { z } from 'zod'
import { prisma } from '~/server/utils/prisma'
import { Argon2id } from 'oslo/password'
import type { User } from '~/types'

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(['parent', 'child']),
  displayName: z.string().min(1).max(50).optional()
})

export default defineEventHandler(async (event) => {
  const { email, password, role, displayName } = schema.parse(await readBody(event))

  const exists = await prisma.user.findUnique({ where: { email } })
  if (exists) throw createError({ statusCode: 409, statusMessage: 'Email already in use' })

  const passwordHash = await new Argon2id().hash(password)

  const created = await prisma.user.create({
    data: { email, passwordHash, role, displayName: displayName ?? null }
  })

  const sessionUser: User = {
    id: String(created.id),
    email: created.email,
    role: created.role as 'parent' | 'child',
    displayName: created.displayName,
    xpTotal: created.xpTotal ?? 0
  }

  await setUserSession(event, { user: sessionUser, loggedInAt: new Date() })
  return { ok: true }
})
