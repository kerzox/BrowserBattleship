"use client";
import { Card } from "@/components/card";
import { useClientManager } from "@/context/client-manager";
import databaseHelpers, { createGame } from "@/database/database-helpers";
import { TSocketData } from "@/hook/useSocket";
import { signIn } from "@/lib/auth-client";
import { cx } from "@/lib/util";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

export const MainMenu = ({ players, client }: TSocketData) => {
  const { gameState, setGameState, setCurrentGameId } = useClientManager();

  const [authMode, setAuthMode] = useState<"signin" | "signup" | null>(
    "signin"
  );

  const handleAnonymousLogin = async () => {
    const user = await signIn.anonymous();
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
  };

  return (
    <div className='font-[var(--font-ibm)] min-h-screen bg-[#111111] text-white p-6 flex justify-center items-center flex-col'>
      {client ? (
        <div className='mx-auto flex gap-8'>
          <Card>
            <div className='flex items-center gap-6 mb-8'>
              <div className='h-20 w-20 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center'>
                <span className='text-3xl font-bold'>
                  {client?.name.charAt(0)}
                </span>
              </div>
              <div>
                <h2 className='text-2xl font-bold'>{client?.name}</h2>
                <p className='text-cyan-400'>{client?.rank}</p>
              </div>
            </div>

            <div className='space-y-6 mb-8'>
              <div className='bg-[#222222]  p-5 flex justify-between items-center'>
                <div>
                  <p className='text-gray-500 text-sm'>Career Stats</p>
                  <p className='text-xl font-medium mt-1'>
                    {client?.wins}W - {client?.losses}L
                  </p>
                </div>
                <div className='h-16 w-16 rounded-full flex items-center justify-center bg-gradient-to-br from-emerald-500 to-emerald-400 font-bold'>
                  {client?.winRate}
                </div>
              </div>

              <div className='grid grid-cols-2 gap-4'>
                <button className='bg-[#222] hover:bg-[#2c2c2c] transition-all border border-[#333] p-4 text-left'>
                  <span className='text-gray-500 text-sm block'>Fleet</span>
                  <span className='text-lg font-medium'>Customize</span>
                </button>
                <button className='bg-[#222] hover:bg-[#2c2c2c] transition-all border border-[#333] p-4 text-left'>
                  <span className='text-gray-500 text-sm block'>History</span>
                  <span className='text-lg font-medium'>View Battles</span>
                </button>
              </div>
            </div>
          </Card>
          <Card className='w-5xl'>
            <div className='flex justify-between items-center mb-6'>
              <h2 className='text-2xl font-bold'>Online Players</h2>
              <div className='text-emerald-400 flex items-center gap-2'>
                <span className='inline-block w-2 h-2 bg-emerald-400 rounded-full animate-pulse'></span>
                <span>{players?.length} online</span>
              </div>
            </div>

            <div className='relative mb-6'>
              <input
                type='text'
                placeholder='Find opponent...'
                className='w-full bg-[#222222] border border-[#333]  px-5 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500'
              />
              <svg
                className='absolute right-4 top-3.5 w-5 h-5 text-gray-400'
                xmlns='http://www.w3.org/2000/svg'
                fill='none'
                viewBox='0 0 24 24'
                stroke='currentColor'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'
                />
              </svg>
            </div>

            <div className='space-y-3 mb-6 h-[280px] overflow-auto scrollbar-thin'>
              <AnimatePresence>
                {players
                  .filter((p) => p.id !== client.id)
                  .map((player) => (
                    <motion.button
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.5, ease: "easeInOut" }}
                      exit={{ opacity: 0, transition: { duration: 0.5 } }}
                      onClick={async () => {
                        const res = await createGame({
                          players: [client.id, player.id],
                        });

                        console.log(res);

                        if (res.error) {
                          console.error("Error creating game:", res.message);
                          return;
                        }

                        const gameState = res.data;
                        if (!gameState || !gameState.gameState) return;
                        console.log(gameState.id);
                        setGameState(gameState?.gameState);
                        setCurrentGameId(gameState?.id);
                      }}
                      key={player.id}
                      className='flex w-full items-center justify-between bg-[#222] hover:bg-[#2c2c2c] transition-all p-4'
                    >
                      <div className='flex items-center gap-3'>
                        <div className='h-10 w-10 rounded-lg bg-[#333] flex items-center justify-center'>
                          <span className='font-medium'>
                            {player.name.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <h3 className='font-medium'>{player.name}</h3>
                          <p className='text-sm text-gray-500'>{player.rank}</p>
                        </div>
                      </div>
                      <div className='flex items-center gap-3'>
                        <span
                          className={`inline-block w-2 h-2 rounded-full bg-emerald-500`}
                        ></span>
                      </div>
                    </motion.button>
                  ))}
              </AnimatePresence>
            </div>
          </Card>
        </div>
      ) : (
        <div className='mx-auto w-full max-w-4xl'>
          <Card className='p-0! transition-all'>
            <div className='flex flex-col md:flex-row'>
              <div className='flex-1 p-8'>
                <h1 className='text-3xl font-bold mb-6'>Browser Battleship</h1>
                <div className='mb-8'>
                  <div className='flex bg-[#141414] p-2 gap-2 text-sm'>
                    <button
                      className={cx(
                        "w-full bg-[#222] p-2 transition-all",
                        authMode === "signin"
                          ? "bg-[#333] opacity-100"
                          : "opacity-25"
                      )}
                      onClick={() => setAuthMode("signin")}
                    >
                      <span className={cx("transition-all")}>Sign In</span>
                    </button>
                    <button
                      className={cx(
                        "w-full bg-[#222] p-2 transition-all",
                        authMode === "signup"
                          ? "bg-[#333] opacity-100"
                          : "opacity-25"
                      )}
                      onClick={() => setAuthMode("signup")}
                    >
                      <span className={cx("transition-all")}>Sign Up</span>
                    </button>
                  </div>
                </div>

                <AnimatePresence mode='wait'>
                  {authMode === "signin" && (
                    <motion.form
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className='space-y-4'
                    >
                      <div>
                        <label className='text-sm text-gray-300 block mb-2'>
                          Username
                        </label>
                        <input
                          type='text'
                          className='w-full bg-[#222] border border-[#333]  px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-400'
                        />
                      </div>
                      <div>
                        <label className='text-sm text-gray-300 block mb-2'>
                          Password
                        </label>
                        <input
                          type='password'
                          className='w-full bg-[#222] border border-[#333]  px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-400'
                        />
                      </div>
                    </motion.form>
                  )}

                  {authMode === "signup" && (
                    <motion.form
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className='space-y-4'
                    >
                      <div>
                        <label className='text-sm text-gray-300 block mb-2'>
                          Username
                        </label>
                        <input
                          type='text'
                          className='w-full bg-[#222] border border-[#333]  px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-400'
                        />
                      </div>
                      <div>
                        <label className='text-sm text-gray-300 block mb-2'>
                          Email
                        </label>
                        <input
                          type='email'
                          className='w-full bg-[#222] border border-[#333]  px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-400'
                        />
                      </div>
                      <div>
                        <label className='text-sm text-gray-300 block mb-2'>
                          Password
                        </label>
                        <input
                          type='password'
                          className='w-full bg-[#222] border border-[#333]  px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-400'
                        />
                      </div>
                    </motion.form>
                  )}
                </AnimatePresence>

                <div className='mt-4 text-center'>
                  <span className='text-gray-500'>or</span>
                  <button
                    onClick={handleAnonymousLogin}
                    className='block w-full mt-3 py-3 px-4 border border-[#333]  text-gray-300 hover:bg-[#222] transition-all'
                  >
                    Play as Guest
                  </button>
                </div>
              </div>

              {/* Right side: Image/Banner */}
              <div className='flex-1 bg-gradient-to-br from-[#1a1a1a] to-[#333] relative hidden md:block'>
                <div className='absolute inset-0 p-8 flex flex-col justify-center'>
                  {/* show current players */}
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
