-- CreateTable
CREATE TABLE "user_pokemons" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "pokemonId" INTEGER NOT NULL,

    CONSTRAINT "user_pokemons_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "user_pokemons" ADD CONSTRAINT "user_pokemons_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
