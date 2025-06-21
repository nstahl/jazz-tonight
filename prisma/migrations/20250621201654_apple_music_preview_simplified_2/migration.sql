/*
  Warnings:

  - Added the required column `artistName` to the `apple_music_previews` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "apple_music_previews" ADD COLUMN     "artistName" TEXT NOT NULL;
