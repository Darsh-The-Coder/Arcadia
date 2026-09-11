# Caregiver portal source

Imported from `hardika-sketch/Smriti-Setu`, branch `caregiver-and-my-day`,
commit `92dc2ef616ee50f96dadf53eb57b0e1b0da11f2d` (PRIYAL).

The original dashboard, detail pages, editing dialogs, care-state logic, and
assets are retained. `navigation.tsx` maps its page links onto Arcadia's
`/caregiver?view=...` route. Source imports are namespaced to avoid the unfinished
legacy caregiver/UI files already in Arcadia. Original HSL variable references
are adapted to Arcadia's colour tokens; global patient styles are unchanged.

Caregiver selection redirects here; patient selection retains the existing
patient home. A client-side role preference is a navigation choice, not an
authentication or authorization boundary.

As in Priya's source, care data persists in browser localStorage with cross-tab
updates. Initial data is sample data; device status/sync and safety simulation
controls do not represent a connected wearable or server. Google Maps needs
the existing `VITE_GOOGLE_MAPS_API_KEY`. No live medical/device backend was added.
