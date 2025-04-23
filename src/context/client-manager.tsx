import { TGameState } from "@/types/types";
import { createContext, useContext, useEffect, useState } from "react";

interface ClientManagerContext {
  gameState: TGameState;
  setGameState: (state: TGameState) => void;
  currentGameId: string | null;
  setCurrentGameId: (gameId: string | null) => void;
  isPaused: boolean;
  setPaused: (paused: boolean) => void;
}

const ClientManagerContext = createContext<ClientManagerContext | undefined>(
  undefined
);

const ClientManagerProvider = ({ children }: { children: React.ReactNode }) => {
  const [gameState, setGameState] = useState<TGameState>("main-menu");
  const [currentGameId, setCurrentGameId] = useState<string | null>(null);
  const [isPaused, setPaused] = useState(false);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setPaused((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <ClientManagerContext.Provider
      value={{
        gameState,
        setGameState,
        isPaused,
        setPaused,
        currentGameId,
        setCurrentGameId,
      }}
    >
      {children}
    </ClientManagerContext.Provider>
  );
};

const useClientManager = () => {
  const context = useContext(ClientManagerContext);
  if (!context) {
    throw new Error(
      "useClientManager must be used within a ClientManagerProvider"
    );
  }
  return context;
};

export { ClientManagerContext, ClientManagerProvider, useClientManager };
