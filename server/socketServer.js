import { createNewGame, checkHit } from "./battleship.js";
let users = [];
let running_games = [];
let inviteStack = [];

/**
 * Join room event
 * Client will emit this one entering a code to join another player
 * @sender the socket that is sending the request
 * @game_room the socket id they are trying to join as a room
 * @return the callback as a status message with http codes
 *
 */

function joinRoom(socket, socket_io, sender, game_room, callback) {
  console.log(`Attempting to join room ${game_room} as ${sender}`);

  if (sender == undefined || game_room == undefined) {
    callback({
      status: 400,
      message: "Invalid request",
    });
    return;
  }

  if (sender == game_room) {
    callback({
      status: 400,
      message: "You cannot connect to yourself",
    });
    return;
  }

  // check if the game_room is a valid id
  let room_to_connect = users.find((user) => user.socket.id == game_room);
  if (room_to_connect == undefined) {
    console.log("unable to find room");
    callback({
      status: 404,
      message: "Game room code is invalid",
    });
    return;
  }

  // check if the player is already in a game
  let has_game = running_games.some((game) => game.players.includes(socket.id));

  console.log(has_game);

  if (has_game) {
    console.log("is already playing a game");
    if (callback != undefined) {
      callback({
        status: 400,
        message: "Player is currently in game",
      });
    }
    return;
  }

  // start a new game of battleship will these two players

  running_games.push({
    players: [sender, game_room],
    game: true,
    data: createNewGame([sender, game_room]),
  });

  if (callback != undefined) {
    callback({
      status: 200,
      message: "Success",
    });
  }

  // join that players room
  socket.join(game_room);

  // emit to the room that we are playing
  socket_io.to(game_room).emit("game_event", {
    type: "new_game",
    data: game_room,
  });
  sendUserData(socket_io);
}

function joinRoomRandomly(socket, socket_io, sender, callback) {
  let randomUsers = users.filter((user) =>
    running_games.every((game) => !game.players.includes(user.socket.id))
  );
  console.log(running_games);
  let chosenUser = randomUsers.filter((user) => user.socket !== socket);

  if (chosenUser.length == 0) {
    callback({
      status: 404,
      message: "No available games found",
    });
    return;
  }

  joinRoom(socket, socket_io, sender, chosenUser[0].socket.id, callback);
}

function updateShipPlacement(
  socket,
  socket_io,
  { ship_positions, board, hit_board },
  sender,
  game_room,
  callback
) {
  let index = running_games.findIndex((game) =>
    game.players.includes(game_room)
  );
  console.log("UPDATING PALCEMNT");

  const game = { ...running_games[index] };
  console.log(game);

  const boards = [...game.data.boards];

  let player_index = game.players.findIndex((player) => player == sender);
  console.log(sender);

  boards[player_index] = [board, hit_board];

  console.log(boards[player_index]);
  game.data.boards = boards;
  running_games[index] = game;

  console.log(boards);
  callback({
    status: 200,
    message: "Updated ship placement",
  });

  console.log(game.data.boards[0].length, game.data.boards[1].length);

  if (game.data.boards[0].length >= 2 && game.data.boards[1].length >= 2) {
    // start a new game
    socket_io.to(game_room).emit("game_event", {
      type: "start_game",
      data: game,
    });
  }
}

function getAddress(socket) {
  return socket.handshake.address.replace(/[^\d.]/g, "");
}

function getUser(id) {
  let counter = 1;
  return users
    .filter((user) => user.socket.id == id)
    .map((user) => ({
      id: user.socket.id,
      username: user.username,
    }))[0];
}

function sendUserData(socket_io) {
  socket_io.emit("on_user_update", {
    data: users
      .filter(
        (u) => !running_games.some((game) => game.players.includes(u.socket.id))
      )
      .map((user) => ({
        id: user.socket.id,
        username: user.username,
      })),
  });
}

export function socketEvents(socket_io) {
  socket_io.on("connection", (socket) => {
    console.log("Socket connection made: ");

    // add socket (game room is the sockets id)

    users.push({
      //address: socket.handshake.address.replace(/[^\d.]/g, ""),
      socket: socket,
      game_room: socket.id,
      username: "unnamed player",
      username_changed: false,
    });

    sendUserData(socket_io);

    socket.emit("event", {
      type: "update_user",
      data: {
        game_room: socket.id,
      },
    });

    socket.on("change_username", ({ sender, username }, callback) => {
      let index = users.findIndex((user) => user.socket.id === sender);
      if (username === "" || username === undefined || username.length == 0) {
        callback({
          status: 400,
          message: "Username is invalid",
        });
        return;
      }
      if (username.length > 26) {
        callback({
          status: 400,
          message: `Username is too long can only be 26 characters: ${username.length}`,
        });
        return;
      }
      users[index].username = username;
      users[index].username_changed = true;
      sendUserData(socket_io);
      callback({
        status: 201,
        message: "Username changed",
      });
    });

    socket.on("get_user_data", (callback) => {
      let user = users.find((user) => user.socket.id === socket.id);
      callback({
        status: 200,
        message: {
          id: user.socket.id,
          username: user.username,
        },
      });
    });

    // socket_io.emit("on_user_update", {
    //   data: users.map((user) => user.socket.id),
    // });

    socket.on("forfeit", (sender, game_room) => {
      socket_io.to(game_room).emit("game_event", {
        type: "forfeit",
        data: sender,
      });
      const games = running_games.filter(
        (game) => !game.players.includes(sender)
      );
      running_games = games;
      sendUserData(socket_io);
    });

    socket.on("leave_rooms", () => {
      console.log(socket.rooms);
      socket.rooms.forEach((room) => socket.leave(room));
      socket.join(socket.id);
      console.log(socket.rooms);
    });

    socket.on("grab_users", (callback) => {
      if (users.length < 0) {
        callback({
          status: 501,
          message: "Huh?",
        });
      }

      const userIds = users.map;

      callback({
        status: 200,
        message: "Client information recieved",
        data: users
          .filter(
            (u) =>
              !running_games.some((game) => game.players.includes(u.socket.id))
          )
          .map((user) => ({
            id: user.socket.id,
            username: user.username,
          })),
      });
    });

    socket.on("ask_to_join_room", ({ sender, game_room }, callback) => {
      const asked_already = inviteStack.some(
        (invite) => invite.requester == sender && invite.receiver == game_room
      );

      if (asked_already) {
        callback({
          status: 401,
          message: "You have already asked to join",
        });
        return;
      }

      const index_of_message =
        inviteStack.push({
          requester: sender,
          receiver: game_room,
        }) - 1;

      const user = getUser(sender);
      console.log(asked_already, index_of_message, inviteStack);

      console.log(sender, game_room, socket.id);

      socket
        .to(game_room)
        .timeout(5000)
        .emit("request_to_join", user, (err, response) => {
          inviteStack.splice(index_of_message, 1);
          if (err) {
            console.log("User failed to response in time");
          } else {
            if (response == 200)
              joinRoom(socket, socket_io, sender, game_room, undefined);
          }
        });

      callback({
        status: 200,
        message: "Request sent successfully",
      });
    });

    socket.on("join_room", ({ sender, game_room }, callback) =>
      joinRoom(socket, socket_io, sender, game_room, callback)
    );

    socket.on("join_room_randomly", ({ sender }, callback) =>
      joinRoomRandomly(socket, socket_io, sender, callback)
    );

    socket.on("update_ship_placement", (ships, game_room, sender, callback) => {
      updateShipPlacement(
        socket,
        socket_io,
        ships,
        sender,
        game_room,
        callback
      );
    });

    // socket.on("update_ship_placement", (ships, game_room, callback) =>
    //   updateShipPlacement(socket, socket_io, ships, game_room, callback)
    // );

    socket.on(
      "attempt_hit",
      ({ sender, game_room, coordinate_to_hit }, callback) => {
        if (
          checkHit(
            socket,
            socket_io,
            running_games,
            sender,
            game_room,
            coordinate_to_hit,
            callback
          ) == "game_over"
        ) {
          console.log("Game over from hit");
          const games = running_games.filter(
            (game) => !game.players.includes(sender)
          );
          running_games = games;
          sendUserData(socket_io);
        }
      }
    );

    socket.on("disconnect", () => {
      users = users.filter((user) => user.socket !== socket);
      let running_game = running_games.find((game) =>
        game.players.includes(socket.id)
      );

      if (running_game != undefined) {
        socket_io.to(running_game.players[1]).emit("game_event", {
          type: "disconnection",
        });
      }

      running_games = running_games.filter(
        (game) => !game.players.includes(socket.id)
      );
      console.log("users left. ", users.length);
      sendUserData(socket_io);
    });

    console.log(users.length, running_games);
  });
}
