-- CreateTable
CREATE TABLE "OpeningHours" (
    "id" TEXT NOT NULL,
    "openHour" TIMESTAMP(3) NOT NULL,
    "intervalHour" TIMESTAMP(3),
    "closeHour" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OpeningHours_pkey" PRIMARY KEY ("id")
);
