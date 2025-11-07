import { z } from 'zod'
import { prisma } from '~/server/utils/prisma'
import { Argon2id } from 'oslo/password'
import type { User } from '~/types'

const schema = z.object({
    email: z.string().email(),
    password: z.string().min(6)
})

export default defineEventHandler(async (event) => {
    const { email, password } = schema.parse(await readBody(event))

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user || !user.passwordHash) {
        throw createError({ statusCode: 401, statusMessage: 'Invalid credentials' })
    }

    const ok = await new Argon2id().verify(user.passwordHash, password)
    if (!ok) {
        throw createError({ statusCode: 401, statusMessage: 'Invalid credentials' })
    }

    const sessionUser: User = {
        id: String(user.id),
        email: user.email,
        role: user.role as 'parent' | 'child',
        displayName: user.displayName,
        xpTotal: user.xpTotal ?? 0
    }

    await setUserSession(event, { user: sessionUser, loggedInAt: new Date() })
    return { ok: true }
})
