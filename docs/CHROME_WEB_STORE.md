# Chrome Web Store publishing

Focus Tower releases are published automatically when you push a version tag (e.g. `v1.1.0`) or run the **Release** workflow manually from GitHub Actions.

## One-time setup

### 1. Register the extension

1. Create a [Chrome Web Store developer account](https://chrome.google.com/webstore/devconsole).
2. Upload an initial build manually if needed, or use the automated workflow after configuring secrets below.
3. Note your **extension ID** from the developer dashboard URL or extension details page.

### 2. Enable the Chrome Web Store API

Follow the guide in [chrome-webstore-upload-keys](https://github.com/fregante/chrome-webstore-upload/blob/main/How%20to%20generate%20Google%20API%20keys.md) to create:

- OAuth **client ID**
- OAuth **client secret**
- OAuth **refresh token**

### 3. Add GitHub repository secrets

In your repository, go to **Settings → Secrets and variables → Actions** and add:

| Secret | Description |
|--------|-------------|
| `CHROME_EXTENSION_ID` | Extension ID from the Chrome Web Store developer dashboard |
| `CHROME_CLIENT_ID` | Google OAuth client ID |
| `CHROME_CLIENT_SECRET` | Google OAuth client secret |
| `CHROME_REFRESH_TOKEN` | Google OAuth refresh token |

### 4. Protect production publishes (recommended)

Create a GitHub **environment** named `chrome-web-store` under **Settings → Environments**. The release workflow uses this environment for the Chrome Web Store job, so you can require manual approval before each publish.

## Releasing a new version

1. Update `version` in `manifest.json` and `package.json`.
2. Commit the change.
3. Tag and push:

```bash
git tag v1.2.0
git push origin v1.2.0
```

The workflow will:

1. Run tests and build the extension
2. Create a GitHub Release with `focus-tower-<version>.zip`
3. Upload and publish to the Chrome Web Store

## Manual release

Use **Actions → Release → Run workflow** to release without a tag. Provide the version number and choose whether to publish to the Chrome Web Store.

## Local packaging

To build a zip locally for manual upload:

```bash
bun run package
```

This creates `focus-tower.zip` in the repo root.
