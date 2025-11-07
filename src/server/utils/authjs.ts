import { PrismaAdapter } from '@auth/prisma-adapter'
import Credentials from '@auth/core/providers/credentials'
import type { AuthConfig } from '@auth/core'
import { prisma } from './prisma'
import { Argon2id } from 'oslo/password'

export const authConfig: AuthConfig = {
  adapter: PrismaAdapter(prisma) as any,
  secret: process.env.AUTH_SECRET,
  session: { strategy: 'database', maxAge: 60 * 60 * 24 * 7 },
  trustHost: true,
  providers: [
    Credentials({
      id: 'credentials',
      name: 'Credentials',
      credentials: { email: {}, password: {} },
      authorize: async (creds) => {
        const email = String(creds?.email || '').toLowerCase().trim()
        const password = String(creds?.password || '')
        const user = await prisma.user.findUnique({ where: { email } })
        if (!user || !user.passwordHash) return null
        const ok = await new Argon2id().verify(user.passwordHash, password)
        if (!ok) return null
        return { id: user.id, email: user.email, name: user.displayName, role: user.role, xpTotal: user.xpTotal }
      }
    })
  ],
  callbacks: {
    async session({ session, user, token }) {
      if (session?.user) {
        const dbUser = await prisma.user.findUnique({ where: { email: session.user.email! }, select: { id: true, role: true, displayName: true, xpTotal: true } })
        if (dbUser) Object.assign(session.user, { id: dbUser.id, role: dbUser.role, displayName: dbUser.displayName, xpTotal: dbUser.xpTotal })
      }
      return session
    }
  },
  pages: {
    signIn: '/login'
  }
}