<template>
  <NuxtLayout name="parent">
    <v-container class="py-6">
      <h2 class="text-h5 mb-4">{{ t('parentReviewAttempts') }}</h2>
      <v-data-table :headers="headers" :items="items" item-key="id">
        <template #item.actions="{ item }">
          <v-btn @click="open(item)" variant="text">{{ t('commonOpen') }}</v-btn>
        </template>
      </v-data-table>

      <v-dialog v-model="dlg" max-width="800">
        <v-card>
          <v-card-title>{{ t('parentAttempt') }}</v-card-title>
          <v-card-text>
            <div class="mb-3">{{ t('parentStatus') }}: {{ current?.status }}</div>
            <div v-for="a in currentAnswers" :key="a.id" class="mb-6">
              <v-card variant="outlined" class="pa-4">
                <div class="text-h6 mb-3">{{ t('parentTask') }} {{ (a as any).task?.orderIndex ? (a as any).task.orderIndex + 1 : '' }}</div>

                <div v-if="(a as any).task?.promptImageUrl" class="mb-3">
                  <v-img :src="(a as any).task.promptImageUrl" max-height="200" cover class="rounded" />
                </div>
                <div v-if="(a as any).task?.promptText" class="mb-3 text-body-1">
                  {{ (a as any).task.promptText }}
                </div>
                
                <v-divider class="my-3" />

                <div class="text-subtitle-1 mb-2">{{ t('commonAnswer') }}:</div>
                <div v-if="a.answerText" class="mb-2">
                  <div class="text-caption text-medium-emphasis mb-1">{{ t('commonText') }}:</div>
                  <div class="pa-3 bg-grey-lighten-4 rounded">{{ a.answerText }}</div>
                </div>
                <div v-if="a.selectedOptionId" class="mb-2">
                  <div class="text-caption text-medium-emphasis mb-1">{{ t('parentSelected') }}:</div>
                  <div class="pa-3 bg-grey-lighten-4 rounded">
                    {{ (a as any).task?.options?.find((opt: any) => opt.id === a.selectedOptionId)?.label || a.selectedOptionId }}
                  </div>
                </div>
                <div v-if="a.fileUrl" class="mb-2">
                  <div class="text-caption text-medium-emphasis mb-1">{{ t('parentFile') }}:</div>
                  <div class="pa-3 bg-grey-lighten-4 rounded">
                    <v-btn :href="a.fileUrl" target="_blank" variant="outlined" prepend-icon="mdi-download">
                      {{ t('commonDownload') }}
                    </v-btn>
                    <div v-if="isImageFile(a.fileUrl)" class="mt-2">
                      <v-img :src="a.fileUrl" max-height="200" cover class="rounded" />
                    </div>
                  </div>
                </div>
              </v-card>
            </div>
            <v-divider class="my-3" />
            <v-radio-group v-model="decision">
              <v-radio :label="t('parentAccept')" value="passed" />
              <v-radio :label="t('parentReject')" value="failed" />
            </v-radio-group>
            <v-text-field v-model.number="xp" type="number" :label="t('parentAwardXp')" />
          </v-card-text>
          <v-card-actions>
            <v-spacer />
            <v-btn variant="text" @click="dlg=false">{{ t('commonClose') }}</v-btn>
            <v-btn color="primary" @click="review">{{ t('parentSaveDecision') }}</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-container>
  </NuxtLayout>
</template>

<script setup lang="ts">
import type { Attempt, TaskAnswer } from '~/types'

definePageMeta({ middleware: 'role-parent' })
const { t } = useI18n()

const headers = computed(() => [
  { title: 'ID', key: 'id' },
  { title: t('parentLesson'), key: 'lessonId' },
  { title: t('parentStatus'), key: 'status' },
  { title: t('parentSubmitted'), key: 'submittedAt' },
  { title: t('commonActions'), key: 'actions', sortable: false }
])

const { data: items, refresh } = await useFetch<Attempt[]>('/api/attempts-list')

const dlg = ref(false)
const current = ref<Attempt | null>(null)
const currentAnswers = ref<TaskAnswer[]>([])
const decision = ref<'passed'|'failed'>('passed')
const xp = ref(0)

const open = async (row: Attempt) => {
  current.value = await $fetch<Attempt>(`/api/attempts/${row.id}`)
  currentAnswers.value = current.value.taskAnswers ?? []
  dlg.value = true
}

const isImageFile = (url: string) => {
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.svg']
  return imageExtensions.some(ext => url.toLowerCase().includes(ext))
}

const review = async () => {
  await $fetch(`/api/attempts/${current.value!.id}/review`, { method:'POST', body:{ status: decision.value, xp: xp.value } })
  dlg.value = false
  refresh()
}
</script>