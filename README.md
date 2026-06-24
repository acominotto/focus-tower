# Focus Tower

[![CI](https://github.com/grinn/focus-tower/actions/workflows/ci.yml/badge.svg)](https://github.com/grinn/focus-tower/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

A Chrome extension inspired by Cold Turkey — block distracting websites and show productivity quotes when you try to visit them. Built with **TypeScript**, **Bun**, and Manifest V3.

## Features

- **Default block list** — common distractions (Facebook, Reddit, YouTube, etc.) on first install
- **Custom block list** — add or remove domains from the popup
- **Inspiring block page** — random quote from built-in + your custom quotes, with a watchful tower theme
- **Achievement comparisons** — see what famous people accomplished in the time you've spent on a site
- **Floating gate watcher** — when you take a timed break, a small tower eye tracks your session on allowed sites
- **Custom quotes** — add your own messages in the popup
- **Temporary access** — 1, 5, 10, or 30 minute breaks, or allow for the browser session; re-blocks automatically
- **Multilingual UI** — English, French, German, Italian, and Spanish
- **Local only** — no accounts, no cloud sync

## Install from source

```bash
git clone https://github.com/grinn/focus-tower.git
cd focus-tower
bun install
bun run build      # outputs to dist/
bun run watch      # rebuild on changes
bun run typecheck  # optional TypeScript check
```

### Load in Chrome

1. Run `bun run build`
2. Open `chrome://extensions`
3. Enable **Developer mode**
4. Click **Load unpacked**
5. Select the **`dist/`** folder (not the repo root)
6. After code changes, click **Reload** on the extension card

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
├── src/
│   ├── background.ts           # Service worker
│   ├── blocked/                # Block page logic
│   ├── content/                # Gate watcher content script
│   ├── popup/                  # Popup UI logic
│   ├── lib/                    # Shared modules
│   └── data/default-sites.ts   # Default block list
├── static/                     # HTML & CSS (copied to dist/)
├── icons/
├── scripts/build.ts            # Bun bundler
├── manifest.json
└── dist/                       # Load this folder in Chrome
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
