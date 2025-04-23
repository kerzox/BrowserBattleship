/* eslint-disable @typescript-eslint/no-explicit-any */
import { RealtimeChannel } from "@supabase/supabase-js";
import { supabase } from "./superbase-client";

interface EventOperation {
  event: string;
  callback: (data: any) => void;
}

export const connectChannel = async ({
  channel,
  events,
}: {
  channel: string;
  events: EventOperation[];
}) => {
  const connection: RealtimeChannel = supabase.channel(channel);
  events.forEach((event: EventOperation) => {
    connection
      .on("broadcast", { event: event.event }, (payload) => {
        event.callback(payload);
      })
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          console.log(
            `Subscribed to channel: ${channel}, event: ${event.event}`
          );
        }
      });
  });
  return connection;
};
