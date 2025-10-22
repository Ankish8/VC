-- CreateTable
CREATE TABLE "SiteSettings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "timerEnabled" BOOLEAN NOT NULL DEFAULT true,
    "timerDurationDays" INTEGER NOT NULL DEFAULT 7,
    "lastResetAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "starterMonthlyPlanId" TEXT,
    "starterYearlyPlanId" TEXT,
    "proMonthlyPlanId" TEXT,
    "proYearlyPlanId" TEXT,
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
    "isAdmin" BOOLEAN NOT NULL DEFAULT false,
    "paypalSubscriptionId" TEXT,
    "subscriptionStatus" TEXT NOT NULL DEFAULT 'none',
    "subscriptionPlan" TEXT,
    "subscriptionEndsAt" DATETIME,
    "subscriptionStartedAt" DATETIME
);
INSERT INTO "new_User" ("createdAt", "email", "id", "isAdmin", "mustChangePassword", "name", "paidAt", "password", "paymentStatus", "paypalPayerId", "paypalTransactionId", "subscriptionType", "updatedAt") SELECT "createdAt", "email", "id", "isAdmin", "mustChangePassword", "name", "paidAt", "password", "paymentStatus", "paypalPayerId", "paypalTransactionId", "subscriptionType", "updatedAt" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "User_paypalSubscriptionId_key" ON "User"("paypalSubscriptionId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
