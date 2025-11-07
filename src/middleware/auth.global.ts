export default defineNuxtRouteMiddleware(async () => {
  const { data } = await useFetch('/api/auth/me')
})