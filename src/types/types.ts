export type TClientUser = {
  id: string;
  name: string;
  isAnonymous: boolean;
  image: string;
  isVerified: boolean;
  rank: string;
  wins: number;
  losses: number;
  winRate: number;
};

export type TShipStorage = {
  [key: string]: {
    // key is the players id
    name: string;
    type: string;
    size: number;
    color: string;
    positions: {
      x: number;
      y: number;
    }[];
  }[];
};

export type TGame = {
  id: string;
  players: TClientUser[];
  createdAt: Date;
  updatedAt: Date;
  gameState: TGameState;
  ships: TShipStorage;
  sunkShips: {
    [key: string]: number;
  };
  hits: {
    [key: string]: number[][];
  };
  misses: {
    [key: string]: number[][];
  };
};

export type TGameState =
  | "main-menu"
  | "game"
  | "ship-placement"
  | "post-game"
  | "waiting-room"
  | "paused";
