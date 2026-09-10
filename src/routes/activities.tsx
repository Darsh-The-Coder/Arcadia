import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Gamepad2, ArrowLeft, ArrowRight } from "lucide-react";

const GAME_LIST = [
  { id: "g-2.1", title: "Memory Match", blurb: "Match pairs of traditional cultural artifacts" },
  { id: "g-2.2", title: "Tune With Me", blurb: "Explore nature sounds and traditional melodies" },
  { id: "g-2.3", title: "Festival Puzzle", blurb: "Assemble vibrant cultural celebration scenes" },
  { id: "g-2.4", title: "Handloom Weaving", blurb: "Create symmetrical geometric patterns" },
  { id: "g-2.5", title: "Bamboo Rhythm", blurb: "Follow the acoustic beat patterns" },
];

function GameListPage() {
  const navigate = useNavigate();

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col px-5 py-12">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Games Collection
        </h1>
        <p className="mt-2 text-base text-muted-foreground">
          Select a game below to start playing.
        </p>
      </header>

      <div className="grid gap-4">
        {GAME_LIST.map((game) => (
          <button
            key={game.id}
            type="button"
            onClick={() => {
              if (game.id === "g-2.2") {
                window.location.href = "/play2";
              } else {
                // Handle other game routes if applicable
                alert(`Launching ${game.title}...`);
              }
            }}
            className="group relative flex items-center gap-4 overflow-hidden rounded-3xl border border-border bg-card p-6 text-left shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-lift"
          >
            <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-sky/20 text-sky-foreground shadow-soft transition-transform duration-300 group-hover:scale-105">
              <Gamepad2 className="size-7" strokeWidth={1.8} />
            </span>
            <span className="flex-1">
              <span className="flex items-center gap-2">
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{game.id}</span>
                <span className="text-xl font-bold tracking-tight">{game.title}</span>
              </span>
              <span className="block text-sm text-muted-foreground mt-1">{game.blurb}</span>
            </span>
            <span className="flex size-10 items-center justify-center rounded-full bg-secondary transition-transform duration-300 group-hover:translate-x-1">
              <ArrowRight className="size-5" />
            </span>
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={() => void navigate({ to: "/activities" })}
        className="mt-8 flex items-center gap-2 self-start text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> Back to Activities
      </button>
    </main>
  );
}

export const Route = createFileRoute("/activities")({
  component: GameListPage,
});