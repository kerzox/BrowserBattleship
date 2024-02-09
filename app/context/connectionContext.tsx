import { createContext } from "react";
import { Socket } from "socket.io-client";
import { DefaultEventsMap } from "node_modules/socket.io/dist/typed-events";

export interface UserContext {
  socket: Socket<DefaultEventsMap, DefaultEventsMap>;
  game_room: String | undefined;
}

export let wsContext = createContext<UserContext | undefined>(undefined);
