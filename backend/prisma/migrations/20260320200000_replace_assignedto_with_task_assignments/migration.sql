-- CreateEnum
CREATE TYPE "AssignmentRole" AS ENUM ('owner', 'helper');

-- CreateEnum
CREATE TYPE "AssignmentStatus" AS ENUM ('assigned', 'pending', 'rejected');

-- AlterTable: Add active column to users
ALTER TABLE "users" ADD COLUMN "active" BOOLEAN NOT NULL DEFAULT true;

-- CreateTable: task_assignments
CREATE TABLE "task_assignments" (
    "id" TEXT NOT NULL,
    "task_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "role" "AssignmentRole" NOT NULL,
    "status" "AssignmentStatus" NOT NULL,
    "requested_by_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "task_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "task_assignments_task_id_user_id_key" ON "task_assignments"("task_id", "user_id");

-- AddForeignKey
ALTER TABLE "task_assignments" ADD CONSTRAINT "task_assignments_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task_assignments" ADD CONSTRAINT "task_assignments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task_assignments" ADD CONSTRAINT "task_assignments_requested_by_id_fkey" FOREIGN KEY ("requested_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- DataMigration: Migrate existing assignedTo data to task_assignments
INSERT INTO "task_assignments" ("id", "task_id", "user_id", "role", "status", "updated_at")
SELECT gen_random_uuid(), "id", "assigned_to", 'owner'::"AssignmentRole", 'assigned'::"AssignmentStatus", NOW()
FROM "tasks"
WHERE "assigned_to" IS NOT NULL;

-- DataMigration: Migrate participate TaskRequests to TaskAssignments
INSERT INTO "task_assignments" ("id", "task_id", "user_id", "role", "status", "requested_by_id", "updated_at")
SELECT gen_random_uuid(), tr."task_id", tr."user_id", 'helper'::"AssignmentRole",
  CASE WHEN tr."status" = 'approved' THEN 'assigned'::"AssignmentStatus" ELSE 'pending'::"AssignmentStatus" END,
  tr."resolved_by", NOW()
FROM "task_requests" tr
WHERE tr."type" = 'participate' AND tr."status" != 'rejected'
ON CONFLICT ("task_id", "user_id") DO NOTHING;

-- DataMigration: Delete participate TaskRequests
DELETE FROM "task_requests" WHERE "type" = 'participate';

-- DropForeignKey: Remove assignedTo foreign key
ALTER TABLE "tasks" DROP CONSTRAINT "tasks_assigned_to_fkey";

-- AlterTable: Drop assignedTo column from tasks
ALTER TABLE "tasks" DROP COLUMN "assigned_to";

-- AlterEnum: Remove participate from RequestType
CREATE TYPE "RequestType_new" AS ENUM ('view');
ALTER TABLE "task_requests" ALTER COLUMN "type" TYPE "RequestType_new" USING ("type"::text::"RequestType_new");
ALTER TYPE "RequestType" RENAME TO "RequestType_old";
ALTER TYPE "RequestType_new" RENAME TO "RequestType";
DROP TYPE "RequestType_old";
