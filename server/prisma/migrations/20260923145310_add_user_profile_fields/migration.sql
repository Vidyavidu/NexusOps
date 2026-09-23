-- AlterTable
ALTER TABLE "Ticket" ADD COLUMN     "assignmentGroup" TEXT,
ADD COLUMN     "category" TEXT,
ADD COLUMN     "parentId" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "department" TEXT,
ADD COLUMN     "employeeId" TEXT,
ADD COLUMN     "phone" TEXT;

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Ticket"("id") ON DELETE SET NULL ON UPDATE CASCADE;
