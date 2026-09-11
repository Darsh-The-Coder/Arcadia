import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { findGame } from "@/features/friends/catalog";
import { GameView } from "@/features/friends/GameView";
import { GameSession } from "@/features/friends/game-session";
export const Route = createFileRoute("/solo")({
  validateSearch: (search: Record<string, unknown>) => ({
    ...(typeof search["game"] === "string" && search["game"] ? { game: search["game"] } : {}),
  }),
  component: SoloRoute,
});
function SoloRoute() {
  const { game = "memory" } = Route.useSearch();
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  if (!findGame(game)) return <Link to="/play">Choose a game</Link>;
  return (
    <main className="mx-auto max-w-5xl px-4 py-6">
      <Link to="/play" className="underline">
        ← Games
      </Link>
      <h1 className="my-4 text-3xl font-bold">{findGame(game)!.title}</h1>
      <Link to="/friends" search={{ game }} className="underline">
        Play with Friends
      </Link>
      {ready && (
        <GameSession key={game} scope={`solo:${game}`}>
          <GameView gameId={game} />
        </GameSession>
      )}
    </main>
  );
}
