<template>
  <v-container class="py-10" style="max-width: 480px;">
    <v-card>
      <v-card-title>{{ t('authSignIn') }}</v-card-title>
      <v-card-text>
        <v-text-field v-model="email" :label="t('authEmail')" type="email" />
        <v-text-field v-model="password" :label="t('authPassword')" type="password" />
      </v-card-text>
      <v-card-actions>
        <v-btn color="primary" @click="login">{{ t('authSignIn') }}</v-btn>
        <v-spacer />
        <v-btn variant="text" to="/signup">{{ t('authToSignup') }}</v-btn>
      </v-card-actions>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
const { t } = useI18n()
const email = ref('')
const password = ref('')

const login = async () => {
  await $fetch('/api/auth/login', {
    method: 'POST',
    body: { email: email.value, password: password.value }
  })
  const { fetch } = useUserSession()
  await fetch()
  const me: any = await $fetch('/api/auth/me')
  if (me?.role === 'parent') navigateTo('/parent/programs')
  else navigateTo('/child/programs')
}
</script>
