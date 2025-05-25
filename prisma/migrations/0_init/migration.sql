-- CreateTable
CREATE TABLE "venues" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "venues_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "artist_profiles" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "website" TEXT,
    "instagram" TEXT,
    "youtubeUrls" TEXT[],
    "biography" TEXT,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "artist_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "performers" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "instrument" TEXT NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "performers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event_performers" (
    "eventId" TEXT NOT NULL,
    "performerId" TEXT NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "event_performers_pkey" PRIMARY KEY ("eventId","performerId")
);

-- CreateTable
CREATE TABLE "events" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "logline" TEXT,
    "dateString" TEXT NOT NULL,
    "setTimes" TEXT[],
    "venueId" TEXT NOT NULL,
    "artistId" TEXT,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "venues_name_key" ON "venues"("name");

-- CreateIndex
CREATE UNIQUE INDEX "artist_profiles_name_key" ON "artist_profiles"("name");

-- CreateIndex
CREATE UNIQUE INDEX "performers_name_instrument_key" ON "performers"("name", "instrument");

-- CreateIndex
CREATE UNIQUE INDEX "events_name_dateString_venueId_key" ON "events"("name", "dateString", "venueId");

-- AddForeignKey
ALTER TABLE "event_performers" ADD CONSTRAINT "event_performers_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "events"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_performers" ADD CONSTRAINT "event_performers_performerId_fkey" FOREIGN KEY ("performerId") REFERENCES "performers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "events_artistId_fkey" FOREIGN KEY ("artistId") REFERENCES "artist_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "events_venueId_fkey" FOREIGN KEY ("venueId") REFERENCES "venues"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

