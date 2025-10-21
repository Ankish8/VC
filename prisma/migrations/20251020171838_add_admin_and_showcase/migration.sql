-- CreateTable
CREATE TABLE "ShowcaseImage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "rasterImageUrl" TEXT NOT NULL,
    "svgUrl" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "subscriptionType" TEXT NOT NULL DEFAULT 'free',
    "paymentStatus" TEXT NOT NULL DEFAULT 'none',
    "paypalTransactionId" TEXT,
    "paypalPayerId" TEXT,
    "mustChangePassword" BOOLEAN NOT NULL DEFAULT false,
    "paidAt" DATETIME,
    "isAdmin" BOOLEAN NOT NULL DEFAULT false
);
INSERT INTO "new_User" ("createdAt", "email", "id", "mustChangePassword", "name", "paidAt", "password", "paymentStatus", "paypalPayerId", "paypalTransactionId", "subscriptionType", "updatedAt") SELECT "createdAt", "email", "id", "mustChangePassword", "name", "paidAt", "password", "paymentStatus", "paypalPayerId", "paypalTransactionId", "subscriptionType", "updatedAt" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "ShowcaseImage_displayOrder_idx" ON "ShowcaseImage"("displayOrder");
