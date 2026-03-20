-- DropForeignKey
ALTER TABLE "tasks" DROP CONSTRAINT "tasks_team_id_fkey";

-- AlterTable
ALTER TABLE "tasks" ALTER COLUMN "team_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE SET NULL ON UPDATE CASCADE;
