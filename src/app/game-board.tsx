/* eslint-disable @typescript-eslint/no-explicit-any */
import { useClientManager } from "@/context/client-manager";
import { hitShipAt } from "@/database/database-helpers";
import { useResponsive } from "@/hook/useResponsive";
import { TSocketData } from "@/hook/useSocket";
import { cx } from "@/lib/util";
import { Application, extend } from "@pixi/react";
import { AnimatePresence, motion } from "motion/react";
import { pre } from "motion/react-client";
import { Container, Graphics, Text } from "pixi.js";
import {
  MouseEvent,
  ReactEventHandler,
  use,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

extend({
  Container,
  Graphics,
});

interface GameboardState {
  shipPositions?: number[][];
  hitPositions: number[][];
  missPositions: number[][];
  sunkShips: number;
  isPlayersTurn: boolean;
}

export const GameBoard = ({ players, client }: TSocketData) => {
  const { gameState, currentGameId } = useClientManager();
  const { dimensions, isMobile, loading } = useResponsive();
  const [board, setBoard] = useState({
    width: 0,
    height: 0,
    cellSize: 0,
    offsetX: 0,
    offsetY: 0,
    grid_cells: 10,
    grid_padding: 70,
  });
  const [playerState, setPlayerState] = useState<GameboardState>({
    shipPositions: [],
    hitPositions: [],
    missPositions: [],
    sunkShips: 0,
    isPlayersTurn: true,
  });
  const [opponentState, setOpponentState] = useState<GameboardState>({
    hitPositions: [],
    missPositions: [],
    sunkShips: 0,
    isPlayersTurn: false,
  });

  const updateBoard = () => {
    const width = playerBoard.current?.clientWidth;
    const height = playerBoard.current?.clientHeight;

    const GRID_CELLS = 10;
    const GRID_PADDING = 70;

    const availableWidth = board.width - GRID_PADDING * 2;
    const availableHeight = board.width - GRID_PADDING * 2;

    const cellSize = Math.floor(
      Math.min(availableWidth / GRID_CELLS, availableHeight / GRID_CELLS)
    );

    const offsetX = Math.floor((width || 0) - cellSize * GRID_CELLS) / 2;
    const offsetY = Math.floor((height || 0) - cellSize * GRID_CELLS) / 2;

    setBoard({
      width: width || 0,
      height: height || 0,
      cellSize,
      offsetX,
      offsetY,
      grid_cells: GRID_CELLS,
      grid_padding: GRID_PADDING,
    });
  };

  const drawCallback = useCallback(
    (graphics: Graphics, boardType: "player" | "opponent") => {
      updateBoard();
      graphics.clear();
      graphics.removeChildren();
      const { cellSize, offsetX, offsetY, grid_cells: GRID_CELLS } = board;

      for (let i = 0; i < GRID_CELLS; i++) {
        const label = String.fromCharCode(65 + i);
        const letterLabel = new Text(label, {
          fontFamily: "IBM Plex Mono",
          fontSize: 24,
          fill: 0xcccccc,
          align: "center",
        });

        letterLabel.anchor.set(0.5, 0.5);
        letterLabel.x = offsetX + i * cellSize + cellSize / 2;
        letterLabel.y = offsetY - 35;

        graphics.addChild(letterLabel);

        const numberLabel = new Text(String(i + 1), {
          fontFamily: "Arial",
          fontSize: 24,
          fill: 0xcccccc,
          align: "center",
        });
        numberLabel.anchor.set(0.5, 0.5);
        numberLabel.x = offsetX - 35;
        numberLabel.y = offsetY + i * cellSize + cellSize / 2;

        graphics.addChild(numberLabel);
      }

      for (let row = 0; row < GRID_CELLS; row++) {
        for (let col = 0; col < GRID_CELLS; col++) {
          const x = offsetX + col * cellSize;
          const y = offsetY + row * cellSize;

          graphics.rect(x, y, cellSize, cellSize);

          const { cellLabel, isShip, isHit, isMiss } = getCellInformation({
            cellX: col,
            cellY: row,
            boardType,
          });

          graphics.fill(isHit ? 0xff0000 : isMiss ? 0x0000ff : 0x111111);
          graphics.stroke(0x444444);
        }
      }
    },
    [board, playerState, opponentState]
  );

  const getCellPosition = (x: number, y: number) => {
    const { cellSize, offsetX, offsetY } = board;
    const cellX = Math.floor((x - offsetX) / cellSize);
    const cellY = Math.floor((y - offsetY) / cellSize);
    return { cellX, cellY };
  };

  const getCellLabel = (cellX: number, cellY: number) => {
    const label = String.fromCharCode(65 + cellX);
    const number = cellY + 1;
    return `${label}${number}`;
  };

  const isInBounds = (cellX: number, cellY: number) => {
    const { grid_cells } = board;
    return cellX >= 0 && cellX < grid_cells && cellY >= 0 && cellY < grid_cells;
  };

  const getCellInformation = ({
    cellX,
    cellY,
    boardType,
  }: {
    cellX: number;
    cellY: number;
    boardType: "player" | "opponent";
  }) => {
    const { shipPositions, hitPositions, missPositions } =
      boardType === "player" ? playerState : opponentState;
    const cellLabel = getCellLabel(cellX, cellY);
    const isShip = shipPositions?.some(
      (pos) => pos[0] === cellX && pos[1] === cellY
    );
    const isHit = hitPositions.some(
      (pos) => pos[0] === cellX && pos[1] === cellY
    );
    const isMiss = missPositions.some(
      (pos) => pos[0] === cellX && pos[1] === cellY
    );
    return { cellLabel, isShip, isHit, isMiss };
  };

  const handleCellClick = async (
    event: MouseEvent<HTMLElement>,
    boardType: "player" | "opponent"
  ) => {
    console.log(currentGameId, client);
    if (!currentGameId || !client) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const { cellX, cellY } = getCellPosition(x, y);

    if (isInBounds(cellX, cellY)) {
      const cellLabel = getCellLabel(cellX, cellY);
      console.log(
        `Clicked on ${boardType} board: ${cellLabel} (${cellX}, ${cellY})`
      );

      if (gameState === "ship-placement") placeShip({ x: cellX, y: cellY });
      else if (gameState === "game") {
        const hitResult = await hitShipAt({
          gameId: currentGameId,
          playerId: client.id,
          position: { x: cellX, y: cellY },
        });
        console.log(hitResult);
      }
    }
  };

  const placeShip = async ({ x, y }: { x: number; y: number }) => {};

  const playerBoard = useRef<HTMLDivElement>(null);
  const opponentBoard = useRef<HTMLDivElement>(null);

  return (
    <div className='flex h-screen w-screen'>
      <AnimatePresence>
        {!loading && (
          <>
            <motion.div
              ref={playerBoard}
              transition={{ duration: 0.5 }}
              className={cx(
                "w-full h-full transition-all duration-500",
                !playerState.isPlayersTurn && "opacity-30"
              )}
              onClick={(event) => handleCellClick(event, "player")}
            >
              <Application resizeTo={playerBoard} backgroundColor={0x111111}>
                <pixiContainer>
                  <pixiGraphics
                    draw={(graphics: Graphics) =>
                      drawCallback(graphics, "player")
                    }
                  />
                </pixiContainer>
              </Application>
            </motion.div>
            <motion.div
              ref={opponentBoard}
              transition={{ duration: 0.5 }}
              className={cx(
                "w-full h-full transition-all duration-500",
                !opponentState.isPlayersTurn && "opacity-30"
              )}
              onClick={(event) => handleCellClick(event, "opponent")}
            >
              <Application resizeTo={opponentBoard} backgroundColor={0x111111}>
                <pixiContainer>
                  <pixiGraphics
                    draw={(graphics: Graphics) =>
                      drawCallback(graphics, "opponent")
                    }
                  />
                </pixiContainer>
              </Application>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
