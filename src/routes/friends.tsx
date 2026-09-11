import { createFileRoute } from "@tanstack/react-router";
import { FriendsPage } from "@/features/friends/FriendsPage";
export const Route = createFileRoute("/friends")({
  validateSearch: (search: Record<string, unknown>) => ({
    ...(typeof search["game"] === "string" && search["game"] ? { game: search["game"] } : {}),
  }),
  component: FriendsRoute,
});
function FriendsRoute() {
  const { game = "" } = Route.useSearch();
  return <FriendsPage game={game} />;
}
