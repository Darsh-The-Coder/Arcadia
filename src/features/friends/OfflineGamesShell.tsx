import { Link, useLocation } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { FRIEND_GAMES } from "./catalog";
import { GameSession } from "./game-session";
export function OfflineGamesShell({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const [ready, setReady] = useState(false);
  useEffect(() => {
    setReady(true);
    if (import.meta.env.PROD && "serviceWorker" in navigator)
      void navigator.serviceWorker.register("/friends-offline-sw.js").catch(() => {});
  }, []);
  const game = FRIEND_GAMES.find((item) => item.route === pathname);
  if (!game) return children;
  return (
    <>
      <div className="relative z-20 border-b bg-card px-5 py-3 flex flex-wrap items-center justify-between gap-3">
        <Link to="/play" className="underline">
          ← All games
        </Link>
        <Link
          to="/friends"
          search={{ game: game.id }}
          className="rounded-xl bg-primary px-4 py-3 text-primary-foreground font-semibold"
        >
          Play with Friends
        </Link>
      </div>
      {ready && (
        <GameSession key={pathname} scope={`solo:${game.id}`}>
          {children}
        </GameSession>
      )}
    </>
  );
}
