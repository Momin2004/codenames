import { Board } from "@/components/board/Board";

export default function GameOverview() {
  return (
    <div>
      <h1>Game</h1>
      <Board height={5} width={5} />
    </div>
  );
}