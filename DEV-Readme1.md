Dag 1, Tirsdag 17.02.2026:
Version update – Core v1 • v0.1.0
✅ Funksjoner lagt til

Splash screen ved oppstart (logo + “Designed by Morning Coffee Labs”).

Life Picker første gang: valg mellom Privat og Jobb, samt “Kjøp Premium” (placeholder).

To-panel navigasjon (Album ↔ Capture):

Sveip høyre fra Album → Capture

Sveip venstre fra Capture → Album

I tillegg alltid tilgjengelige knapper via BottomNav.

Transparent TopBar overlay:

Viser aktivt liv

Filter-knapp (placeholder)

Settings (hamburger) som åpner slide-in drawer.

Toast hints for panelsveip (“Visste du…”) de første ~10 gangene.

Offline lagring (enkelt):

Demo-lagring fra Capture lagrer et “husk’et” lokalt og vises i Album.

Sortering: nyeste først (createdAt).

🧱 Hvordan det er bygd (kort for oss)

Vite + React + TypeScript.

Zustand for global UI-state (src/state/uiStore.ts) i tråd med kontrakten:

activeLifeId, panel, viewer, albumFilters, settingsOpen, panelHintCount.

Data-lagring i første omgang via localStorage (src/data/husketRepo.ts) for stabilitet og enkelhet i Core skeleton.

Repo-laget er isolert slik at vi kan bytte til IDB/blob senere uten å endre UI-kontrakten.

GitHub Pages deploy via Actions:

VITE_BASE="/<repo>/" settes i workflow for riktig routing på Pages.

👤 Hvordan en fremtidig bruker forholder seg til dette

Appen viser først en kort oppstart.

Brukeren velger Privat eller Jobb for å starte.

Brukeren navigerer mellom Album og Capture ved å:

enten sveipe (Album → høyre, Capture → venstre),

eller bruke knappene i bunnmenyen.

Brukeren kan (foreløpig) lagre et demo-husk’et og se det dukke opp i Album.

“Premium” og “Filter” finnes som knapper, men er ikke aktive funksjoner ennå.

Version update – v0.1.1 (CI fix)
✅ Funksjoner lagt til

Ingen app-funksjoner. Kun bygg/deploy-fix.

🧱 Hvordan det er bygd (kort for oss)

GitHub Actions workflow er endret til å ikke kreve lockfile:

fjernet cache: npm

byttet npm ci → npm install

👤 Hvordan en fremtidig bruker forholder seg til dette

Ingen synlig endring i appen. Appen blir bare faktisk publisert uten build-feil.

Version update – v0.1.2 (GitHub Pages whitescreen fix)
✅ Funksjoner lagt til

Ingen nye app-funksjoner. Kun deploy/asset-fix.

🧱 Hvordan det er bygd (kort for oss)

Vite bygges nå med base: "./" slik at alle bundla asset-paths blir relative.

Workflow trenger ikke lenger å injisere VITE_BASE.

👤 Hvordan en fremtidig bruker forholder seg til dette

Ingen synlig endring – appen bare laster faktisk på GitHub Pages uten whitescreen.

Version update – v0.1.3 (Deploy config check)
✅ Funksjoner lagt til

Ingen app-funksjoner. Kun verifisering av deploy-kilde.

🧱 Hvordan det er bygd (kort for oss)

GitHub Pages må publisere fra Actions artifact (dist/), ikke repo-root.

👤 Hvordan en fremtidig bruker forholder seg til dette

Ingen synlig endring – appen bare laster.
