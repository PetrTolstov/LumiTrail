export interface User {
  id: string
  email: string
  role: 'parent' | 'child'
  displayName: string | null
  xpTotal: number
}

export interface Lesson {
  id: string
  title: string
  description: string
  isUnlocked: boolean
}

export interface Program {
  id: string
  title: string
  description: string
}

export interface Task {
  id: string
  orderIndex: number
  promptText: string | null
  promptImageUrl: string | null
  answerType: 'text' | 'choices' | 'file'
  options?: TaskOption[]
}

export interface TaskOption {
  id: string
  label: string
}

export interface Answer {
  answerText?: string
  selectedOptionId?: string
  fileUrl?: string
  localFile?: File
}

export interface Attempt {
  id: string
  lessonId: string
  status: 'draft' | 'submitted' | 'passed' | 'failed'
  submittedAt: string | null
  taskAnswers?: TaskAnswer[]
}

export interface TaskAnswer {
  id: string
  taskId: string
  answerText?: string
  selectedOptionId?: string
  fileUrl?: string
}