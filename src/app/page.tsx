import { Card } from "@/components/card";
import { ClientHome } from "./client-home";

export default function Home() {
  const currentUser = {
    name: "Admiral Smith",
    rank: "Captain",
    wins: 15,
    losses: 5,
    winRate: "75%",
  };

  const availablePlayers = [
    { id: 1, name: "CommanderBlue", rank: "Lieutenant", status: "Online" },
    { id: 2, name: "SeaDog99", rank: "Ensign", status: "Online" },
    { id: 3, name: "NavalTactician", rank: "Commander", status: "In Game" },
    { id: 4, name: "WaveRider", rank: "Captain", status: "Online" },
  ];

  return (
    <ClientHome currentUser={currentUser} availablePlayers={availablePlayers} />
  );
}
