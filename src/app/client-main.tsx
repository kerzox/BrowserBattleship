"use client";
import { Card } from "@/components/card";
import { Loading } from "@/components/loading";
import {
  ClientManagerProvider,
  useClientManager,
} from "@/context/client-manager";
import { useSession } from "@/hook/useSession";
import { useSocket } from "@/hook/useSocket";
import { authClient, signIn } from "@/lib/auth-client";
import { cx } from "@/lib/util";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { GameBoard } from "./game-board";
import { MainMenu } from "./main-menu";

export const ClientHome = () => {
  return (
    <ClientManagerProvider>
      <HomeContextConsumer />
    </ClientManagerProvider>
  );
};

const HomeContextConsumer = () => {
  const { session, isPending } = useSession();
  const { gameState, isPaused } = useClientManager();
  const data = useSocket({ session });

  return (
    <AnimatePresence mode='wait'>
      {isPending && (
        <motion.div
          key='loading'
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className='flex h-screen w-screen items-center justify-center '
        >
          <Loading {...data} />
        </motion.div>
      )}

      {(!isPending && gameState === "game") ||
        (gameState === "ship-placement" && (
          <motion.div
            key='game'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <GameBoard {...data} />
          </motion.div>
        ))}

      {!isPending && gameState === "main-menu" && (
        <motion.div
          key='main-menu'
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <MainMenu {...data} />
        </motion.div>
      )}
    </AnimatePresence>
  );
};
