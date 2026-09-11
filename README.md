# APP NAME : SmritiSetu
# TEAM NAME : Arcadia

## Overview

SmritiSetu is a compassionate digital platform incorporating AI-based cognitive gaming and memory assistance for elderly dementia patients in the Northeast Region (NER). The project focuses on bridging memory gaps for aging loved ones, offering cognitive games, memory timelines, and an intuitive caregiver dashboard to ensure safety and connection.

## Key Features

* **Caregiver Dashboard:** Real-time online status monitoring, activity tracking, and instant alerts to keep family members and caregivers informed.
* **Memory & Family Section:** Dedicated spaces to view loved ones, share memories, and bridge gaps using familiar milestones and stories.
* **Engaging Activities & Games:** Gentle, cognitive-boosting interactive games (such as "Let's Explore") designed to provide low-stress, enjoyable mental stimulation.
* **Emergency Support:** Quick-access "I need help" and SOS tools built directly into the interface for immediate peace of mind.

## Getting Started

### Prerequisites

Ensure you have a package manager installed (such as `npm`, `pnpm`, or `yarn`).

## 🛠️ Local Setup Instructions

1. Clone the repository.
2. Copy the example env file: `cp .env.example .env`
3. Open the new `.env` file and add your own API keys.
4. Run `npm install` and `npm run dev`.

## Friends integration (`duplicate`)

Activities → Play with Friends now opens invitations, chat, and game invitations.
The Games Collection contains the five existing Arcadia games and Smriti Setu's
North-East Memory, Picture Jigsaw, and Restore the Room. Every game supports solo
play and a two-person session. Existing game screens, home, family, and caregiver
features are preserved.

Multiplayer is a friendly parallel session: each player has their own board and
can see the other's progress. It does not require synchronized turns or declare
a fastest winner while a player is offline. Each player can continue through a
disconnect without overwriting their friend's board. Chat and per-player progress
use Firestore's persistent queue and synchronize on reconnection. Sending a new
friend request requires a connection to look up the invite code. Messages show
“Waiting to sync” until acknowledged; “Synced” is not a read receipt.

### Connect your Firebase project

1. Copy the `VITE_FIREBASE_*` web configuration from your existing Smriti Setu
   `.env.local` into this checkout's ignored `.env.local`. Keep credentials out of Git.
2. Enable Firebase Authentication's Anonymous provider and create Firestore.
   The existing Arcadia display name is used. The anonymous account persists in
   this browser; clearing browser data creates a new identity and invite code.
3. Merge the **socialProfiles, socialLinks, and socialRooms** rules in
   `firestore.rules` with the project's currently deployed rules. Deploy that
   reviewed ruleset to your intended Firebase project. Do not overwrite newer
   live rules with an older local copy. This integration has not deployed rules.
4. Restart the development server, or rebuild with the same web configuration
   available in your hosting environment. Share each person's ten-character code,
   accept the invitation, and select a game in chat.

Social collections are separate from Arcadia's existing data. Old Smriti Setu
friendship records are not automatically migrated. No Firebase secrets, live data,
or project settings are changed by cloning or building this branch.

### Offline use

Solo boards and multiplayer boards are saved on the device. The production build
also generates an offline manifest and service worker for game routes and assets.
Open the app online once and let the assets download before using it fully
offline. Initial downloads and browser storage restrictions can prevent offline
reloads; the app must not be used as a guarantee of availability. Development
mode intentionally does not install a service worker. Chat and progress still
queue in development. Separate browser profiles or devices are needed to test
two users; two tabs in the same profile share one identity.

### Repeat the integration checks

Install dependencies with `npm ci`. Firebase emulators require Java 21 or newer.
`npm run test:friends:rules` tests invitation consent, chat access, room creation,
and protection of each player's progress, using the demo project only.

For the browser test, start these in separate terminals:

```sh
npx firebase emulators:start --only auth,firestore --project demo-arcadia --config firebase.test.json
npm run dev:friends:test
```

Run `tests/friends-browser.mjs` with `ARCADIA_TEST_URL=http://127.0.0.1:5173`.
The test uses installed Chrome by default (`BROWSER_CHANNEL` can select another
Playwright channel). It creates two test identities and verifies invitations,
chat, offline delivery without duplication, saved game recovery, game routes,
and mobile layout. `tests/friends-offline.mjs` checks service-worker behavior
against a running production build. `npm run build` builds the deployable app.

The old standalone caregiver `index.html` is preserved at
`legacy/caregiver-entry.html`; it must not be placed back at the repository root,
where Nitro would use it instead of TanStack Start's actual application. The
router now creates independent state for each server request.

Known pre-existing validation issue: repository-wide TypeScript checking is
blocked by unresolved merge markers in unused UI files and the legacy `App.jsx`.
A targeted check also reports the existing missing declaration for `SosPage.jsx`.
Those unrelated merge conflicts are outside this Friends integration.
