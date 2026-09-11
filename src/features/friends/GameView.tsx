import { FlipGame } from "@/routes/flip";
import { Index as TuneGame } from "@/routes/play2";
import { Play4Container } from "@/routes/play4";
import { Play5Container } from "@/routes/play5";
import { LetsExploreGame } from "@/routes/play6";
// The original Smriti Setu games are JSX; preserve their gameplay and assets.

// @ts-expect-error Original JSX games have no TypeScript declarations.
import { NorthEastMemoryGame, PictureJigsawGame, RestoreRoomGame } from "./SmritiGames";
import "./games.css";
const noop = () => {};
export function GameView({ gameId }: { gameId: string }) {
  switch (gameId) {
    case "festivals":
      return <FlipGame />;
    case "tunes":
      return <TuneGame />;
    case "dots":
      return <Play4Container />;
    case "market":
      return <Play5Container />;
    case "explore":
      return <LetsExploreGame />;
    case "memory":
      return (
        <div className="smriti-game">
          <NorthEastMemoryGame mode="solo" onComplete={noop} />
        </div>
      );
    case "puzzle":
      return (
        <div className="smriti-game">
          <PictureJigsawGame mode="solo" onComplete={noop} />
        </div>
      );
    case "restore":
      return (
        <div className="smriti-game">
          <RestoreRoomGame mode="solo" onComplete={noop} />
        </div>
      );
    default:
      return <p>Please choose a game from Activities.</p>;
  }
}
