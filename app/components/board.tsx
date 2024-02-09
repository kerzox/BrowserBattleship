import {
  ReactEventHandler,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import "./board.css";
import { states } from "~/routes/_index";
import { wsContext } from "~/context/connectionContext";
import { packet } from "~/util/responses";
import Button from "./button";
import { assets } from "build";
import ToggleButton from "./togglebutton";
import LockIcon from "./icons/lock";

const shipSizes = [2, 3, 3, 4, 5];

const shipNames = [
  "Patrol Boat",
  "Submarine",
  "Destroyer",
  "Battleship",
  "Aircraft Carrier",
];

interface coordinates {
  row: number;
  col: number;
}

//https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array

function shuffleArray(array: any) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

export default function Board({
  gameRoom,
  player,
  gameState,
  enemy,
  boardState,
  alert,
}: {
  gameRoom: object;
  player: String;
  gameState: String;
  enemy: Boolean;
  boardState: any;
  alert: any;
}) {
  const rows = 10;
  const cols = 10;

  const contextValue = useContext(wsContext);

  const handleKeyDownRef = useRef<any>(null);
  const shipIndex = useRef<number>(0);
  const locked = useRef(false);
  const isVertical = useRef(false);

  const [oldGameState, setGameState] = useState<String>("");
  const [gridState, setGridState] = useState(Array(rows * cols).fill(false));
  const [ships, setShips] = useState<number[][]>([
    [], // patrol boat
    [], // submarine
    [], // destroyer
    [], // battleship
    [], // aircraft carrier
  ]);
  const [hovering, setHovering] = useState<number[]>([]);

  useEffect(() => {
    if (oldGameState !== states.not_running && gameState !== states.running) {
      setGridState(Array(rows * cols).fill(false));
      setHovering([]);
      isVertical.current = false;
      locked.current = false;
      shipIndex.current = 0;
      setShips([
        [], // patrol boat
        [], // submarine
        [], // destroyer
        [], // battleship
        [], // aircraft carrier
      ]);
    }
    setGameState(gameState);
  }, [gameState]);

  const checkBoardState = (coordinate_index: number) => {
    if (!enemy) {
      if (gameState == states.running) {
        const playerIndex = boardState.players.findIndex(
          (player: string | undefined) => player === contextValue?.socket.id
        );
        const hit_board = boardState.data.boards[playerIndex][1];
        if (
          Object(hit_board[coordinate_index]) === hit_board[coordinate_index]
        ) {
          if (hit_board[coordinate_index].type == "hit") {
            return "hit-on-you";
          }
          if (hit_board[coordinate_index].type == "miss") {
            return "miss-on-you";
          }
        } else {
          if (gridState[coordinate_index]) return "clicked";
          else return "";
        }
      } else {
        if (gridState[coordinate_index]) return "clicked";
        else return "";
      }
    }
    if (gameState == states.running) {
      const playerIndex = boardState.players.findIndex(
        (player: string | undefined) => player != contextValue?.socket.id
      );
      const victim_hit_board = boardState.data.boards[playerIndex][1];
      if (
        Object(victim_hit_board[coordinate_index]) !==
        victim_hit_board[coordinate_index]
      ) {
        return "";
      }

      if (victim_hit_board[coordinate_index].type == "miss") {
        return "miss";
      }

      if (victim_hit_board[coordinate_index].type == "hit") {
        return "hit";
      }
    }
  };

  function moveInDirection(
    direction: string,
    rowIndex: number,
    colIndex: number
  ) {
    switch (direction) {
      case "left":
        return { rowIndex: rowIndex - 1, colIndex };
      case "up":
        return { rowIndex, colIndex: colIndex - 1 };
      case "right":
        return { rowIndex: rowIndex + 1, colIndex };
      case "down":
        return { rowIndex, colIndex: colIndex + 1 };
      default:
        throw new Error(`Invalid direction: ${direction}`);
    }
  }

  const getRowCol = (index: number) => {
    return {
      rowIndex: Math.floor(index / cols),
      colIndex: index % cols,
    };
  };

  const getAsIndex = ({
    rowIndex,
    colIndex,
  }: {
    rowIndex: number;
    colIndex: number;
  }) => {
    return rowIndex * 10 + colIndex;
  };

  const validPos = ({
    rowIndex,
    colIndex,
  }: {
    rowIndex: number;
    colIndex: number;
  }) => {
    return rowIndex > 0 && rowIndex < 10 && colIndex > 0 && colIndex < 10;
  };

  const addToGrid = (index: number, value: Boolean) => {
    const newGridState = [...gridState];
    newGridState[index] = value;
    setGridState(newGridState);
  };

  const cellColour = (index: number) => {
    if (enemy) {
      if (gameState == states.running) {
        if (isItMyTurn()) {
          if (gridState[index]) return checkBoardState(index);
          else return "disabled";
        } else {
          if (gridState[index]) {
            return checkBoardState(index);
          } else return "";
        }
      }

      // if (gameState == states.not_running) {
      //   if (gridState[index]) {
      //     return checkBoardState(index);
      //   } else return "";
      // } else {
      //   if (gridState[index]) return checkBoardState(index);
      //   else return "disabled";
      // }
    } else {
      return gridState[index] ? checkBoardState(index) : checkBoardState(index);
    }

    // enemy
    // ? !isItMyTurn()
    // ? gridState[index] ? checkBoardState(index) : ""
    //   : gridState[index]
    //   ? checkBoardState(index)
    //   : "disabled"
    // : gridState[index]
    // ? checkBoardState(index)
    // : ""
  };

  const isItMyTurn = () => {
    return (
      contextValue?.socket.id !=
      boardState.players[boardState.data.currentPlayer]
    );
  };

  const randomisePlacement = () => {
    const shipsFilled = [...ships];
    setGridState(Array(rows * cols).fill(false));
    const newGridState = Array(rows * cols).fill(false);
    let remainingShipsToPlace = [2, 3, 3, 4, 5];
    let index = 0;
    let placed: number[] = [];
    let counter = 0;
    while (remainingShipsToPlace.length > 0) {
      const currentShip = remainingShipsToPlace.shift();
      if (currentShip == undefined) break;
      let randomIndex = undefined;

      // now we loop over untill we break out of it
      while (counter < 1500) {
        counter++;
        randomIndex = Math.floor(Math.random() * 100);
        if (placed.includes(randomIndex)) continue;
        let position = getRowCol(randomIndex);
        let shipCoordinates: number[] = [];
        const directions = shuffleArray(["left", "right", "up", "down"]);

        directionLoop: for (const direction of directions) {
          for (let step = 0; step < currentShip; step++) {
            position = moveInDirection(
              direction,
              position.rowIndex,
              position.colIndex
            );
            let asIndex = getAsIndex(position);

            // if its not a valid pos if out of bounds or placed / shipcoordinates has the position.
            if (
              !validPos(position) ||
              placed.includes(asIndex) ||
              shipCoordinates.includes(asIndex)
            ) {
              shipCoordinates = [];
              continue directionLoop;
            }

            shipCoordinates.push(asIndex);
          }
        }

        if (shipCoordinates.length == currentShip) {
          placed.push(...shipCoordinates);
          shipsFilled[shipIndex.current] = [...shipCoordinates];
          break;
        }
      }
      index++;
    }
    for (const index of placed) {
      newGridState[index] = true;
    }
    setGridState(newGridState);
    setShips(shipsFilled);
  };

  const removeKeyLog = () => {
    if (handleKeyDownRef.current != null) {
      document.removeEventListener("keydown", handleKeyDownRef.current);
      handleKeyDownRef.current = null;
    }
    setHovering([]);
  };

  const handleKeyDown = (ev: any) => rotateSelection(ev);

  const mouseOverGrid = (e: any, index: number) => {
    if (gameState !== states.ship_selection || locked.current) return;
    const starting_coord = getRowCol(index);
    if (isVertical.current) verticalSelection(starting_coord, index);
    else horizontalSelection(starting_coord, index);
  };

  const handleBoardHover = (e: any) => {
    if (gameState !== states.ship_selection) return;
    if (handleKeyDownRef.current == null) {
      // document.addEventListener("keydown", handleKeyDown);
      handleKeyDownRef.current = (ev: any) => rotateSelection(ev);
      document.addEventListener("keydown", handleKeyDownRef.current);
    }
  };

  const verticalSelection = (
    starting_coord: any,
    grid_square_index: number
  ) => {
    let indexs = [];
    for (let i = 0; i < shipSizes[shipIndex.current]; i++) {
      const index = getAsIndex({
        rowIndex: starting_coord.rowIndex + i,
        colIndex: starting_coord.colIndex,
      });
      const rowIndex = Math.floor(index / cols);
      const colIndex = index % cols;
      if (rowIndex > 9) {
        let nIndex = getAsIndex({
          rowIndex: rowIndex - shipSizes[shipIndex.current],
          colIndex: colIndex,
        });
        indexs.push(nIndex);
      } else {
        indexs.push(index);
      }
    }
    setHovering([...indexs]);
  };

  const horizontalSelection = (
    starting_coord: any,
    grid_square_index: number
  ) => {
    let indexs = [];
    for (let i = 0; i < shipSizes[shipIndex.current]; i++) {
      const index = i + grid_square_index;
      const rowIndex = Math.floor(index / cols);
      const colIndex = index % cols;
      const test = index - starting_coord.colIndex;
      if (rowIndex != starting_coord.rowIndex) {
        let nIndex = index - shipSizes[shipIndex.current];
        indexs.push(nIndex);
      } else {
        indexs.push(index);
      }
    }

    setHovering([...indexs]);
  };

  const gridHoverColour = (index: number) => {
    const indexAt = hovering.findIndex((h) => h == index);
    if (indexAt !== -1) {
      for (let i = 0; i < ships.length; i++) {
        for (let j = 0; j < hovering.length; j++) {
          if (ships[i].includes(hovering[j]) && indexAt >= j) {
            return "grid-cell-area-selected-deny";
          }
        }
      }

      return "grid-cell-area-selected";
    } else return "";
  };

  const rotateSelection = (e: any) => {
    if (locked.current) return;
    if (e.key == "r") {
      isVertical.current = !isVertical.current;
    }
    if (e.key == "e") {
      setShips((prevShips) => {
        const shipsCopy = [...prevShips];
        const selectedShip = [...shipsCopy[shipIndex.current]];

        // Nullify the ship
        shipsCopy[shipIndex.current] = [];

        setGridState((oldGridState) => {
          return oldGridState.map((value, index) => {
            return selectedShip.includes(index) ? false : value;
          });
        });

        return shipsCopy;
      });
    }
  };

  const handleBoardLeave = (e: any) => {
    if (gameState !== states.ship_selection) return;
    removeKeyLog();
  };

  const handleCellClick = (index: number) => {
    const newGridState = [...gridState];
    const rowIndex = Math.floor(index / cols);
    const colIndex = index % cols;
    // if we aren't the enemy and we are in ship selection mode
    if (!enemy && gameState == states.ship_selection) {
      const shipsFilled = [...ships];

      if (ships[shipIndex.current].length == shipSizes[shipIndex.current]) {
        alert[1]({
          title: "Error",
          body: "You've placed this ship, press e to clear it",
          type: "error",
        });
        return;
      }

      for (let i = 0; i < ships.length; i++) {
        if (i == shipIndex.current) continue;
        for (let j = 0; j < hovering.length; j++) {
          if (ships[i].includes(hovering[j])) {
            alert[1]({
              title: "Error",
              body: "Ships cannot be inside one another",
              type: "error",
            });
            return;
          }
        }
      }

      shipsFilled[shipIndex.current] = hovering;

      setShips(shipsFilled);
      for (const index of hovering) {
        newGridState[index] = true;
      }
      setGridState(newGridState);
    }
    if (enemy && gameState == states.running) {
      // check if its our turn
      if (
        contextValue?.socket.id !=
        boardState.players[boardState.data.currentPlayer]
      ) {
        return;
      }

      if (newGridState[index]) {
        return;
      }

      // do attack
      newGridState[index] = !newGridState[index];
      setGridState(newGridState);

      contextValue?.socket.emit(
        "attempt_hit",
        {
          sender: contextValue.socket.id,
          game_room: gameRoom,
          coordinate_to_hit: {
            coordinate_index: index, // 1d index
            coord: { row: rowIndex, col: colIndex }, // 2d coord
          },
        },
        (response: packet) => {}
      );
    }
  };

  const lockShips = () => {
    let shipsFilled = ships.filter(
      (shipArr, i) => shipSizes[i] == shipArr.length
    );

    if (shipsFilled.length == 5) {
      locked.current = true;
      setHovering([]);
      // send a socket emit
      contextValue?.socket.emit(
        "update_ship_placement",
        {
          ship_positions: ships,
          board: gridState,
          hit_board: Array(rows * cols).fill(false),
        },
        gameRoom,
        contextValue.socket.id,
        (response: packet) => {}
      );
    } else {
      alert[1]({
        title: "Error",
        body: `You have ${shipsFilled.length}/${ships.length} ships on your board`,
        type: "error",
      });
    }
  };

  useEffect(() => {
    if (gameState !== states.ship_selection) {
      removeKeyLog();
      setHovering([]);
    }
  }, [gameState]);

  return (
    <div className="grid-board-container">
      <table className="grid-board">
        <thead>
          <tr>
            <th></th>
            {Array.from({ length: cols }).map((_, colIndex) => (
              <th
                style={{ fontFamily: "Source Code Pro", fontWeight: "normal" }}
                key={colIndex}
              >
                {String.fromCharCode(65 + colIndex)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody
          onMouseEnter={(e) => handleBoardHover(e)}
          onMouseLeave={(e) => handleBoardLeave(e)}
        >
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <tr key={rowIndex}>
              <th
                style={{ fontFamily: "Source Code Pro", fontWeight: "normal" }}
              >
                {rowIndex + 1}
              </th>
              {Array.from({ length: cols }).map((_, colIndex) => {
                const index = rowIndex * cols + colIndex;
                return (
                  <td
                    tabIndex={index}
                    onMouseMove={(e) => mouseOverGrid(e, index)}
                    key={index}
                    className={`
                          grid-cell ${gridHoverColour(index)} ${cellColour(
                      index
                    )} `}
                    onClick={() => handleCellClick(index)}
                  >
                    {gridState[index] ? "" : ""}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan={cols + 1} className="footer-cell">
              <div
                style={{
                  display: "flex",
                  height: "15vh",
                  gap: "15px",
                  flexDirection: "column",
                  justifyContent: "flex-start",
                }}
              >
                {gameState == states.ship_selection && !enemy ? (
                  <div style={{ display: "flex", gap: "12px" }}>
                    {/* this really should be programmically generated */}
                    {ships.map((ship, i) => (
                      <Button
                        key={"ship" + i}
                        onClick={() => (shipIndex.current = i)}
                        className={`button-clean ${
                          ship.length == shipSizes[i] ? "disabled" : ""
                        }`}
                        style={
                          shipIndex.current == i
                            ? { backgroundColor: "#6dd2df" }
                            : {}
                        }
                      >
                        {shipNames[i]}
                      </Button>
                    ))}
                  </div>
                ) : (
                  <></>
                )}
                {player}
                {enemy ? (
                  <div></div>
                ) : (
                  <div
                    style={{
                      display: "flex",
                      gap: "16px",
                      flexDirection: "column",
                    }}
                  >
                    {gameState == states.ship_selection ? (
                      <div
                        style={{
                          display: "flex",
                          gap: "15px",
                          justifyContent: "space-between",
                        }}
                      >
                        <p>Lock in your ship selection</p>
                        <Button
                          onClick={() => {
                            if (
                              gameState == states.ship_selection &&
                              !locked.current
                            ) {
                              lockShips();
                            }
                          }}
                          className={`button-clean ${
                            gameState == states.ship_selection
                              ? locked.current
                                ? "disabled"
                                : ""
                              : "disabled"
                          }`}
                          style={{ width: "35%" }}
                        >
                          <LockIcon></LockIcon>
                        </Button>
                      </div>
                    ) : (
                      <></>
                    )}
                    {/* <div
                      style={{
                        display: "flex",
                        gap: "15px",
                        justifyContent: "space-between",
                      }}
                    >
                      <p>If you dont want to manually select ships</p>
                      <Button
                        onClick={() => {
                          if (gameState == states.ship_selection)
                            randomisePlacement();
                        }}
                        className={`button-clean ${
                          gameState == states.ship_selection ? "" : "disabled"
                        }`}
                        style={{}}
                      >
                        Randomise Ships
                      </Button>
                    </div> */}
                    {gameState != states.not_running ? (
                      <Button
                        onClick={() => {
                          contextValue?.socket.emit(
                            "forfeit",
                            contextValue.socket.id,
                            gameRoom
                          );
                        }}
                        className="button-danger"
                        style={{}}
                      >
                        Forfeit
                      </Button>
                    ) : (
                      <></>
                    )}
                  </div>
                )}
              </div>
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
