# Integration checkpoints

## Caregiver portal — ready for user review

Priya's `caregiver-and-my-day` portal is integrated at `/caregiver` on `main`.
Caregiver role selection opens that dashboard; patient selection keeps the
existing patient home. Original caregiver pages, editing dialogs, and local
care-data persistence are retained. Patient styles and game controls were not
changed in this checkpoint.

Validation: production build, targeted TypeScript check, and browser tests for
role separation, all dashboard destinations, reminder add/edit/pause/resume/
complete, contact persistence, profile editing, mobile width, and runtime errors.

The source uses sample care data and simulated device/safety status. Google Maps
requires its configured key. This checkpoint does not add a live care-data or
wearable backend. See `src/features/caregiver/README.md` for source attribution.

## Remaining stages — not complete

1. Fix speech typing against real microphone behaviour in both portals.
2. Restore the original visual Friends/chat/offline/online flow from
   `hardika-sketch/Smriti-Setu`, `feature/play-with-friends`. The earlier functional
   Friends integration is retained until this stage is reviewed.
3. Verify Bhashini approval and obtain the authorized credentials through the
   signed-in account. Add server-only secrets, connect translation and ASR in
   both portals, and verify the actual available Northeast language services.

Earlier unfinished language work is saved locally in the ignored
`.test-runtime/language-stage.patch` and `.test-runtime/language-checkpoint/`.
It is not part of this caregiver checkpoint or active in the app. Review it
before reuse rather than treating mocked tests as proof of real microphone or
live Bhashini functionality.

## Repeat checks

Run `npm run build`, then `npm run preview:local` and open
`http://127.0.0.1:5174`. With that preview running, run
`npm run test:caregiver:browser`. Run `npm run typecheck:caregiver` separately.
