-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Lesson" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "programId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "orderIndex" INTEGER NOT NULL,
    "prerequisiteLessonId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Lesson_programId_fkey" FOREIGN KEY ("programId") REFERENCES "Program" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Lesson_prerequisiteLessonId_fkey" FOREIGN KEY ("prerequisiteLessonId") REFERENCES "Lesson" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Lesson" ("createdAt", "description", "id", "orderIndex", "prerequisiteLessonId", "programId", "title") SELECT "createdAt", "description", "id", "orderIndex", "prerequisiteLessonId", "programId", "title" FROM "Lesson";
DROP TABLE "Lesson";
ALTER TABLE "new_Lesson" RENAME TO "Lesson";
CREATE INDEX "Lesson_programId_orderIndex_idx" ON "Lesson"("programId", "orderIndex");
CREATE TABLE "new_LessonAttempt" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "lessonId" TEXT NOT NULL,
    "childId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "submittedAt" DATETIME,
    "reviewedAt" DATETIME,
    "reviewedBy" TEXT,
    "awardedXp" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "LessonAttempt_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "LessonAttempt_childId_fkey" FOREIGN KEY ("childId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "LessonAttempt_reviewedBy_fkey" FOREIGN KEY ("reviewedBy") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_LessonAttempt" ("awardedXp", "childId", "id", "lessonId", "reviewedAt", "reviewedBy", "status", "submittedAt") SELECT "awardedXp", "childId", "id", "lessonId", "reviewedAt", "reviewedBy", "status", "submittedAt" FROM "LessonAttempt";
DROP TABLE "LessonAttempt";
ALTER TABLE "new_LessonAttempt" RENAME TO "LessonAttempt";
CREATE INDEX "LessonAttempt_childId_lessonId_idx" ON "LessonAttempt"("childId", "lessonId");
CREATE TABLE "new_ProgramMember" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "programId" TEXT NOT NULL,
    "childId" TEXT NOT NULL,
    CONSTRAINT "ProgramMember_programId_fkey" FOREIGN KEY ("programId") REFERENCES "Program" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ProgramMember_childId_fkey" FOREIGN KEY ("childId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_ProgramMember" ("childId", "id", "programId") SELECT "childId", "id", "programId" FROM "ProgramMember";
DROP TABLE "ProgramMember";
ALTER TABLE "new_ProgramMember" RENAME TO "ProgramMember";
CREATE UNIQUE INDEX "ProgramMember_programId_childId_key" ON "ProgramMember"("programId", "childId");
CREATE TABLE "new_Task" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "lessonId" TEXT NOT NULL,
    "promptText" TEXT,
    "promptImageUrl" TEXT,
    "answerType" TEXT NOT NULL,
    "orderIndex" INTEGER NOT NULL,
    CONSTRAINT "Task_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Task" ("answerType", "id", "lessonId", "orderIndex", "promptImageUrl", "promptText") SELECT "answerType", "id", "lessonId", "orderIndex", "promptImageUrl", "promptText" FROM "Task";
DROP TABLE "Task";
ALTER TABLE "new_Task" RENAME TO "Task";
CREATE INDEX "Task_lessonId_orderIndex_idx" ON "Task"("lessonId", "orderIndex");
CREATE TABLE "new_TaskAnswer" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "attemptId" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "answerText" TEXT,
    "selectedOptionId" TEXT,
    CONSTRAINT "TaskAnswer_attemptId_fkey" FOREIGN KEY ("attemptId") REFERENCES "LessonAttempt" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "TaskAnswer_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "TaskAnswer_selectedOptionId_fkey" FOREIGN KEY ("selectedOptionId") REFERENCES "TaskOption" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_TaskAnswer" ("answerText", "attemptId", "id", "selectedOptionId", "taskId") SELECT "answerText", "attemptId", "id", "selectedOptionId", "taskId" FROM "TaskAnswer";
DROP TABLE "TaskAnswer";
ALTER TABLE "new_TaskAnswer" RENAME TO "TaskAnswer";
CREATE TABLE "new_TaskOption" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "taskId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "isCorrect" BOOLEAN NOT NULL,
    CONSTRAINT "TaskOption_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_TaskOption" ("id", "isCorrect", "label", "taskId") SELECT "id", "isCorrect", "label", "taskId" FROM "TaskOption";
DROP TABLE "TaskOption";
ALTER TABLE "new_TaskOption" RENAME TO "TaskOption";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
