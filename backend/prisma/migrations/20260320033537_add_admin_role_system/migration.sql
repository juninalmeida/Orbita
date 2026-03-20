-- CreateEnum
CREATE TYPE "RequestType" AS ENUM ('view', 'participate');

-- CreateEnum
CREATE TYPE "RequestStatus" AS ENUM ('pending', 'approved', 'rejected');

-- AlterTable
ALTER TABLE "tasks" ADD COLUMN     "archived" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "archived_at" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "tasks_history" ADD COLUMN     "justification" TEXT;

-- CreateTable
CREATE TABLE "task_requests" (
    "id" TEXT NOT NULL,
    "task_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "type" "RequestType" NOT NULL,
    "status" "RequestStatus" NOT NULL DEFAULT 'pending',
    "message" VARCHAR(500),
    "resolved_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolved_at" TIMESTAMP(3),

    CONSTRAINT "task_requests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "task_requests_status_idx" ON "task_requests"("status");

-- CreateIndex
CREATE UNIQUE INDEX "task_requests_task_id_user_id_type_key" ON "task_requests"("task_id", "user_id", "type");

-- AddForeignKey
ALTER TABLE "task_requests" ADD CONSTRAINT "task_requests_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task_requests" ADD CONSTRAINT "task_requests_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task_requests" ADD CONSTRAINT "task_requests_resolved_by_fkey" FOREIGN KEY ("resolved_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
