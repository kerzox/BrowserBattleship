import type { MetaFunction } from "@remix-run/node";
import Board from "~/components/board";
import { useContext, useEffect, useState } from "react";
import Input from "~/components/input";
import Button from "~/components/button";
import { wsContext } from "~/context/connectionContext";
import { event_packet, packet } from "~/util/responses";
import Alert from "~/components/alert";
export const meta: MetaFunction = () => {
  return [
    { title: "Battleship" },
    { name: "description", content: "Battleship game using remix!" },
  ];
};

const containerStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "center",
  height: "100%",
};

const columnStyle: React.CSSProperties = {
  flexGrow: 1,
  padding: "25px",
  border: "1px solid #ccc",
  boxSizing: "border-box",
  overflow: "auto",
};

const headerStyle: React.CSSProperties = {
  display: "block",
  minHeight: "20vh",
  paddingLeft: "25px",
  overflow: "auto",
};

export const states = {
  not_running: "not_running",
  ship_selection: "ship_selection",
  running: "running",
  game_over: "game_over",
};

export default function Index() {
  const contextValue = useContext(wsContext);
  const [playerIdData, fillPlayerIdData] = useState({
    id: "",
  });
  const [gameState, setGameState] = useState(states.not_running);
  const [boardState, setBoardState] = useState<any>({});
  const [gameRoom, setGameRoom] = useState<object>({});
  const [message, setMessage] = useState<any>(undefined);
  const [alertData, setAlertData] = useState<any>(undefined);
  const [users, setUsers] = useState([]);
  const [columns, setColumns] = useState<any>([[], []]);
  const [userData, setUserData] = useState<any>({});
  const [usernameData, setUsernameData] = useState("");

  function reset() {
    contextValue?.socket.emit("leave_rooms");
    fillPlayerIdData({ id: "" });
    setGameState(states.not_running);
    setBoardState({});
    setGameRoom({});
    setMessage(undefined);
  }

  function changeUsername() {
    contextValue?.socket.emit(
      "change_username",
      {
        sender: contextValue?.socket.id,
        username: usernameData,
      },
      (response: packet) => {
        if (response.status == 400) {
          setAlertData({
            title: "Error",
            body: response.message,
            type: "error",
          });
        }
        getUsername();
      }
    );
  }

  function getUsername() {
    contextValue?.socket.emit("get_user_data", (response: packet) => {
      if (response.status == 200) {
        setUserData(response.message);
      }
    });
  }

  function test() {
    let user = contextValue?.socket;
    contextValue?.socket.emit(
      "join_room",
      {
        sender: user?.id,
        game_room: playerIdData,
      },
      (response: packet) => {
        if (response.status != 200) {
          setAlertData({
            title: "Error",
            body: response.message,
            type: "error",
          });
        }
      }
    );
  }

  function joinPlayer(user: String) {
    let userSocket = contextValue?.socket;
    contextValue?.socket.emit(
      "ask_to_join_room",
      {
        sender: userSocket?.id,
        game_room: user,
      },
      (response: packet) => {
        if (response.status != 200) {
          setAlertData({
            title: "Error",
            body: response.message,
            type: "error",
          });
        }
      }
    );
  }

  function randomJoin() {
    let user = contextValue?.socket;
    contextValue?.socket.emit(
      "join_room_randomly",
      {
        sender: user?.id,
      },
      (response: packet) => {
        if (response.status != 200) {
          setAlertData({
            title: "Error",
            body: response.message,
            type: "error",
          });
        }
      }
    );
  }

  function isGameRunning() {
    return gameState == states.running || gameState == states.ship_selection;
  }

  useEffect(() => {
    if (contextValue?.game_room != "") {
      getUsername();

      contextValue?.socket.on(
        "request_to_join",
        ({ id, username }, callback) => {
          setAlertData({
            title: "Game request",
            body: `${
              username != undefined ? username : id
            } is requesting to play a game`,
            type: "default",
            function: {
              accept: () => {
                callback(200);
              },
              deny: () => {
                callback(401);
              },
            },
          });
        }
      );

      contextValue?.socket.emit("grab_users", (response: packet) => {
        if (response.status == 200) {
          setUsers(response.data);
        }
      });

      contextValue?.socket.on("on_user_update", (event: event_packet) => {
        setUsers(event.data);
      });

      contextValue?.socket.on("game_event", (event: event_packet) => {
        let playerIndex = 0;
        let temp: any = event.data;
        switch (event.type) {
          case "update_board_state":
            setBoardState(event.data);
            playerIndex = temp.players.findIndex(
              (player: string | undefined) => player === contextValue?.socket.id
            );
            if (temp.data.currentPlayer === playerIndex) {
              setMessage(
                <p
                  className="instruction-text slide-in-flash"
                  style={{ padding: "12px" }}
                >
                  You're up! Click on the other board to target their ships.
                </p>
              );
            } else {
              setMessage(<></>);
            }
            break;
          case "new_game":
            setMessage(
              <div
                className="slide-in"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0px",
                }}
              >
                <p style={{ textDecoration: "underline" }}>Ship selection.</p>
                <p>
                  Hovering over the grid will show possible placements for each
                  ship
                </p>
                <p>Ships can only be along one axis they can not be diagonal</p>
                <p>
                  Pressing <em style={{ fontWeight: "bold" }}>R</em> will rotate
                  your selection
                </p>
                <p>
                  Pressing <em style={{ fontWeight: "bold" }}>E</em> will undo
                  the currently selected ship
                </p>
              </div>
            );
            setGameState(states.ship_selection);
            setGameRoom(event.data);
            break;
          case "start_game":
            setGameState(states.running);
            setBoardState(event.data);
            playerIndex = temp.players.findIndex(
              (player: string | undefined) => player === contextValue?.socket.id
            );
            if (temp.data.currentPlayer === playerIndex) {
              setMessage(
                <p
                  className="instruction-text slide-in-flash"
                  style={{ padding: "12px" }}
                >
                  You're up! Click on the other board to target their ships.
                </p>
              );
            } else {
              setMessage(<></>);
            }

            break;
          case "running":
            break;
          case "game_over":
            setGameState(states.game_over);
            if (contextValue.socket.id == String(event.data)) {
              setAlertData({
                title: "Congratulations!",
                body: "You won the game",
                type: "success",
              });
            } else {
              setAlertData({
                title: "Better luck next time",
                body: "You lost the game",
                type: "default",
              });
            }
            // window.location.href = window.location.href;
            reset();
            break;
          case "disconnection":
            setGameState(states.not_running);
            // window.location.href = window.location.href;
            reset();
            break;
          case "forfeit":
            if (contextValue.socket.id == String(event.data)) {
              setAlertData({
                title: "Forfeit",
                body: "You have forfeited the game",
                type: "default",
              });
            } else {
              setAlertData({
                title: "Forfeit",
                body: "Your opponent has forfeited the game",
                type: "default",
              });
            }
            reset();
            break;
          default:
            setGameState(states.not_running);
            window.location.href = window.location.href;
            break;
        }
      });
    }
  }, [contextValue]);

  useEffect(() => {
    const cols: any[][] = [[], []];
    users
      .filter((user: any) => user.id !== contextValue?.socket.id)
      .map((user: any, i) => {
        if (i % 2 == 0) {
          cols[0].push(
            <Button
              onClick={() => joinPlayer(user.id)}
              className="button-clean"
              key={user.id}
              style={{}}
            >
              {user.username}
            </Button>
          );
        } else {
          cols[1].push(
            <Button
              onClick={() => joinPlayer(user.id)}
              className="button-clean"
              key={user.id}
              style={{}}
            >
              {user.username}
            </Button>
          );
        }
      });

    setColumns(cols);
  }, [users]);

  return (
    <div className="main-wrapper">
      <div className="board-wrapper">
        <Alert alert={alertData} />
        <div style={columnStyle}>
          {/* player board */}
          <div
            style={{
              width: "100%",
              height: "100%",
              margin: 0,
              display: "flex",
              flexDirection: "column",
              gap: "25px",
            }}
          >
            <div style={headerStyle}>{message}</div>
            <Board
              gameRoom={gameRoom}
              player={"This is you"}
              gameState={gameState}
              enemy={false}
              boardState={boardState}
              alert={[alertData, setAlertData]}
            />
          </div>
        </div>
        <div style={columnStyle}>
          {/* other board */}
          {isGameRunning() ? (
            <div
              style={{
                width: "100%",
                height: "100%",
                margin: 0,
                display: "flex",
                flexDirection: "column",
                gap: "25px",
              }}
            >
              <div style={headerStyle}></div>
              <Board
                gameRoom={gameRoom}
                player={"The other players board"}
                gameState={gameState}
                enemy={true}
                boardState={boardState}
                alert={[alertData, setAlertData]}
              />
            </div>
          ) : (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "100%",
              }}
            >
              <div style={headerStyle}></div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "24px",
                  padding: "24px",
                  width: "50%",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    gap: "16px",
                    justifyContent: "space-between",
                  }}
                >
                  <span>
                    You can set a username:
                    {userData.username === undefined
                      ? ""
                      : " " + userData.username}
                  </span>
                </div>
                <div style={{ display: "flex", gap: "16px" }}>
                  <Input
                    placeholder={`${
                      userData.username === undefined
                        ? "username..."
                        : userData.username
                    }`}
                    className="bg-light input-default"
                    style={{ width: "100%", flex: 2 }}
                    onChange={setUsernameData}
                  ></Input>
                  <Button
                    onClick={changeUsername}
                    className="button-clean"
                    style={{ flex: 1, width: "100%" }}
                  >
                    Change
                  </Button>
                </div>
                <span>Your game code: {contextValue?.game_room}</span>
                <span>Send it to another player to join your room</span>
                <span>Enter a game code here</span>
                <div style={{ display: "flex", gap: "16px" }}>
                  <Input
                    placeholder="game code"
                    className="bg-light input-default"
                    style={{ width: "100%", flex: 2 }}
                    onChange={(text: any) => {
                      fillPlayerIdData(text);
                    }}
                  ></Input>
                  <Button
                    onClick={test}
                    className="button-clean"
                    style={{ flex: 1, width: "100%" }}
                  >
                    Send
                  </Button>
                </div>
                <span>All currently online players: {users.length}</span>
                <div
                  style={{
                    display: "flex",
                    border: "1px solid black",
                    padding: "12px",
                    overflow: "auto",
                    gap: "5px",
                    rowGap: "5px",
                    justifyContent: "flex-start",
                  }}
                >
                  <div
                    style={{
                      width: "100%",
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    {columns[0]}
                  </div>
                  <div
                    style={{
                      width: "100%",
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    {columns[1]}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <footer></footer>
    </div>
  );
}
