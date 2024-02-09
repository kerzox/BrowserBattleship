import { createRequestHandler } from "@remix-run/express";
import express from "express";
import { Server } from "socket.io";
import http from "http";
import { socketEvents } from "./socketServer.js";

// notice that the result of `remix build` is "just a module"
import * as build from "../build/index.js";
import exp from "constants";
import { run } from "@remix-run/dev/dist/cli/run.js";
import { getNewMatchesForLinks } from "@remix-run/react/dist/links.js";
import { join } from "path";

const app = express();
const server = http.createServer(app);
const socket_io = new Server(server, {
  cors: {
    // change this for better cors
    origin: "*",
  },
});

const PORT = 3000;

app.use(express.static("public"));

// and your app is "just a request handler"
app.all("*", createRequestHandler({ build }));

socketEvents(socket_io);

server.listen(PORT, () => {
  console.log(`App listening on ${PORT}`);
});
