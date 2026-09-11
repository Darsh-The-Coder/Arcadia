import { getApps, initializeApp } from "firebase/app";
import {
  connectAuthEmulator,
  getAuth,
  onAuthStateChanged,
  signInAnonymously,
  type User,
} from "firebase/auth";
import {
  collection,
  connectFirestoreEmulator,
  doc,
  getDocs,
  initializeFirestore,
  limit,
  onSnapshot,
  orderBy,
  persistentLocalCache,
  persistentMultipleTabManager,
  query,
  runTransaction,
  serverTimestamp,
  setDoc,
  where,
  writeBatch,
  type Firestore,
} from "firebase/firestore";
import { findGame } from "./catalog";

const emulator =
  (import.meta.env.DEV || import.meta.env.MODE === "test") &&
  import.meta.env["VITE_FRIENDS_EMULATOR"] === "true";
const config = emulator
  ? { apiKey: "demo-key", projectId: "demo-arcadia", appId: "demo-app", authDomain: "localhost" }
  : {
      apiKey: import.meta.env["VITE_FIREBASE_API_KEY"],
      authDomain: import.meta.env["VITE_FIREBASE_AUTH_DOMAIN"],
      projectId: import.meta.env["VITE_FIREBASE_PROJECT_ID"],
      appId: import.meta.env["VITE_FIREBASE_APP_ID"],
    };
export const configured = [config.apiKey, config.projectId, config.appId].every(
  (v) => v && !/your[_-]/i.test(v),
);
let db: Firestore;
function database() {
  if (!db) {
    const app =
      getApps().find((a) => a.name === "arcadia-friends") ||
      initializeApp(config, "arcadia-friends");
    db = initializeFirestore(app, {
      localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
    });
    if (emulator) {
      connectFirestoreEmulator(db, "127.0.0.1", 8088);
      connectAuthEmulator(getAuth(app), "http://127.0.0.1:9098", { disableWarnings: true });
    }
  }
  return db;
}
export type Entry = { id: string; [key: string]: any };
export function watchIdentity(onUser: (user: User) => void, onError: (error: Error) => void) {
  const auth = getAuth(database().app);
  let signingIn = false;
  const reconnect = () => {
    if (auth.currentUser || signingIn) return;
    signingIn = true;
    void signInAnonymously(auth)
      .catch(onError)
      .finally(() => {
        signingIn = false;
      });
  };
  window.addEventListener("online", reconnect);
  const stop = onAuthStateChanged(
    auth,
    (user) => {
      if (user) {
        onUser(user);
        let name = "Friend";
        try {
          name =
            localStorage.getItem("smritisetu.name") ||
            localStorage.getItem("smriti-display-name") ||
            name;
        } catch {
          /* private storage */
        }
        void setDoc(
          doc(db, "socialProfiles", user.uid),
          { name: name.slice(0, 40), code: user.uid.slice(0, 10).toUpperCase() },
          { merge: true },
        ).catch(onError);
      } else reconnect();
    },
    onError,
  );
  return () => {
    stop();
    window.removeEventListener("online", reconnect);
  };
}
export function watchLinks(
  uid: string,
  callback: (rows: Entry[], cached: boolean) => void,
  error: (e: Error) => void,
) {
  return onSnapshot(
    query(collection(database(), "socialLinks"), where("members", "array-contains", uid)),
    { includeMetadataChanges: true },
    (snapshot) =>
      callback(
        snapshot.docs.map((d) => ({ ...d.data(), id: d.id })),
        snapshot.metadata.fromCache,
      ),
    error,
  );
}
export function watchProfile(
  uid: string,
  callback: (name: string) => void,
  error: (e: Error) => void,
) {
  return onSnapshot(
    doc(database(), "socialProfiles", uid),
    (snap) => callback(snap.data()?.["name"] || "Friend"),
    error,
  );
}
export async function inviteFriend(uid: string, code: string) {
  if (!navigator.onLine)
    throw new Error("Reconnect to look up a new friend. Your existing chats still work offline.");
  const matches = await getDocs(
    query(
      collection(database(), "socialProfiles"),
      where("code", "==", code.trim().toUpperCase()),
      limit(2),
    ),
  );
  if (matches.size !== 1) throw new Error("Please check the invite code with your friend.");
  const other = matches.docs[0]!.id;
  if (other === uid) throw new Error("That is your own code. Enter your friend’s code.");
  const members = [uid, other].sort();
  const ref = doc(db, "socialLinks", members.join("_"));
  await runTransaction(db, async (tx) => {
    const existing = await tx.get(ref);
    if (existing.exists())
      throw new Error(
        existing.data()["status"] === "accepted"
          ? "You are already friends."
          : "An invitation already exists. Check incoming invitations.",
      );
    tx.set(ref, { members, invitedBy: uid, status: "pending", createdAt: serverTimestamp() });
  });
}
export function respondToInvite(link: Entry, accept: boolean) {
  return setDoc(
    doc(database(), "socialLinks", link.id),
    { status: accept ? "accepted" : "declined" },
    { merge: true },
  );
}
export function watchMessages(
  linkId: string,
  callback: (rows: Entry[]) => void,
  error: (e: Error) => void,
) {
  return onSnapshot(
    query(
      collection(database(), "socialLinks", linkId, "messages"),
      orderBy("createdAt", "desc"),
      limit(100),
    ),
    { includeMetadataChanges: true },
    (snapshot) =>
      callback(
        snapshot.docs
          .map((d) => ({ ...d.data(), id: d.id, pending: d.metadata.hasPendingWrites }))
          .reverse(),
      ),
    error,
  );
}
export function sendMessage(linkId: string, uid: string, text: string) {
  return setDoc(doc(collection(database(), "socialLinks", linkId, "messages")), {
    senderId: uid,
    text: text.trim().slice(0, 2000),
    createdAt: serverTimestamp(),
  });
}
export async function createRoom(link: Entry, uid: string, gameId: string) {
  if (!findGame(gameId)) throw new Error("Please choose a game.");
  const room = doc(collection(database(), "socialRooms"));
  const batch = writeBatch(db);
  batch.set(room, {
    gameId,
    members: link["members"],
    linkId: link.id,
    createdBy: uid,
    createdAt: serverTimestamp(),
  });
  batch.set(doc(collection(db, "socialLinks", link.id, "messages")), {
    senderId: uid,
    text: `Let’s play ${findGame(gameId)!.title}`,
    roomId: room.id,
    createdAt: serverTimestamp(),
  });
  // Room and invitation become visible together, including in the offline cache.
  const saved = batch.commit();
  return { id: room.id, saved };
}
export function watchRoom(
  id: string,
  callback: (room: Entry | null, cached: boolean) => void,
  error: (e: Error) => void,
) {
  return onSnapshot(
    doc(database(), "socialRooms", id),
    { includeMetadataChanges: true },
    (snap) =>
      callback(snap.exists() ? { ...snap.data(), id: snap.id } : null, snap.metadata.fromCache),
    error,
  );
}
export function watchProgress(
  id: string,
  callback: (rows: Entry[], cached: boolean) => void,
  error: (e: Error) => void,
) {
  return onSnapshot(
    collection(database(), "socialRooms", id, "progress"),
    { includeMetadataChanges: true },
    (snap) =>
      callback(
        snap.docs.map((d) => ({ ...d.data(), id: d.id, pending: d.metadata.hasPendingWrites })),
        snap.metadata.fromCache,
      ),
    error,
  );
}
export function saveProgress(
  roomId: string,
  uid: string,
  state: Record<string, unknown>,
  summary: string,
) {
  return setDoc(doc(database(), "socialRooms", roomId, "progress", uid), {
    state: JSON.stringify(state),
    summary: summary.slice(0, 120),
    updatedAt: serverTimestamp(),
  });
}
