<template>
  <NuxtLayout name="child">
    <v-container class="py-10 text-center" v-motion :initial="{opacity:0}" :enter="{opacity:1}">
      <div v-if="!ready">
        <v-progress-circular indeterminate size="64" />
        <div class="mt-3">{{ t('childWaitingForReview') }}</div>
      </div>

      <div v-else>
        <v-scale-transition>
          <v-icon v-if="status==='passed'" key="ok" size="96" color="primary">mdi-check-decagram</v-icon>
        </v-scale-transition>
        <v-scale-transition>
          <v-icon v-if="status==='failed'" key="fail" size="96" color="error">mdi-close-octagon</v-icon>
        </v-scale-transition>

        <div class="text-h5 mt-4" :class="{'text-error': status==='failed', 'text-primary': status==='passed'}">
          {{ status==='passed' ? t('childExcellentPassed') : t('childTryAgain') }}
        </div>

        <div v-if="status==='passed'" class="mt-4">
          <v-card class="mx-auto pa-4" max-width="360">
            <div class="text-subtitle-1">{{ t('childAwardedXp') }}</div>
            <div class="text-h4">{{ xpShown }}</div>
          </v-card>
          <v-btn class="mt-4" color="primary" @click="goBack">{{ t('childBackToPrograms') }}</v-btn>
        </div>

        <div v-else-if="status==='failed'" class="mt-4">
          <v-btn color="primary" @click="goBack">{{ t('childBackToLessons') }}</v-btn>
        </div>
      </div>
    </v-container>
  </NuxtLayout>
</template>

<script setup lang="ts">
const { t } = useI18n()
const route = useRoute()
const attemptId = route.params.attemptId as string
const status = ref<'submitted'|'under_review'|'passed'|'failed'>('submitted')
const xpShown = ref(0)
const ready = ref(false)
let timer: any

const poll = async () => {
  const a:any = await $fetch(`/api/attempts/${attemptId}`)
  if (['passed','failed'].includes(a.status)) {
    status.value = a.status
    ready.value = true
    clearInterval(timer)
    if (a.status === 'passed') {
      const target = a.awardedXp ?? 0
      let cur = 0
      const step = Math.max(1, Math.floor(target / 30))
      const tmr = setInterval(() => {
        cur += step
        if (cur >= target) { cur = target; clearInterval(tmr) }
        xpShown.value = cur
      }, 30)
    }
  }
}

onMounted(() => {
  timer = setInterval(poll, 10000)
  poll()
})

onBeforeUnmount(() => clearInterval(timer))

const goBack = () => navigateTo('/child/programs')
</script>