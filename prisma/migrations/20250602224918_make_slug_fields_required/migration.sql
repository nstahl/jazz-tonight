/*
  Warnings:

  - Made the column `slug` on table `events` required. This step will fail if there are existing NULL values in that column.
  - Made the column `slug` on table `venues` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "events" ALTER COLUMN "slug" SET NOT NULL;

-- AlterTable
ALTER TABLE "venues" ALTER COLUMN "slug" SET NOT NULL;
