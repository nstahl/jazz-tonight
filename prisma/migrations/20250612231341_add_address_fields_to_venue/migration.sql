-- AlterTable
ALTER TABLE "venues" ADD COLUMN     "addressCountry" TEXT,
ADD COLUMN     "addressLocality" TEXT,
ADD COLUMN     "addressRegion" TEXT,
ADD COLUMN     "postalCode" TEXT,
ADD COLUMN     "streetAddress" TEXT;
