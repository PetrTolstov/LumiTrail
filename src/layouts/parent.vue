<template>
  <v-app>
    <v-app-bar color="primary" density="comfortable">
      <v-app-bar-title>{{ t('parentTitle') }}</v-app-bar-title>
      <v-spacer />
      <v-btn to="/parent/programs" variant="text" prepend-icon="mdi-book-education">{{ t('commonPrograms') }}</v-btn>
      <v-btn to="/parent/review" variant="text" prepend-icon="mdi-clipboard-check">{{ t('parentReview') }}</v-btn>
      <v-select class="mx-2" density="comfortable" :items="langs" v-model="locale" style="max-width:120px" />
      <v-btn @click="signout" variant="text" prepend-icon="mdi-exit-to-app">{{ t('commonLogout') }}</v-btn>
    </v-app-bar>
    <v-main><slot /></v-main>
  </v-app>
</template>

<script setup lang="ts">
const { t, locale } = useI18n()
const langs = ['en','ru']

const signout = async () => {
  await $fetch('/api/auth/logout', { method: 'POST' })
  useUserSession().clear()
  navigateTo('/login')
}
</script>
