/*
  Warnings:

  - You are about to drop the column `artist` on the `apple_music_previews` table. All the data in the column will be lost.
  - You are about to drop the column `track` on the `apple_music_previews` table. All the data in the column will be lost.
  - Added the required column `trackName` to the `apple_music_previews` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "apple_music_previews" DROP COLUMN "artist",
DROP COLUMN "track",
ADD COLUMN     "trackName" TEXT NOT NULL;
