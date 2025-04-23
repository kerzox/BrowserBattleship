/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { supabase } from "@/database/superbase-client";
import { TClientUser } from "@/types/types";
import { RealtimeChannel } from "@supabase/supabase-js";

import { useEffect, useState } from "react";

// using superbase realtime, but this can be made generic to use any websocket

export const CHANNEL_KEYS = {
  MAIN: "main",
};

export interface TSocketData {
  players: TClientUser[];
  client: TClientUser | undefined;
  setClient: (client: TClientUser) => void;
  setPlayers: (players: TClientUser[]) => void;
}

export const useSocket = ({ session }: { session?: any }) => {
  const [client, setClient] = useState<TClientUser | undefined>();
  const [players, setPlayers] = useState<TClientUser[]>([]);

  const untrackPresence = async (channel: RealtimeChannel) => {
    const presenceUntrackStatus = await channel.untrack();
    console.log(presenceUntrackStatus);
  };

  useEffect(() => {
    // this will connect to the main channel

    setClient(session?.user as TClientUser);

    if (!session) return;

    const channel = supabase.channel(CHANNEL_KEYS.MAIN);
    channel
      .on("presence", { event: "sync" }, () => {
        const newState = channel.presenceState();
        setPlayers(
          Object.values(newState).map((presence) => {
            const state = presence[0] as any;
            return state.user as TClientUser;
          })
        );
      })
      .on("presence", { event: "join" }, ({ key, newPresences }) => {
        console.log("join", key, newPresences);
      })
      .on("presence", { event: "leave" }, ({ key, leftPresences }) => {
        console.log("leave", key, leftPresences);
      })
      .on("broadcast", { event: "*" }, (payload) => {
        console.log("message", payload);
      })
      .subscribe(async (status) => {
        if (status !== "SUBSCRIBED") return;
        await channel.track({
          user: {
            id: session.user.id,
            name: session.user.name,
            isAnonymous: session.user.isAnonymous,
            image: session.user.image,
            isVerified: session.user.emailVerifed,
          } as TClientUser,
          online_at: new Date().toISOString(),
        });
      });

    return () => {
      untrackPresence(channel);
    };
  }, [session]);

  return {
    players,
    client,
    setClient,
    setPlayers,
  } as TSocketData;
};
