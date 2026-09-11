export const FRIEND_GAMES = [
  { id: "festivals", title: "Flip The Cards", route: "/flip", blurb: "Match Northeast festivals" },
  {
    id: "tunes",
    title: "Tune With Me",
    route: "/play2",
    blurb: "Listen and recognise nature sounds",
  },
  { id: "dots", title: "Connect The Dots", route: "/play4", blurb: "Complete familiar shapes" },
  { id: "market", title: "MarketPlace", route: "/play5", blurb: "Remember the dishes you saw" },
  { id: "explore", title: "Let's Explore!", route: "/play6", blurb: "Find the hidden pen" },
  {
    id: "memory",
    title: "North-East Memory",
    route: "/solo?game=memory",
    blurb: "Match tea, rhinos, drums and more",
  },
  {
    id: "puzzle",
    title: "Picture Jigsaw",
    route: "/solo?game=puzzle",
    blurb: "Put the room picture together",
  },
  {
    id: "restore",
    title: "Restore the Room",
    route: "/solo?game=restore",
    blurb: "Remember where objects belong",
  },
] as const;
export type GameId = (typeof FRIEND_GAMES)[number]["id"];
export function findGame(id: string) {
  return FRIEND_GAMES.find((game) => game.id === id);
}
