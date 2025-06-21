-- CreateTable
CREATE TABLE "apple_music_previews" (
    "id" TEXT NOT NULL,
    "artist" TEXT NOT NULL,
    "track" TEXT NOT NULL,
    "previewUrl" TEXT NOT NULL,
    "appleMusicUrl" TEXT NOT NULL,
    "artworkUrl" TEXT NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "artistProfileId" TEXT NOT NULL,

    CONSTRAINT "apple_music_previews_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "apple_music_previews" ADD CONSTRAINT "apple_music_previews_artistProfileId_fkey" FOREIGN KEY ("artistProfileId") REFERENCES "artist_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
