<template>
  <NuxtLayout name="parent">
    <v-container class="py-6">
      <div class="d-flex align-center mb-4">
        <h2 class="text-h5">{{ t('parentProgramLessons') }}</h2>
        <v-spacer />
        <v-btn color="primary" @click="dlgLesson=true" prepend-icon="mdi-plus">{{ t('parentAddLesson') }}</v-btn>
      </div>

      <v-data-table :headers="lessonHeaders" :items="lessons" item-key="id" class="mb-6">
        <template #item.actions="{ item }">
          <v-btn @click="deleteLesson(item)" variant="text" color="error" icon="mdi-delete" size="small"></v-btn>
        </template>
      </v-data-table>

      <div class="d-flex align-center mb-4">
        <h2 class="text-h6">{{ t('parentParticipants') }}</h2>
        <v-spacer />
        <v-btn variant="tonal" @click="dlgChild=true" prepend-icon="mdi-account-plus">{{ t('commonAdd') }}</v-btn>
      </div>

      <v-dialog v-model="dlgLesson" max-width="520">
        <v-card>
          <v-card-title>{{ t('parentNewLesson') }}</v-card-title>
          <v-card-text>
            <v-text-field v-model="lTitle" :label="t('commonTitle')" />
            <v-textarea v-model="lDesc" :label="t('commonDescription')" />
            <v-text-field v-model.number="lOrder" :label="t('parentOrderNumber')" type="number" />
            <v-select
              v-model="lPrereq"
              :items="lessons"
              item-title="title"
              item-value="id"
              :label="t('parentPrerequisite')"
              clearable
            />
          </v-card-text>
          <v-card-actions>
            <v-spacer/><v-btn variant="text" @click="dlgLesson=false">{{ t('commonCancel') }}</v-btn>
            <v-btn color="primary" @click="addLesson">{{ t('commonCreate') }}</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <v-dialog v-model="dlgChild" max-width="520">
        <v-card>
          <v-card-title>{{ t('parentAddChild') }}</v-card-title>
          <v-card-text>
            <v-text-field v-model="childEmail" :label="t('parentChildEmail')" />
          </v-card-text>
          <v-card-actions>
            <v-spacer/><v-btn variant="text" @click="dlgChild=false">{{ t('commonCancel') }}</v-btn>
            <v-btn color="primary" @click="addChild">{{ t('commonAdd') }}</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <v-divider class="my-6" />
      <h2 class="text-h5 mb-3">{{ t('parentTaskEditor') }}</h2>
      <v-select
        v-model="activeLessonId"
        :items="lessons"
        item-title="title"
        item-value="id"
        :label="t('parentSelectLesson')"
      />
      <div v-if="activeLessonId" class="mt-4">
        <v-btn variant="tonal" prepend-icon="mdi-plus" @click="dlgTask=true">{{ t('parentAddTask') }}</v-btn>
        <v-list class="mt-3">
          <v-list-item
            v-for="tItem in (tasks as Task[])"
            :key="tItem.id"
            :title="`${tItem.orderIndex+1}. ${tItem.promptText ?? t('parentTaskWithoutText')}`"
            :subtitle="`${t('commonType')}: ${tItem.answerType}`"
          >
            <template #append>
              <v-chip v-if="tItem.promptImageUrl" label class="mr-2">image</v-chip>
              <v-btn @click="deleteTask(tItem)" variant="text" color="error" icon="mdi-delete" size="small"></v-btn>
            </template>
          </v-list-item>
        </v-list>
      </div>

      <v-dialog v-model="dlgTask" max-width="640">
        <v-card>
          <v-card-title>{{ t('parentNewTask') }}</v-card-title>
          <v-card-text>
            <v-textarea v-model="tText" :label="t('parentTaskText')" />
            <v-file-input v-model="tFile" :label="t('parentImageOptional')" prepend-icon="mdi-paperclip" />
            <v-select v-model="tType" :items="['text','choices','file']" :label="t('parentAnswerType')" />
            <v-text-field v-model.number="tOrder" :label="t('parentOrderNumber')" type="number" />
            <div v-if="tType==='choices'">
              <v-divider class="my-3" />
              <div class="text-subtitle-2 mb-2">{{ t('parentOptions') }}</div>
              <div v-for="(opt, i) in tOptions" :key="i" class="d-flex ga-2 mb-2">
                <v-text-field v-model="opt.label" :label="t('commonText')" />
                <v-checkbox v-model="opt.isCorrect" :label="t('parentCorrect')" />
              </div>
              <v-btn variant="tonal" @click="tOptions.push({label:'',isCorrect:false})">{{ t('parentAddOption') }}</v-btn>
            </div>
          </v-card-text>
          <v-card-actions>
            <v-spacer/><v-btn variant="text" @click="dlgTask=false">{{ t('commonCancel') }}</v-btn>
            <v-btn color="primary" @click="addTask">{{ t('commonCreate') }}</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-container>
  </NuxtLayout>
</template>

<script setup lang="ts">
import type { Lesson, Task } from '~/types'

definePageMeta({ middleware: 'role-parent' })
const { t } = useI18n()
const route = useRoute()
const programId = route.params.id as string

const lessonHeaders = computed(() => [
  { title: t('commonTitle'), key: 'title' },
  { title: t('commonOrder'), key: 'orderIndex' },
  { title: 'Prereq', key: 'prerequisiteLessonId' },
  { title: t('programsActions'), key: 'actions', sortable: false }
])

const { data: lessons, refresh: refLessons } = await useFetch<Lesson[]>(`/api/programs/${programId}/lessons`)
const dialogDefaults = () => ({ lTitle:'', lDesc:'', lOrder:0, lPrereq: null as string|null })
const dlgLesson = ref(false);
const form = reactive(dialogDefaults())
const { lTitle, lDesc, lOrder, lPrereq } = toRefs(form)

const addLesson = async () => {
  await $fetch(`/api/programs/${programId}/lessons`, {
    method:'POST',
    body:{
      title: lTitle.value,
      description: lDesc.value,
      orderIndex: lOrder.value,
      prerequisiteLessonId: lPrereq.value
    }
  })
  Object.assign(form, dialogDefaults())
  dlgLesson.value = false
  await refLessons()
}

const deleteLesson = async (lesson: Lesson) => {
  if (confirm(`Are you sure you want to delete "${lesson.title}"? This will also delete all tasks in this lesson.`)) {
    try {
      await $fetch(`/api/lessons/${lesson.id}`, { method: 'DELETE' })
      await refLessons()
    } catch (error) {
      alert('Failed to delete lesson')
      console.error(error)
    }
  }
}

const dlgChild = ref(false); const childEmail = ref('')
const addChild = async () => {
  await $fetch(`/api/programs/${programId}/members`, { method:'POST', body:{ childEmail: childEmail.value }})
  dlgChild.value = false; childEmail.value=''
}

const activeLessonId = ref<string|null>(null)
const { data: tasks, refresh: refTasks } = useFetch<Task[]>(
    () => `/api/lessons/${activeLessonId.value}/tasks`,
    {
      server: false,
      default: () => [],
      immediate: false,
      watch: [activeLessonId],
      key: () => activeLessonId.value ? `tasks-${activeLessonId.value}` : 'tasks-none',
    }
)

const dlgTask = ref(false)
const tText = ref(''); const tFile = ref<File|null>(null); const tType = ref<'text'|'choices'|'file'>('text'); const tOrder = ref(0)
const tOptions = ref<{label:string; isCorrect:boolean}[]>([])

const addTask = async () => {
  let imgUrl: string|undefined
  if (tFile.value) {
    const fd = new FormData(); fd.append('file', tFile.value)
    const res = await $fetch<{ url: string }>('/api/upload', { method:'POST', body: fd })
    imgUrl = res.url
  }
  const created = await $fetch<{ id: string }>(`/api/lessons/${activeLessonId.value}/tasks`, { method:'POST', body:{
    promptText: tText.value || undefined,
    promptImageUrl: imgUrl,
    answerType: tType.value,
    orderIndex: tOrder.value
  }})
  if (tType.value==='choices' && tOptions.value.length>0) {
    for (const opt of tOptions.value) {
      await $fetch(`/api/tasks/${created.id}/options`, { method:'POST', body: opt })
    }
  }
  dlgTask.value=false; tText.value=''; tFile.value=null; tType.value='text'; tOrder.value=0; tOptions.value=[]
  refTasks()
}

const deleteTask = async (task: Task) => {
  if (confirm(`Are you sure you want to delete task "${task.promptText || 'Task ' + (task.orderIndex + 1)}"?`)) {
    try {
      await $fetch(`/api/tasks/${task.id}`, { method: 'DELETE' })
      refTasks()
    } catch (error) {
      alert('Failed to delete task')
      console.error(error)
    }
  }
}
</script>