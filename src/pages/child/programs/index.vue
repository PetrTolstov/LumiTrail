<template>
  <NuxtLayout name="child">
    <v-container class="py-6">
      <v-row>
        <v-col cols="12">
          <h2 class="text-h5">{{ t('childMyPrograms') }}</h2>
        </v-col>
        <v-col v-for="p in programs" :key="p.id" cols="12" md="6" lg="4">
          <v-hover v-slot="{ isHovering, props }">
            <v-card v-bind="props" :elevation="isHovering ? 10 : 2" class="pa-4">
              <div class="d-flex align-center justify-space-between">
                <div>
                  <div class="text-h6">{{ p.title }}</div>
                  <div class="text-body-2 text-medium-emphasis">{{ p.description }}</div>
                </div>
                <v-icon size="36">mdi-shield-star</v-icon>
              </div>
              <v-card-actions>
                <v-btn :to="`/child/programs/${p.id}`" color="primary" variant="flat">{{ t('commonOpen') }}</v-btn>
              </v-card-actions>
            </v-card>
          </v-hover>
        </v-col>
      </v-row>
    </v-container>
  </NuxtLayout>
</template>

<script setup lang="ts">
import type { Program } from '~/types'

const { t } = useI18n()
const { data: programs } = await useFetch<Program[]>('/api/programs')
</script>