<template>
  <NuxtLayout name="parent">
    <v-container class="py-6">
      <div class="d-flex align-center mb-4">
        <h2 class="text-h5">{{ t('programsMyPrograms') }}</h2>
        <v-spacer />
        <v-btn color="primary" @click="dialog=true" prepend-icon="mdi-plus">{{ t('programsCreate') }}</v-btn>
      </div>
      <v-data-table :headers="headers" :items="programs" item-key="id">
        <template #item.actions="{ item }">
          <v-btn :to="`/parent/programs/${item.id}`" variant="text">{{ t('childFlowOpen') }}</v-btn>
          <v-btn @click="deleteProgram(item)" variant="text" color="error" icon="mdi-delete" size="small"></v-btn>
        </template>
      </v-data-table>

      <v-dialog v-model="dialog" max-width="500">
        <v-card>
          <v-card-title>{{ t('programsNewProgram') }}</v-card-title>
          <v-card-text>
            <v-text-field v-model="title" :label="t('programsTitle')" />
            <v-textarea v-model="description" :label="t('programsDescription')" />
          </v-card-text>
          <v-card-actions>
            <v-spacer />
            <v-btn variant="text" @click="dialog=false">{{ t('programsCancel') }}</v-btn>
            <v-btn color="primary" @click="create">{{ t('programsCreate') }}</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-container>
  </NuxtLayout>
</template>

<script setup lang="ts">
import type { Program } from '~/types'

definePageMeta({ middleware: 'role-parent' })
const { t } = useI18n()

const headers = computed(() => [
  { title: t('programsTitle'), key: 'title' },
  { title: t('programsDescription'), key: 'description' },
  { title: t('programsActions'), key: 'actions', sortable: false }
])

const { data: programs, refresh } = await useFetch<Program[]>('/api/programs?owned=1')
const dialog = ref(false); const title = ref(''); const description = ref('')
const create = async () => {
  await $fetch('/api/programs', { method:'POST', body:{ title: title.value, description: description.value } })
  dialog.value = false; title.value=''; description.value=''; refresh()
}

const deleteProgram = async (program: Program) => {
  if (confirm(`Are you sure you want to delete "${program.title}"? This will also delete all lessons and tasks in this program.`)) {
    try {
      await $fetch(`/api/programs/${program.id}`, { method: 'DELETE' })
      refresh()
    } catch (error) {
      alert('Failed to delete program')
      console.error(error)
    }
  }
}
</script>