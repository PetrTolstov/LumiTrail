-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "displayName" TEXT,
    "xpTotal" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,
    CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" DATETIME NOT NULL,
    CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Program" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "ownerId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Program_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ProgramMember" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "programId" TEXT NOT NULL,
    "childId" TEXT NOT NULL,
    CONSTRAINT "ProgramMember_programId_fkey" FOREIGN KEY ("programId") REFERENCES "Program" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ProgramMember_childId_fkey" FOREIGN KEY ("childId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Lesson" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "programId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "orderIndex" INTEGER NOT NULL,
    "prerequisiteLessonId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Lesson_programId_fkey" FOREIGN KEY ("programId") REFERENCES "Program" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Lesson_prerequisiteLessonId_fkey" FOREIGN KEY ("prerequisiteLessonId") REFERENCES "Lesson" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Task" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "lessonId" TEXT NOT NULL,
    "promptText" TEXT,
    "promptImageUrl" TEXT,
    "answerType" TEXT NOT NULL,
    "orderIndex" INTEGER NOT NULL,
    CONSTRAINT "Task_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TaskOption" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "taskId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "isCorrect" BOOLEAN NOT NULL,
    CONSTRAINT "TaskOption_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "LessonAttempt" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "lessonId" TEXT NOT NULL,
    "childId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "submittedAt" DATETIME,
    "reviewedAt" DATETIME,
    "reviewedBy" TEXT,
    "awardedXp" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "LessonAttempt_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "LessonAttempt_childId_fkey" FOREIGN KEY ("childId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "LessonAttempt_reviewedBy_fkey" FOREIGN KEY ("reviewedBy") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TaskAnswer" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "attemptId" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "answerText" TEXT,
    "selectedOptionId" TEXT,
    "fileUrl" TEXT,
    CONSTRAINT "TaskAnswer_attemptId_fkey" FOREIGN KEY ("attemptId") REFERENCES "LessonAttempt" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "TaskAnswer_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "TaskAnswer_selectedOptionId_fkey" FOREIGN KEY ("selectedOptionId") REFERENCES "TaskOption" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "XpLedger" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "delta" INTEGER NOT NULL,
    "source" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "XpLedger_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "ProgramMember_programId_childId_key" ON "ProgramMember"("programId", "childId");

-- CreateIndex
CREATE INDEX "Lesson_programId_orderIndex_idx" ON "Lesson"("programId", "orderIndex");

-- CreateIndex
CREATE INDEX "Task_lessonId_orderIndex_idx" ON "Task"("lessonId", "orderIndex");

-- CreateIndex
CREATE INDEX "LessonAttempt_childId_lessonId_idx" ON "LessonAttempt"("childId", "lessonId");
