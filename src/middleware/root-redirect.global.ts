import type { User } from '~/types'

export default defineNuxtRouteMiddleware(async (to) => {
  if (to.path !== '/') return
  
  const { data } = await useFetch<User | null>('/api/auth/me')
  
  if (!data.value) {
    return navigateTo('/login')
  }
  
  if (data.value.role === 'child') {
    return navigateTo('/child/programs')
  }
  
  if (data.value.role === 'parent') {
    return navigateTo('/parent/programs')
  }
})