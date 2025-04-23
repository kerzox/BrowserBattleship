"use server";

import { TGame, TShipStorage } from "@/types/types";
import { prisma } from "./prisma/prisma";
import { v4 } from "uuid";

const createGame = async ({ players }: { players: string[] }) => {
  try {
    const game = await prisma.game.create({
      data: {
        id: v4(),
        players: {
          connect: players.map((id) => ({ id })),
        },
        gameState: "ship-placement",
        ships: {},
        hits: {},
        misses: {},
        sunkShips: {},
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
    return {
      error: false,
      data: game as TGame,
    };
  } catch (error) {
    console.error("Error creating game:", error);
    return {
      error: true,
      message: "Error creating game",
    };
  }
};

const updateGame = async ({ data }: { data: TGame }) => {
  try {
    const game = await prisma.game.update({
      where: { id: data.id },
      data: {
        hits: data.hits,
        misses: data.misses,
        sunkShips: data.sunkShips,
        gameState: data.gameState,
        ships: data.ships,
        updatedAt: new Date(),
      },
    });
    return {
      error: false,
      data: game,
    };
  } catch (error) {
    console.error("Error updating game:", error);
    return {
      error: true,
      message: "Error updating game",
    };
  }
};

const deleteGame = async ({ gameId }: { gameId: string }) => {
  try {
    const game = await prisma.game.delete({
      where: { id: gameId },
    });
    return {
      error: false,
      data: game,
    };
  } catch (error) {
    console.error("Error deleting game:", error);
    return {
      error: true,
      message: "Error deleting game",
    };
  }
};

const getGame = async ({ gameId }: { gameId: string }) => {
  try {
    const game = await prisma.game.findUnique({
      where: { id: gameId },
    });
    return {
      error: false,
      data: game,
    };
  } catch (error) {
    console.error("Error getting game:", error);
    return {
      error: true,
      message: "Error getting game",
    };
  }
};

const getGames = async () => {
  try {
    const games = await prisma.game.findMany();
    return {
      error: false,
      data: games,
    };
  } catch (error) {
    console.error("Error getting games:", error);
    return {
      error: true,
      message: "Error getting games",
    };
  }
};

const getGamesByUser = async ({ userId }: { userId: string }) => {
  try {
    const games = await prisma.game.findMany({
      where: {
        players: {
          some: {
            id: userId,
          },
        },
      },
    });
    return {
      error: false,
      data: games,
    };
  } catch (error) {
    console.error("Error getting games by user:", error);
    return {
      error: true,
      message: "Error getting games by user",
    };
  }
};

const hitShipAt = async ({
  gameId,
  playerId,
  position,
}: {
  gameId: string;
  playerId: string;
  position: { x: number; y: number };
}) => {
  try {
    const game = await prisma.game.findUnique({
      where: { id: gameId },
      select: {
        ships: true,
        hits: true,
        misses: true,
        sunkShips: true,
      },
    });
    if (!game) {
      return {
        error: true,
        message: "Error getting game",
      };
    }
    const ships = game.ships as TShipStorage;
    const hits = game.hits as Record<string, number[][]>;
    const misses = game.misses as Record<string, number[][]>;
    const sunkShips = game.sunkShips as Record<string, number>;

    if (!ships || !ships[playerId]) {
      return {
        error: true,
        message: "Error getting ships from game",
      };
    }
    const playerShips = ships[playerId];
    const shipAt = playerShips.find((ship) => {
      return ship.positions.some(
        (pos) => pos.x === position.x && pos.y === position.y
      );
    });

    if (shipAt) {
      const hasBeenHit = hits[playerId]?.some(
        (pos) => pos[0] === position.x && pos[1] === position.y
      );
      if (hasBeenHit) {
        return {
          message: "Already hit this position",
        };
      }

      const isSunk = shipAt.positions.every((pos) => {
        return hits[playerId]?.some(
          (hitPos) => hitPos[0] === pos.x && hitPos[1] === pos.y
        );
      });

      if (isSunk) {
        sunkShips[playerId] = (sunkShips[playerId] || 0) + 1;
      }

      hits[playerId][position.x][position.y] = 1;
    } else {
      misses[playerId][position.x][position.y] = 1;
    }
    const updatedGame = await prisma.game.update({
      where: { id: gameId },
      data: {
        hits: {
          [playerId]: hits[playerId],
        },
        sunkShips: {
          [playerId]: sunkShips[playerId],
        },
        misses: {
          [playerId]: misses[playerId],
        },
      },
    });

    return {
      error: false,
      data: updatedGame,
    };
  } catch (error) {
    return {
      error: true,
      message: error,
    };
  }
};

const getPlayerShipsFromGame = async ({
  gameId,
  playerId,
}: {
  gameId: string;
  playerId: string;
}) => {
  try {
    const game = await prisma.game.findUnique({
      where: { id: gameId },
      select: {
        ships: true,
      },
    });
    if (!game) {
      return {
        error: true,
        message: "Error getting ships from game",
      };
    }
    const ships = game.ships as TShipStorage;
    if (!ships || !ships[playerId]) {
      return {
        error: true,
        message: "Error getting ships from game",
      };
    }
    return {
      error: false,
      data: ships[playerId],
    };
  } catch (error) {
    console.error("Error getting player ships from game:", error);
    return {
      error: true,
      message: error,
    };
  }
};

export {
  createGame,
  updateGame,
  deleteGame,
  getGame,
  getGames,
  getGamesByUser,
  hitShipAt,
  getPlayerShipsFromGame,
};
