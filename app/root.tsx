import { cssBundleHref } from "@remix-run/css-bundle";
import type { LinksFunction } from "@remix-run/node";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";
import React, { useState, useEffect } from "react";
import { Socket } from "socket.io-client";
import { DefaultEventsMap } from "node_modules/socket.io/dist/typed-events";
import { connect } from "./socket";
import { UserContext, wsContext } from "./context/connectionContext";
import "./global.css";


export const links: LinksFunction = () => [
  ...(cssBundleHref ? [{ rel: "stylesheet", href: cssBundleHref }] : []),
];

export default function App() {
  let [ctx, setSocket] = useState<UserContext>();

  useEffect(() => {
    let connection = connect();
    setSocket({
      socket: connection,
      game_room: "",
    });
    return () => {
      connection.close();
    };
  }, []);

  useEffect(() => {
    if (!ctx) return;
    if (ctx.socket == undefined) return;
    let socketValue = ctx.socket;
    ctx.socket.on("event", (evt) => {
      if (evt.type == "update_user") {
        if ("game_room" in evt.data) {
          setSocket({
            socket: socketValue,
            game_room: evt.data.game_room,
          });
        }
      } else if (evt.type == "response") {
        alert(evt.data.status);
      }
    });
  }, [ctx]);

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link
          href="https://fonts.googleapis.com/css?family=Source Code Pro"
          rel="stylesheet"
        ></link>
        <Meta />
        <Links />
      </head>
      <body
        style={{
          height: "100vh",
          margin: 0,
          padding: 0,
          fontFamily: "Source Code Pro",
        }}
      >
        <wsContext.Provider value={ctx}>
          <Outlet />
        </wsContext.Provider>
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
