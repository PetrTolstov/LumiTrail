<template>
  <v-app>
    <v-app-bar color="secondary" density="comfortable">
      <v-app-bar-title>{{ t('childTitle') }}</v-app-bar-title>
      <v-spacer />
      <v-btn to="/child/programs" variant="text" prepend-icon="mdi-shield-star">{{ t('commonPrograms') }}</v-btn>
      <v-btn to="/child/programs" variant="text" prepend-icon="mdi-star-circle">{{ t('childMyXp') }}: {{ me?.xpTotal ?? 0 }}</v-btn>
      <v-select class="mx-2" density="comfortable" :items="langs" v-model="locale" style="max-width:120px" />
      <v-btn @click="signout" variant="text" prepend-icon="mdi-exit-to-app">{{ t('commonLogout') }}</v-btn>
    </v-app-bar>
    <v-main>
      <v-fade-transition mode="out-in">
        <div :key="$route.fullPath"><slot /></div>
      </v-fade-transition>
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import type { User } from '~/types'

const { t, locale } = useI18n()
const langs = ['en','ru']
const { data: me } = await useFetch<User | null>('/api/auth/me')

const signout = async () => {
  await $fetch('/api/auth/logout', { method: 'POST' })
  useUserSession().clear()
  navigateTo('/login')
}
</script>
