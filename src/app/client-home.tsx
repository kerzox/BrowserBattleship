"use client";
import { Card } from "@/components/card";

interface ClientHomeProps {
  currentUser: {
    name: string;
    rank: string;
    wins: number;
    losses: number;
    winRate: string;
  };
  availablePlayers: {
    id: number;
    name: string;
    rank: string;
    status: string;
  }[];
}

export const ClientHome = ({
  currentUser,
  availablePlayers,
}: ClientHomeProps) => {
  return (
    <div className='font-[var(--font-ibm)] min-h-screen bg-[#111111] text-white p-6 flex justify-center items-center flex-col'>
      <div className='mx-auto flex gap-8'>
        <Card>
          <div className='flex items-center gap-6 mb-8'>
            <div className='h-20 w-20 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center'>
              <span className='text-3xl font-bold'>
                {currentUser.name.charAt(0)}
              </span>
            </div>
            <div>
              <h2 className='text-2xl font-bold'>{currentUser.name}</h2>
              <p className='text-cyan-400'>{currentUser.rank}</p>
            </div>
          </div>

          <div className='space-y-6 mb-8'>
            <div className='bg-[#222222]  p-5 flex justify-between items-center'>
              <div>
                <p className='text-gray-500 text-sm'>Career Stats</p>
                <p className='text-xl font-medium mt-1'>
                  {currentUser.wins}W - {currentUser.losses}L
                </p>
              </div>
              <div className='h-16 w-16 rounded-full flex items-center justify-center bg-gradient-to-br from-emerald-500 to-emerald-400 font-bold'>
                {currentUser.winRate}
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
              <span>
                {availablePlayers.filter((p) => p.status === "Online").length}{" "}
                online
              </span>
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

          <div className='space-y-3 mb-6 h-[280px] overflow-auto pr-2 ml-1 scrollbar-thin'>
            {availablePlayers.map((player) => (
              <div
                key={player.id}
                className='flex items-center justify-between bg-[#222] hover:bg-[#2c2c2c] transition-all p-4'
              >
                <div className='flex items-center gap-3'>
                  <div className='h-10 w-10 rounded-lg bg-[#333] flex items-center justify-center'>
                    <span className='font-medium'>{player.name.charAt(0)}</span>
                  </div>
                  <div>
                    <h3 className='font-medium'>{player.name}</h3>
                    <p className='text-sm text-gray-500'>{player.rank}</p>
                  </div>
                </div>
                <div className='flex items-center gap-3'>
                  <span
                    className={`inline-block w-2 h-2 rounded-full ${
                      player.status === "Online"
                        ? "bg-emerald-500"
                        : "bg-amber-500"
                    }`}
                  ></span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};
