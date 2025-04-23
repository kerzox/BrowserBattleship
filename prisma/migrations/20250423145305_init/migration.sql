-- CreateTable
CREATE TABLE "game" (
    "id" TEXT NOT NULL,
    "players" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "gameState" TEXT NOT NULL,
    "ships" JSONB NOT NULL,

    CONSTRAINT "game_pkey" PRIMARY KEY ("id")
);
