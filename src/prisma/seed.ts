import { PrismaClient } from '@prisma/client'
import { Argon2id } from 'oslo/password'
const prisma = new PrismaClient()

async function main() {
  const passParent = await new Argon2id().hash('parent123')
  const passChild = await new Argon2id().hash('child123')

  const parent = await prisma.user.upsert({
    where: { email: 'parent@demo.local' },
    update: {},
    create: { email: 'parent@demo.local', passwordHash: passParent, role: 'parent', displayName: 'Demo Parent' }
  })
  const child = await prisma.user.upsert({
    where: { email: 'child@demo.local' },
    update: {},
    create: { email: 'child@demo.local', passwordHash: passChild, role: 'child', displayName: 'Demo Child' }
  })

  const program = await prisma.program.create({
    data: { ownerId: parent.id, title: 'Азбука', description: 'Учимся по шагам' }
  })
  await prisma.programMember.create({ data: { programId: program.id, childId: child.id } })

  const l1 = await prisma.lesson.create({ data: { programId: program.id, title: 'Буквы A–C', orderIndex: 0 } })
  const l2 = await prisma.lesson.create({ data: { programId: program.id, title: 'Буквы D–F', orderIndex: 1, prerequisiteLessonId: l1.id } })
  const l3 = await prisma.lesson.create({ data: { programId: program.id, title: 'Буквы G–I', orderIndex: 2, prerequisiteLessonId: l2.id } })

  const t1 = await prisma.task.create({ data: { lessonId: l1.id, promptText: 'Напиши букву после A', answerType: 'text', orderIndex: 0 } })
  const t2 = await prisma.task.create({ data: { lessonId: l1.id, promptText: 'Выбери букву перед C', answerType: 'choices', orderIndex: 1 } })
  await prisma.taskOption.createMany({
    data: [
      { taskId: t2.id, label: 'A', isCorrect: true },
      { taskId: t2.id, label: 'B', isCorrect: false },
      { taskId: t2.id, label: 'D', isCorrect: false }
    ]
  })
  await prisma.task.create({ data: { lessonId: l1.id, promptText: 'Прикрепи рисунок буквы B', answerType: 'file', orderIndex: 2 } })
}

main().then(()=>prisma.$disconnect()).catch(e=>{console.error(e); prisma.$disconnect(); process.exit(1)})