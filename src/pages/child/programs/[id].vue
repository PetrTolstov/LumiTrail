<template>
  <NuxtLayout name="child">
    <v-container class="py-6">
      <h2 class="text-h5 mb-4">{{ t('childLessonChain') }}</h2>
      <v-row>
        <v-col v-for="l in lessons" :key="l.id" cols="12" md="6" lg="4">
          <v-card :class="l.isUnlocked ? 'border-primary' : 'opacity-50'" class="pa-4">
            <div class="text-h6">{{ l.title }}</div>
            <div class="text-body-2">{{ l.description }}</div>
            <v-card-actions>
              <v-btn :disabled="!l.isUnlocked" :to="`/child/lessons/${l.id}`" color="primary">
                {{ l.isUnlocked ? t('childFlowStart') : t('childFlowLocked') }}
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </NuxtLayout>
</template>

<script setup lang="ts">
import type { Lesson } from '~/types'

const { t } = useI18n()
const route = useRoute()
const { data: lessons } = await useFetch<Lesson[]>(`/api/programs/${route.params.id}/lessons`)
</script>