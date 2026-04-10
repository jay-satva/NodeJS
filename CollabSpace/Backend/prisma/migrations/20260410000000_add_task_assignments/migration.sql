-- CreateTable
CREATE TABLE "TaskAssignment" (
    "taskId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TaskAssignment_pkey" PRIMARY KEY ("taskId","userId")
);

-- Backfill existing single-assignee task data into the new join table
INSERT INTO "TaskAssignment" ("taskId", "userId", "assignedAt")
SELECT "id", "assignedTo", COALESCE("updatedAt", "createdAt")
FROM "Task"
WHERE "assignedTo" IS NOT NULL;

-- AddForeignKey
ALTER TABLE "TaskAssignment"
ADD CONSTRAINT "TaskAssignment_taskId_fkey"
FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskAssignment"
ADD CONSTRAINT "TaskAssignment_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Drop old single-assignee foreign key and column
ALTER TABLE "Task" DROP CONSTRAINT IF EXISTS "Task_assignedTo_fkey";
ALTER TABLE "Task" DROP COLUMN IF EXISTS "assignedTo";
