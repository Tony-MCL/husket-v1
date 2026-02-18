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

Version update – Core v1 • v0.1.2
✅ Funksjoner lagt til

Tomt album → automatisk til Capture etter valg av liv.

Filter-panel med:

“Vis kun favoritter” (fungerer)

“Filtrer” og “Tøm valg”

Papirkurv tilgjengelig fra:

Album (knapp nede venstre)

Settings (egen knapp)

Inneholder foreløpig: liste + gjenopprett + “Tøm papirkurv” (med confirm)

🧱 Hvordan det er bygd (kort for oss)

Global UI-state utvidet med trashOpen (fortsatt liten og global).

Filter-panel bruker “draft state” lokalt i App.tsx og skriver først til uiStore.albumFilters ved “Filtrer”.

Tomt-album redirect gjøres i App.tsx (kontrakt 9.1), basert på listByLife(...).

👤 Hvordan en fremtidig bruker forholder seg til dette

Velger liv → hvis det ikke finnes husk’eter enda, tas brukeren rett til Capture.

Kan åpne filter fra toppen og velge “kun favoritter”.

Kan åpne papirkurv fra Album/Settings for å gjenopprette eller tømme.

Version update – Core v1 • v0.1.3
✅ Funksjoner lagt til

Viewer (light) åpnes ved trykk på husk’et i Album.

Favoritt kan toggles fra Viewer (lagres lokalt).

Slett fra Viewer flytter husk’et til Papirkurv (med bekreftelse).

🧱 Hvordan det er bygd (kort for oss)

ViewerModal.tsx leser husk’et via getById, og gjør mutasjoner via repo-funksjoner:

toggleFavorite(id)

softDelete(id)

Viewer-open/close styres av global uiStore.viewer.

Panel-swipe deaktiveres når modal (viewer/trash/filter) er åpen, for å unngå “dobbel gest”.

👤 Hvordan en fremtidig bruker forholder seg til dette

Trykker på et bilde i Album for å åpne Viewer.

Kan markere som favoritt eller slette (til papirkurv) direkte derfra.

Lukker Viewer når ferdig.

Version update – Core v1 • v0.1.4
✅ Funksjoner lagt til

Viewer er nå en bunke med kort (deck), der du kan bla ved å:

sveipe toppkortet (høyre = nyere/forrige, venstre = eldre/neste)

bruke piler på kortet (knapp-navigasjon uten swipe)

Trykk på bildet i kortet åpner fullskjerm-visning.

Favoritt og slett (til papirkurv) fungerer fortsatt – nå på “toppkortet” i bunken.

🧱 Hvordan det er bygd (kort for oss)

Framer Motion brukes for drag + spring animasjon.

HusketSwipeDeck håndterer swipe-terskel, “kast ut”, og underkort-visual (kun mens man drar).

ViewerDeckModal bruker samme item-liste som albumet (aktivt liv + aktive filtre).

👤 Hvordan en fremtidig bruker forholder seg til dette

Trykker på et husk’et i albumet → åpner viewer-bunken på riktig kort.

Sveiper for å bla i resten av bunken.

Kan favoritt-markere, slette til papirkurv eller åpne bilde i fullskjerm.

Version update – Core v1 • v0.1.5 (Viewer fix)
✅ Funksjoner lagt til

Ingen nye funksjoner – kun en viktig UI-fix.

🧱 Hvordan det er bygd (kort for oss)

ViewerDeckModal bruker nå egen container i stedet for modalBox, slik at vi unngår CSS som kan gjøre boksen fullskjerm og “usynlig”.

👤 Hvordan en fremtidig bruker forholder seg til dette

Viewer åpner alltid med synlige kort og en tydelig “Lukk”-knapp, så man aldri blir “låst” bak et tomt overlay.

Version update – Core v1 • v0.1.5
✅ Funksjoner lagt til

Capture lager nå ekte husk’eter (offline) og lagrer dem lokalt.

Viewer-bunken får dermed faktiske kort å vise og swipe gjennom.

🧱 Hvordan det er bygd (kort for oss)

CaptureScreen oppretter Husket med id, lifeId, createdAt, imageDataUrl og optional comment.

Lagring skjer via upsert() i husketRepo (localStorage).

👤 Hvordan en fremtidig bruker forholder seg til dette

Bruker kan lagre et husk’et og se det dukke opp i albumet, og åpne det i viewer.

Version update – Core v1 • v0.1.7
✅ Endring

Fullskjerm-visning i Viewer lukkes nå tilbake til kort-bunken, ikke Album.

🧱 Hvordan det er bygd (kort)

Fullscreen-overlay stopper click-bubbling (stopPropagation) slik at klikk ikke når viewer-modalen sin overlay-lukking.

Version update – Core v1 • v0.1.8
✅ Endringer

Viewer viser ikke lenger “Ingen kort å vise” uten refresh (deck-listen oppdateres når viewer/panel endres).

Fullscreen lukker nå tilbake til kortstokken og kan ikke “tap-through” til album.

👤 Brukeropplevelse

Åpne thumbnail → viewer-bunke åpner stabilt.

Åpne fullscreen → lukk med ✕ → tilbake til samme kort i bunken.

✅ Endring

App bygger igjen: ViewerState håndteres korrekt (union), og vi bruker viewer.id kun når viewer er åpen.

👤 Brukeropplevelse

Uendret visuelt – men viewer-decken skal ikke “kollapse” pga typefeil.

Version update – Core v1 • v0.1.10
✅ Endring

ViewerState håndteres korrekt (bruker husketId)

Ingen type-casting

Build skal nå være grønn

Version update – Core v1 • v0.1.11
✅ Endring

Fullscreen-lukking på mobil gir ikke lenger “multi-treff” (hamburger / viewer-lukk / osv).

🧱 Hvordan det er bygd (kort)

Ved fullscreen close aktiveres et transparent tap-shield i ~250ms som sluker pointer/click events og hindrer ghost click.

👤 Brukeropplevelse

Trykk ✕ i fullscreen → tilbake til kortstokk, uten at settings åpner eller viewer lukkes.

Version update – Core v1 • v0.1.12
✅ Endring

Fullscreen kan ikke lenger “trykke gjennom” til TopBar/Settings eller viewer-overlay på mobil.

Fullscreen ligger nå garantert over alt (maks z-index).

Ved lukking monteres en kort global capture-blocker som svelger spøkelsesklikk.

📦 Version update – Core v1 • v0.1.13
🔧 Fix

Fjernet ubrukt @ts-expect-error i global event-blocker

TypeScript build grønn

Ingen endring i funksjonalitet
