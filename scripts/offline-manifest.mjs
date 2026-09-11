import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
const roots = ["dist/client", "dist", ".output/public"].filter((dir) =>
  fs.existsSync(path.join(dir, "assets")),
);
if (!roots.length) throw new Error("Cannot find built client assets for offline games");
for (const root of roots) {
  const assets = fs
    .readdirSync(path.join(root, "assets"), { recursive: true })
    .filter((file) => /\.(js|css|png|jpe?g|gif|svg|webp|woff2?)$/.test(file))
    .map((file) => "/assets/" + file.replaceAll("\\", "/"));
  const rooms = fs
    .readdirSync(root)
    .filter((file) => /^room-game.*\.png$/.test(file))
    .map((file) => "/" + file);
  const manifest = JSON.stringify([
    ...assets,
    ...rooms,
    "/play",
    "/friends",
    "/friend-room",
    "/solo",
    "/solo?game=memory",
    "/solo?game=puzzle",
    "/solo?game=restore",
    "/flip",
    "/play2",
    "/play4",
    "/play5",
    "/play6",
  ]);
  fs.writeFileSync(path.join(root, "friends-offline-manifest.json"), manifest);
  const version = createHash("sha256").update(manifest).digest("hex").slice(0, 12);
  const worker = fs
    .readFileSync("public/friends-offline-sw.js", "utf8")
    .replace("arcadia-games-v1", `arcadia-games-${version}`);
  fs.writeFileSync(path.join(root, "friends-offline-sw.js"), worker);
}
