import { BoardDisplay } from "@/components/game/board/BoardDisplay";
import { Background } from "@/components/layout/Background";

export default function GameOverview() {
  return (
    <Background>
      <BoardDisplay />
    </Background>
  )
}