/*
  Warnings:

  - You are about to drop the `Device` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `updatedAt` to the `Loan` table without a default value. This is not possible if the table is not empty.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Device";
PRAGMA foreign_keys=on;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Loan" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "deviceId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'REQUESTED',
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Loan" ("createdAt", "deviceId", "endDate", "id", "startDate", "status", "type", "userId") SELECT "createdAt", "deviceId", "endDate", "id", "startDate", "status", "type", "userId" FROM "Loan";
DROP TABLE "Loan";
ALTER TABLE "new_Loan" RENAME TO "Loan";
CREATE INDEX "Loan_status_idx" ON "Loan"("status");
CREATE INDEX "Loan_userId_idx" ON "Loan"("userId");
CREATE INDEX "Loan_deviceId_idx" ON "Loan"("deviceId");
CREATE INDEX "Loan_createdAt_idx" ON "Loan"("createdAt");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");
