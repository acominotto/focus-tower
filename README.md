# Focus Tower

[![CI](https://github.com/acominotto/focus-tower/actions/workflows/ci.yml/badge.svg)](https://github.com/acominotto/focus-tower/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

A monorepo for **Focus Tower** — block distractions with inspiring messages. The Chrome extension blocks websites; the mobile app blocks apps via Screen Time (iOS) and an accessibility shield (Android). Built with **TypeScript**, **Bun**, **Turborepo**, and **Expo**.

**Project page:** [acominotto.github.io/focus-tower](https://acominotto.github.io/focus-tower/)

**Chrome Web Store:** [Focus Tower](https://chromewebstore.google.com/detail/focus-tower/fpmdfmbpnkomoboldifmpfmccgmglkoh)

**Author:** [adrien.cominotto@gmail.com](mailto:adrien.cominotto@gmail.com)

## Monorepo layout

```
focus-guard/
├── apps/
│   ├── chrome/          # Chrome MV3 extension
│   └── mobile/          # Expo dev-client app (iOS + Android)
├── packages/
│   ├── core/            # Shared block logic, i18n, quotes
│   └── native-screen-time/  # Screen Time + Android shield native module
├── turbo.json
└── docs/
```

## Features

### Chrome extension

- **Default block list** — common distractions (Facebook, Reddit, YouTube, etc.) on first install
- **Custom block list** — add or remove domains from the popup
- **Inspiring block page** — random quote from built-in + your custom quotes, with a watchful tower theme
- **Achievement comparisons** — see what famous people accomplished in the time you've spent on a site
- **Floating gate watcher** — when you take a timed break, a small tower eye tracks your session on allowed sites
- **Temporary access** — 1, 5, 10, or 30 minute breaks, or allow for the browser session; re-blocks automatically

### Mobile app

- **App blocking** — pick distracting apps via system picker (iOS) or installed-apps list (Android)
- **ScreenZen-style shields** — system overlay with quotes and break options
- **Timed allowances** — temporary unlock with automatic re-lock
- **Shared quotes & i18n** — same motivational content as the extension

### All platforms

- **Multilingual UI** — English, French, German, Italian, and Spanish
- **Local only** — no accounts, no cloud sync, no analytics

## Install from source

```bash
git clone https://github.com/acominotto/focus-tower.git
cd focus-tower
bun install
bun run build           # build all packages; extension → apps/chrome/dist/
bun run watch           # watch chrome extension
bun run typecheck
bun test
```

### Load Chrome extension

1. Run `bun run build` (or `cd apps/chrome && bun run build`)
2. Open `chrome://extensions`
3. Enable **Developer mode**
4. Click **Load unpacked**
5. Select **`apps/chrome/dist/`**
6. After code changes, click **Reload** on the extension card

### Mobile app

See [apps/mobile/README.md](apps/mobile/README.md) for Expo dev-client setup, iOS entitlements, and Android accessibility steps.

## Usage

### Blocked sites

- Add domains in the popup (e.g. `twitter.com`)
- **Reset defaults** restores the starter list

### Custom quotes

- Add quote text and optional author in the popup
- They are mixed with built-in quotes on the block page

### Block page

When visiting a blocked site:

- See a quote, time-on-site stats, and a focus reminder
- Choose 1, 5, 10, or 30 minutes, or allow for the session
- Use **Turn away from the tower** to go back

## Project structure

```
focus-tower/
├── apps/
│   ├── chrome/
│   │   ├── src/
│   │   │   ├── adapters/       # Chrome storage, DNR, block service
│   │   │   ├── background.ts
│   │   │   ├── blocked/
│   │   │   ├── content/
│   │   │   ├── popup/
│   │   │   └── lib/            # Chrome-only (messaging, tab tracker)
│   │   ├── static/
│   │   └── manifest.json
│   └── mobile/                 # Expo app
├── packages/
│   └── core/                   # Shared TypeScript
├── turbo.json
└── docs/
```

## Default blocked sites

`facebook.com`, `instagram.com`, `reddit.com`, `tiktok.com`, `twitter.com`, `x.com`, `youtube.com`, `netflix.com`, `twitch.tv`

## Releasing

Releases are automated via GitHub Actions:

1. Bump `version` in `manifest.json` and `package.json`
2. Commit and push a tag: `git tag v1.1.0 && git push origin v1.1.0`
3. CI builds, creates a GitHub Release with a `.zip`, and publishes to the Chrome Web Store

See [docs/CHROME_WEB_STORE.md](docs/CHROME_WEB_STORE.md) for one-time Chrome Web Store API setup.

## Contributing

Contributions are welcome. See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

MIT — see [LICENSE](LICENSE).
