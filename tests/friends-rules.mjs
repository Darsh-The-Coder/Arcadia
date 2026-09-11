import fs from "node:fs";
import {
  initializeTestEnvironment,
  assertFails,
  assertSucceeds,
} from "@firebase/rules-unit-testing";
import { doc, setDoc, getDoc, updateDoc, writeBatch } from "firebase/firestore";
const env = await initializeTestEnvironment({
  projectId: "demo-arcadia",
  firestore: { host: "127.0.0.1", port: 8088, rules: fs.readFileSync("firestore.rules", "utf8") },
});
try {
  await env.clearFirestore();
  const alice = env.authenticatedContext("alice12345").firestore();
  const bob = env.authenticatedContext("bob1234567").firestore();
  const stranger = env.authenticatedContext("stranger01").firestore();
  const linkId = "alice12345_bob1234567";
  const linkPath = `socialLinks/${linkId}`;
  await assertSucceeds(
    setDoc(doc(alice, "socialProfiles/alice12345"), { name: "Alice", code: "ALICE12345" }),
  );
  await assertFails(
    setDoc(doc(bob, "socialProfiles/alice12345"), { name: "Imposter", code: "ALICE12345" }),
  );
  await assertSucceeds(getDoc(doc(alice, linkPath)));
  await assertSucceeds(
    setDoc(doc(alice, linkPath), {
      members: ["alice12345", "bob1234567"],
      invitedBy: "alice12345",
      status: "pending",
      createdAt: new Date(),
    }),
  );
  await assertFails(updateDoc(doc(alice, linkPath), { status: "accepted" }));
  await assertFails(
    setDoc(doc(alice, `${linkPath}/messages/early`), {
      senderId: "alice12345",
      text: "Before consent",
      createdAt: new Date(),
    }),
  );
  await assertSucceeds(updateDoc(doc(bob, linkPath), { status: "accepted" }));
  await assertFails(updateDoc(doc(bob, linkPath), { members: ["bob1234567", "stranger01"] }));
  await assertSucceeds(
    setDoc(doc(alice, `${linkPath}/messages/hello`), {
      senderId: "alice12345",
      text: "Hello",
      createdAt: new Date(),
    }),
  );
  await assertSucceeds(getDoc(doc(bob, `${linkPath}/messages/hello`)));
  await assertFails(getDoc(doc(stranger, `${linkPath}/messages/hello`)));
  await assertFails(
    setDoc(doc(bob, `${linkPath}/messages/spoof`), {
      senderId: "alice12345",
      text: "Spoof",
      createdAt: new Date(),
    }),
  );
  const batch = writeBatch(alice);
  batch.set(doc(alice, "socialRooms/test-room"), {
    members: ["alice12345", "bob1234567"],
    linkId,
    gameId: "memory",
    createdBy: "alice12345",
    createdAt: new Date(),
  });
  batch.set(doc(alice, `${linkPath}/messages/invite`), {
    senderId: "alice12345",
    text: "Play",
    roomId: "test-room",
    createdAt: new Date(),
  });
  await assertSucceeds(batch.commit());
  await assertSucceeds(
    setDoc(doc(alice, "socialRooms/test-room/progress/alice12345"), {
      state: "{}",
      summary: "Level 1",
      updatedAt: new Date(),
    }),
  );
  await assertFails(
    setDoc(doc(bob, "socialRooms/test-room/progress/alice12345"), {
      state: "{}",
      summary: "Spoof",
      updatedAt: new Date(),
    }),
  );
  await assertFails(getDoc(doc(stranger, "socialRooms/test-room/progress/alice12345")));
  await assertFails(
    updateDoc(doc(alice, "socialRooms/test-room"), { members: ["alice12345", "stranger01"] }),
  );
  console.log(
    "PASS: profile ownership, invitation consent, chat isolation, atomic game invitations, and per-player progress protection",
  );
} finally {
  await env.cleanup();
}
