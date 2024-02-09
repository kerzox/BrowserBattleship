import { io } from "socket.io-client";

const SERVER_IP_ADDRESS = "http://localhost:3000";

export function connect() {
  return io(`${SERVER_IP_ADDRESS}`);
}
