const total = 2 + 3 + 3 + 4 + 5;

export function isValidGridCoordinate() {}

export function isShipSquare(index, board) {
  return board[index];
}

// export function checkHit(
//   socket,
//   socket_io,
//   running_games,
//   sender,
//   game_room,
//   { coordinate_index, coord },
//   callback
// ) {
//   console.log(game_room);

//   let game_index = running_games.findIndex((game) =>
//     game.players.includes(game_room)
//   );
//   const game = { ...running_games[game_index] };

//   let victim_index = game.players.findIndex((player) => player != sender);

//   const sender_boards = game.data.boards[game.data.currentPlayer];
//   const victim_boards = game.data.boards[victim_index];

//   // get the victims real board
//   let real_board = victim_boards[0];
//   const recorded_attack = [...game.data.boards[victim_index][1]];

//   if (!isShipSquare(coordinate_index, real_board)) {
//     // we didn't hit
//     recorded_attack[coordinate_index] = { type: "miss" };
//     game.data.currentPlayer = victim_index;
//     callback({
//       status: 400,
//       message: `You missed at ${coord}`,
//     });
//   } else {
//     recorded_attack[coordinate_index] = { type: "hit" };
//     callback({
//       status: 200,
//       message: `You hit at ${coord}`,
//     });
//   }

//   game.data.boards[victim_index][1] = recorded_attack;
//   console.log(game);

//   socket_io.to(game_room).emit("game_event", {
//     type: "update_board_state",
//     data: game,
//   });

//   running_games[game_index] = game;

//   console.log(running_games[game_index].data.boards[victim_index][1]);

//   let arr = running_games[game_index].data.boards[victim_index][1].filter(
//     (square) => square === Object(square) && square.type == "hit"
//   );

//   console.log(total);
//   console.log(arr.length);

//   if (arr.length == total) {
//     console.log("player wins");
//     endGame(socket, socket_io, sender, victim_index, game_room);
//   }
// }

export function checkHit(
  socket,
  socket_io,
  running_games,
  sender,
  game_room,
  { coordinate_index, coord },
  callback
) {
  console.log(sender, game_room);

  let game_index = running_games.findIndex((game) =>
    game.players.includes(game_room)
  );

  let testPlayer =
    running_games[game_index].players[
      running_games[game_index].data.currentPlayer
    ];

  console.log(testPlayer, sender, testPlayer == sender);

  console.log(running_games[game_index].data.currentPlayer);
  console.log(running_games[game_index]);

  let victim_index = running_games[game_index].players.findIndex(
    (player) => player !== sender
  );

  console.log(victim_index, victim_index == sender);

  const game = { ...running_games[game_index] };

  const recorded_attack = [...game.data.boards[victim_index][1]];

  if (!isShipSquare(coordinate_index, game.data.boards[victim_index][0])) {
    // we didn't hit
    recorded_attack[coordinate_index] = { type: "miss" };
    game.data.currentPlayer = victim_index;
    callback({
      status: 400,
      message: `You missed at ${coord.row}, ${coord.col}`,
    });
  } else {
    recorded_attack[coordinate_index] = { type: "hit" };
    callback({
      status: 200,
      message: `You hit at ${coord.row}, ${coord.col}`,
    });
  }

  game.data.boards[victim_index][1] = recorded_attack;
  console.log(game);

  socket_io.to(game_room).emit("game_event", {
    type: "update_board_state",
    data: game,
  });

  let arr = running_games[game_index].data.boards[victim_index][1].filter(
    (square) => square === Object(square) && square.type == "hit"
  );

  console.log(total);
  console.log(arr.length);

  if (arr.length == total) {
    console.log("player wins");
    endGame(socket, socket_io, sender, victim_index, game_room);
    return "game_over";
  }

  return "";
}

/**
 * This starts a new game between chosen players
 * @return the game instance
 */

export function createNewGame(players) {
  return {
    currentPlayer: 0, // player index (current player doing the moves)
    boards: [[], []], // two boards per player (actual board, and hits on opponents board)
  };
}

export function endGame(
  socket,
  socket_io,
  sender,
  victim_index,
  game_room,
  running_games
) {
  socket_io.to(game_room).emit("game_event", {
    type: "game_over",
    data: sender,
  });
}
