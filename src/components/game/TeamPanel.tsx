import { Stack } from "@mui/material";
import { PlayerListCard } from "./panels/PlayerListCard";
import { CardsLeftDisplay } from "./panels/CardsLeftDisplay";
import { Doc, Id } from "../../../convex/_generated/dataModel";
import { CardColor } from "@/types/CardColor";
import { Team } from "../lobby/states/GameState";

export function TeamPanel({
  team,
  operativePlayers,
  spymasterPlayers,
  cardsLeft,
  playerId
}: {
  team: Team;
  operativePlayers: Doc<"player">[];
  spymasterPlayers: Doc<"player">[];
  playerId: Id<"player">
  cardsLeft: number | string;
}) {
  const color = team === "blue" ? CardColor.Blue : CardColor.Red;

  return (
    <Stack marginTop={5} gap={3}>
      <PlayerListCard title={`Operative`} players={operativePlayers} color={color} playerId={playerId} />

      <CardsLeftDisplay team={team} count={cardsLeft} />

      <PlayerListCard title={`Spymaster`} players={spymasterPlayers} color={color} playerId={playerId} />
    </Stack >
  );
}