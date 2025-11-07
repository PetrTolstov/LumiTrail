<template>
  <v-container class="py-10" style="max-width: 480px;">
    <v-card>
      <v-card-title>{{ t('authSignup') }}</v-card-title>
      <v-card-text>
        <v-text-field v-model="displayName" :label="t('authName')" />
        <v-text-field v-model="email" :label="t('authEmail')" type="email" />
        <v-text-field v-model="password" :label="t('authPassword')" type="password" />
        <v-select v-model="role" :items="roles" :label="t('authRole')" />
      </v-card-text>
      <v-card-actions>
        <v-btn color="primary" @click="signup">{{ t('authCreateAccount') }}</v-btn>
        <v-spacer />
        <v-btn variant="text" to="/login">{{ t('authToSignin') }}</v-btn>
      </v-card-actions>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
const { t } = useI18n()
const displayName = ref('')
const email = ref('')
const password = ref('')
const role = ref<'parent'|'child'>('child')
const roles = ['parent','child']

const signup = async () => {
  await $fetch('/api/auth/signup', {
    method: 'POST',
    body: { displayName: displayName.value, email: email.value, password: password.value, role: role.value }
  })
  const { fetch } = useUserSession()
  await fetch()
  const me: any = await $fetch('/api/auth/me')
  if (me?.role === 'parent') navigateTo('/parent/programs')
  else navigateTo('/child/programs')
}
</script>
