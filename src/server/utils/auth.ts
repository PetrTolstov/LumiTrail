import type { User } from '~/types'
import type {H3Event} from "h3";

export async function requireUser (event: H3Event): Promise<User> {
    const { user } = await requireUserSession(event)
    return user as User
}

export async function requireRole (event: H3Event, role: User['role']): Promise<User> {
    const user = await requireUser(event)
    if (user.role !== role) throw createError({ statusCode: 403, statusMessage: 'Forbidden' })
    return user
}
