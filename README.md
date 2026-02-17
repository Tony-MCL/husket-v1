# husk’et – Core v1 (Offline)

Dette repoet er Core v1 av husk’et:
- 100% offline (ingen sky / deling i v1)
- Liv-basert (Privat/Jobb)
- To-panel navigasjon (Album <-> Capture) via swipe + knapper
- Bygget for GitHub Pages deploy via GitHub Actions

## Kom i gang (GitHub-only)

1. Lim inn filene i repoet ditt (samme struktur som i chatten).
2. Commit + push til `main`.
3. Gå til **Settings → Pages**:
   - Source: **GitHub Actions**
4. Etter første push:
   - Gå til **Actions** og se at “Deploy to GitHub Pages” kjører grønt.
   - Appen publiseres på: `https://<brukernavn>.github.io/<repo>/`

## Lokal utvikling (valgfritt)
Hvis du senere vil kjøre lokalt:
```bash
npm install
npm run dev
