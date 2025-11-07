import type { User } from '~/types'

export default defineNuxtRouteMiddleware(async () => {
  const { data } = await useFetch<User | null>('/api/auth/me')
  if (!data.value || data.value.role !== 'child') return navigateTo('/login')
})