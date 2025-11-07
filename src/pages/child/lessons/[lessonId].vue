<template>
  <NuxtLayout name="child">
    <v-container class="py-6" v-motion :initial="{opacity:0, y:20}" :enter="{opacity:1, y:0}">
      <div class="text-h5 mb-4">{{ t('childLessonColon') }} {{ lesson?.title }}</div>

      <v-window v-model="step" class="mb-4">
        <v-window-item v-for="(tItem, idx) in tasks" :key="tItem.id" :value="idx">
          <v-card class="pa-4">
            <v-slide-x-transition mode="out-in">
              <div :key="tItem.id">
                <div class="text-subtitle-1 mb-2">{{ t('childTaskNumber') }} {{ idx + 1 }} {{ t('childOf') }} {{ tasks?.length ?? 0 }}</div>
                <div v-if="tItem.promptImageUrl" class="mb-3">
                  <v-img :src="tItem.promptImageUrl" max-height="220" cover class="rounded" />
                </div>
                <div v-if="tItem.promptText" class="mb-3">{{ tItem.promptText }}</div>

                <div v-if="tItem.answerType==='text'">
                  <v-textarea v-model="answers[tItem.id]!.answerText" :label="t('childYourAnswer')" rows="5" />
                </div>

                <div v-else-if="tItem.answerType==='choices'">
                  <v-radio-group v-model="answers[tItem.id]!.selectedOptionId">
                    <v-radio v-for="o in tItem.options" :key="o.id" :label="o.label" :value="o.id" />
                  </v-radio-group>
                </div>

                <div v-else-if="tItem.answerType==='file'">
                  <v-file-input v-model="answers[tItem.id]!.localFile" :label="t('childAttachFile')" prepend-icon="mdi-paperclip" />
                  <div v-if="answers[tItem.id]?.fileUrl" class="text-caption mt-1">{{ t('childUploaded') }} {{ answers[tItem.id]!.fileUrl }}</div>
                  <v-btn class="mt-2" variant="tonal" @click="uploadFile(tItem.id)" :disabled="!answers[tItem.id]?.localFile">{{ t('childUploadFile') }}</v-btn>
                </div>
              </div>
            </v-slide-x-transition>
          </v-card>
        </v-window-item>

        <div class="d-flex justify-space-between">
          <v-btn :disabled="step===0" variant="tonal" @click="prev">{{ t('commonBack') }}</v-btn>
          <div class="d-flex ga-3">
            <v-btn v-if="step<(tasks?.length ?? 0)-1 && hasCurrentTaskAnswer" color="primary" @click="next" v-motion :hovered="{scale:1.03}">
              {{ t('commonNext') }}
            </v-btn>
            <v-btn v-if="step===(tasks?.length ?? 0)-1" color="primary" @click="submitAttempt">{{ t('childSubmitForReview') }}</v-btn>
          </div>
        </div>
      </v-window>
    </v-container>
  </NuxtLayout>
</template>

<script setup lang="ts">
import type { Lesson, Task, Answer } from '~/types'

const { t } = useI18n()
const route = useRoute()
const lessonId = route.params.lessonId as string

const { data: lesson } = await useFetch<Lesson>(() => `/api/lessons/${lessonId}`)
const { data: tasks }  = await useFetch<Task[]>(() => `/api/lessons/${lessonId}/tasks`)
const { data: attempt } = await useFetch<{ id: string, taskAnswers?: any[] }>('/api/attempts', { method: 'POST', body: { lessonId } })

const step = ref(0)
const answers = reactive<Record<string, Answer>>({})

watchEffect(() => {
  (tasks.value ?? []).forEach((t: Task) => { if (!answers[t.id]) answers[t.id] = {} })
})

watchEffect(() => {
  if (attempt.value?.taskAnswers) {
    attempt.value.taskAnswers.forEach((taskAnswer: any) => {
      if (answers[taskAnswer.taskId]) {
        answers[taskAnswer.taskId]!.answerText = taskAnswer.answerText
        answers[taskAnswer.taskId]!.selectedOptionId = taskAnswer.selectedOptionId
        answers[taskAnswer.taskId]!.fileUrl = taskAnswer.fileUrl
      }
    })
  }
})

const hasCurrentTaskAnswer = computed(() => {
  if (!tasks.value || !tasks.value[step.value]) return false
  const currentTask = tasks.value[step.value]
  if (!currentTask) return false
  const answer = answers[currentTask.id]
  if (!answer) return false
  
  if (currentTask.answerType === 'text') {
    return answer.answerText && answer.answerText.trim().length > 0
  } else if (currentTask.answerType === 'choices') {
    return !!answer.selectedOptionId
  } else if (currentTask.answerType === 'file') {
    return !!answer.fileUrl
  }
  return false
})

const prev = () => step.value = Math.max(0, step.value - 1)
const next = async () => {
  await saveAnswer()
  step.value = Math.min((tasks.value?.length ?? 1) - 1, step.value + 1)
}

const saveAnswer = async () => {
  console.log('saveAnswer', step.value, tasks.value)
  if (!tasks.value || !tasks.value[step.value]) return
  const tItem = tasks.value[step.value]!
  const payload: any = { taskId: tItem.id }
  const a = answers[tItem.id]
  if (tItem.answerType==='text') payload.answerText = a?.answerText ?? ''
  if (tItem.answerType==='choices') payload.selectedOptionId = a?.selectedOptionId
  if (tItem.answerType==='file') payload.fileUrl = a?.fileUrl
  await $fetch(`/api/attempts/${attempt.value!.id}/answers`, { method: 'POST', body: payload })
}

const uploadFile = async (taskId: string) => {
  const f = answers[taskId]?.localFile
  if (!f) return
  const fd = new FormData()
  fd.append('file', f)
  const res = await $fetch<{ url: string }>('/api/upload', { method: 'POST', body: fd })
  if (answers[taskId]) {
    answers[taskId].fileUrl = res.url
  }
}

const submitAttempt = async () => {
  await saveAnswer()
  await $fetch(`/api/attempts/${attempt.value!.id}/submit`, { method: 'POST' })
  navigateTo(`/child/result/${attempt.value!.id}`)
}
</script>