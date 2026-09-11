import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { useFriendsIdentity } from "@/features/friends/identity";
import {
  configured,
  saveProgress,
  watchProgress,
  watchRoom,
  type Entry,
} from "@/features/friends/service";
import { GameSession } from "@/features/friends/game-session";
import { GameView } from "@/features/friends/GameView";
import { findGame } from "@/features/friends/catalog";
export const Route = createFileRoute("/friend-room")({
  validateSearch: (search: Record<string, unknown>) => ({
    ...(typeof search["room"] === "string" && search["room"] ? { room: search["room"] } : {}),
  }),
  component: RoomRoute,
});
function RoomRoute() {
  const { room = "" } = Route.useSearch();
  return <Room key={room} id={room} />;
}
function Room({ id }: { id: string }) {
  const { user, online, error: authError } = useFriendsIdentity();
  const [room, setRoom] = useState<Entry | null>(null);
  const [progress, setProgress] = useState<Entry[]>([]);
  const [initial, setInitial] = useState<Record<string, unknown> | null>(null);
  const [cached, setCached] = useState(true);
  const [error, setError] = useState(id ? "" : "Open a game invitation from your chat to join.");
  useEffect(() => {
    if (!user || !id) return;
    return watchRoom(
      id,
      (value, cache) => {
        setRoom(value);
        setCached(cache);
        if (!value && !cache) setError("This game invitation no longer exists.");
      },
      (e) => setError(e.message),
    );
  }, [id, user]);
  useEffect(() => {
    if (!room || !user || !room["members"]?.includes(user.uid)) return;
    return watchProgress(
      id,
      (rows, cache) => {
        setProgress(rows);
        setInitial((previous) => {
          if (previous !== null) return previous;
          if (cache && online && !rows.some((row) => row.id === user.uid)) return null;
          try {
            return JSON.parse(rows.find((row) => row.id === user.uid)?.["state"] || "{}");
          } catch {
            return {};
          }
        });
      },
      (e) => setError(e.message),
    );
  }, [id, room?.id, user, online]);
  const save = useCallback(
    (state: Record<string, unknown>, summary: string) => {
      if (user)
        void saveProgress(id, user.uid, state, summary).catch((e) =>
          setError(`Progress is saved on this device but could not sync: ${e.message}`),
        );
    },
    [id, user],
  );
  const valid = room && user && room["members"]?.includes(user.uid) && findGame(room["gameId"]);
  return (
    <main>
      <header className="relative z-10 border-b bg-card p-5">
        <div className="mx-auto max-w-5xl">
          <Link to="/friends" search={{ game: "" }} className="underline">
            ← Friends and chat
          </Link>
          <h1 className="my-3 text-2xl font-bold">
            {valid ? findGame(room["gameId"])!.title : "Play with Friends"}
          </h1>
          <p role="status">
            {!configured
              ? "Friends is not connected yet."
              : !online
                ? "Offline — keep playing. Your progress will sync when you reconnect."
                : cached
                  ? "Reconnecting — your board stays saved."
                  : "Connected — play your own board and follow each other’s progress."}
          </p>
          {(error || authError) && (
            <p role="alert" className="mt-3 text-destructive">
              {error || authError}
            </p>
          )}
          <div className="mt-3 flex flex-wrap gap-3">
            {valid &&
              room["members"].map((uid: string) => {
                const row = progress.find((p) => p.id === uid);
                return (
                  <p key={uid} className="rounded-xl bg-secondary p-3">
                    <strong>{uid === user.uid ? "You" : "Your friend"}:</strong>{" "}
                    {row?.["summary"] || "Has not joined yet"}
                    {row?.["pending"] ? " · Waiting to sync" : ""}
                  </p>
                );
              })}
          </div>
        </div>
      </header>
      {valid && initial !== null ? (
        <GameSession
          key={`${id}:${user.uid}`}
          scope={`${id}:${user.uid}`}
          initial={initial}
          onSave={save}
        >
          <GameView gameId={room["gameId"]} />
        </GameSession>
      ) : (
        !error && configured && <p className="p-6">Loading your saved game…</p>
      )}
    </main>
  );
}
