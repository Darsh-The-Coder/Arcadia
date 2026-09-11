import { useEffect, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { FRIEND_GAMES, findGame } from "./catalog";
import { useFriendsIdentity } from "./identity";
import {
  configured,
  createRoom,
  inviteFriend,
  respondToInvite,
  sendMessage,
  watchLinks,
  watchMessages,
  watchProfile,
  type Entry,
} from "./service";

const button =
  "rounded-2xl bg-primary px-5 py-3 font-semibold text-primary-foreground disabled:opacity-50";
function FriendName({ uid }: { uid: string }) {
  const [name, setName] = useState("Friend");
  useEffect(() => watchProfile(uid, setName, () => setName("Friend")), [uid]);
  return <>{name}</>;
}
function Chat({ link, uid, game }: { link: Entry; uid: string; game: string }) {
  const [messages, setMessages] = useState<Entry[]>([]);
  const [draft, setDraft] = useState(() => {
    try {
      return localStorage.getItem(`arcadia.draft.${uid}.${link.id}`) || "";
    } catch {
      return "";
    }
  });
  const [error, setError] = useState("");
  const [gameId, setGameId] = useState(findGame(game)?.id || "memory");
  const navigate = useNavigate();
  useEffect(() => watchMessages(link.id, setMessages, (e) => setError(e.message)), [link.id]);
  useEffect(() => {
    try {
      localStorage.setItem(`arcadia.draft.${uid}.${link.id}`, draft);
    } catch {
      /* draft remains visible */
    }
  }, [draft, uid, link.id]);
  return (
    <section className="rounded-3xl border bg-card p-5 min-w-0">
      <h2 className="text-2xl font-bold">
        Chat with <FriendName uid={link["members"].find((id: string) => id !== uid)} />
      </h2>
      <div
        role="log"
        aria-label="Conversation"
        className="my-4 flex max-h-80 flex-col gap-3 overflow-y-auto"
      >
        {!messages.length && <p>Say hello, or invite your friend to a game.</p>}
        {messages.map((message) => (
          <div
            key={message.id}
            className={`rounded-2xl p-3 break-words ${message["senderId"] === uid ? "bg-secondary ml-6" : "bg-muted mr-6"}`}
          >
            <p>{message["text"]}</p>
            {message["roomId"] && (
              <Link
                to={"/friend-room" as never}
                search={{ room: message["roomId"] } as never}
                className="block py-2 font-bold underline"
              >
                Join game
              </Link>
            )}
            <small>{message["pending"] ? "Waiting to sync" : "Synced"}</small>
          </div>
        ))}
      </div>
      {error && (
        <p role="alert" className="my-3 text-destructive">
          {error}
        </p>
      )}
      <form
        className="flex gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          if (!draft.trim()) return;
          const text = draft;
          setDraft("");
          setError("");
          void sendMessage(link.id, uid, text).catch((e) => {
            setDraft((current) => current || text);
            setError(`Message could not be sent: ${e.message}`);
          });
        }}
      >
        <input
          aria-label="Message"
          maxLength={2000}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          className="min-w-0 flex-1 rounded-xl border p-3"
          placeholder="Write a message"
        />
        <button className={button} disabled={!draft.trim()}>
          Send
        </button>
      </form>
      <label className="mt-6 block font-semibold" htmlFor="friend-game">
        Play with this friend
      </label>
      <select
        id="friend-game"
        value={gameId}
        onChange={(e) => setGameId(e.target.value as typeof gameId)}
        className="my-3 w-full rounded-xl border p-3"
      >
        {FRIEND_GAMES.map((item) => (
          <option key={item.id} value={item.id}>
            {item.title}
          </option>
        ))}
      </select>
      <button
        className={button}
        onClick={() => {
          setError("");
          void createRoom(link, uid, gameId)
            .then(({ id, saved }) => {
              void saved.catch((e) => setError(`Game invitation could not sync: ${e.message}`));
              void navigate({ to: "/friend-room" as never, search: { room: id } as never });
            })
            .catch((e) => setError(e.message));
        }}
      >
        Invite to game
      </button>
    </section>
  );
}
export function FriendsPage({ game = "" }: { game?: string }) {
  const { user, online, error: identityError } = useFriendsIdentity();
  const [links, setLinks] = useState<Entry[]>([]);
  const [cached, setCached] = useState(true);
  const [code, setCode] = useState("");
  const [selected, setSelected] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    if (!user) return;
    return watchLinks(
      user.uid,
      (rows, cache) => {
        setLinks(rows);
        setCached(cache);
      },
      (e) => setNotice(e.message),
    );
  }, [user]);
  const friends = links.filter((row) => row["status"] === "accepted");
  const chat = friends.find((row) => row.id === selected) || friends[0];
  return (
    <main className="mx-auto max-w-5xl px-5 py-8">
      <Link to="/activities" className="underline">
        ← Activities
      </Link>
      <h1 className="mt-5 text-3xl font-bold">Play with Friends</h1>
      <p className="my-4 rounded-2xl bg-secondary p-4" role="status">
        {!configured
          ? "Friends is not connected yet. You can still play every game on your own."
          : !online
            ? "You’re offline. Messages and game progress stay here and sync when you reconnect."
            : cached
              ? "Connecting… Your saved chats and games are still available."
              : "Connected. Chats and game progress sync automatically."}
      </p>
      {(identityError || notice) && (
        <p role="status" className="my-3">
          {identityError || notice}
        </p>
      )}
      {user && (
        <div className="grid gap-5 md:grid-cols-[minmax(230px,1fr)_2fr]">
          <aside className="space-y-5">
            <section className="rounded-3xl border bg-card p-5">
              <h2 className="text-xl font-bold">Invite a Friend</h2>
              <p className="mt-3">Your invite code</p>
              <strong className="block select-all break-all text-2xl tracking-wider">
                {user.uid.slice(0, 10).toUpperCase()}
              </strong>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setBusy(true);
                  setNotice("");
                  void inviteFriend(user.uid, code)
                    .then(() => {
                      setCode("");
                      setNotice("Invitation sent. Your friend can accept it here.");
                    })
                    .catch((e) => setNotice(e.message))
                    .finally(() => setBusy(false));
                }}
              >
                <label htmlFor="invite-code" className="mt-4 block">
                  Your friend’s code
                </label>
                <input
                  id="invite-code"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  maxLength={10}
                  className="my-3 w-full rounded-xl border p-3 uppercase"
                />
                <button className={button} disabled={!online || busy || code.trim().length !== 10}>
                  {busy ? "Sending…" : "Send invitation"}
                </button>
              </form>
            </section>
            <section>
              <h2 className="text-xl font-bold">Invitations</h2>
              {!links.some((link) => link["status"] === "pending") && (
                <p className="mt-2">No pending invitations.</p>
              )}
              {links
                .filter((link) => link["status"] === "pending")
                .map((link) => (
                  <div key={link.id} className="my-3 rounded-2xl border p-4">
                    <FriendName uid={link["members"].find((id: string) => id !== user.uid)} />
                    {link["invitedBy"] === user.uid ? (
                      <p>Waiting for your friend</p>
                    ) : (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {[true, false].map((accept) => (
                          <button
                            key={String(accept)}
                            className={button}
                            onClick={() => {
                              void respondToInvite(link, accept).catch((e) => setNotice(e.message));
                            }}
                          >
                            {accept ? "Accept" : "Decline"}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
            </section>
            <section>
              <h2 className="text-xl font-bold">Chat with a Friend</h2>
              {!friends.length && <p className="mt-2">Accept an invitation to start chatting.</p>}
              {friends.map((link) => (
                <button
                  key={link.id}
                  aria-pressed={chat?.id === link.id}
                  onClick={() => setSelected(link.id)}
                  className="my-2 block w-full rounded-2xl border bg-card p-4 text-left aria-pressed:ring-2 aria-pressed:ring-primary"
                >
                  <FriendName uid={link["members"].find((id: string) => id !== user.uid)} />
                </button>
              ))}
            </section>
          </aside>
          {chat ? (
            <Chat key={chat.id} link={chat} uid={user.uid} game={game} />
          ) : (
            <section className="rounded-3xl bg-card p-6">
              <h2 className="text-2xl font-bold">Play together, at your own pace</h2>
              <p className="mt-3">
                Invite a friend, then choose a game in your chat. Each person has their own board,
                with shared progress.
              </p>
            </section>
          )}
        </div>
      )}
      <h2 className="mt-8 text-2xl font-bold">Games to play together</h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {FRIEND_GAMES.map((item) => (
          <article key={item.id} className="rounded-2xl border bg-card p-5">
            <h3 className="text-xl font-bold">{item.title}</h3>
            <p>{item.blurb}</p>
            <a href={item.route} className="mt-3 inline-block underline">
              Play offline / solo
            </a>
          </article>
        ))}
      </div>
    </main>
  );
}
