/*
  Warnings:

  - You are about to drop the column `players` on the `game` table. All the data in the column will be lost.
  - Added the required column `hits` to the `game` table without a default value. This is not possible if the table is not empty.
  - Added the required column `misses` to the `game` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sunkShips` to the `game` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "game" DROP COLUMN "players",
ADD COLUMN     "hits" JSONB NOT NULL,
ADD COLUMN     "misses" JSONB NOT NULL,
ADD COLUMN     "sunkShips" JSONB NOT NULL;

-- CreateTable
CREATE TABLE "_user" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_user_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_user_B_index" ON "_user"("B");

-- AddForeignKey
ALTER TABLE "_user" ADD CONSTRAINT "_user_A_fkey" FOREIGN KEY ("A") REFERENCES "game"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_user" ADD CONSTRAINT "_user_B_fkey" FOREIGN KEY ("B") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
