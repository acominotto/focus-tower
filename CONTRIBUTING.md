# Contributing to Focus Tower

Thank you for your interest in contributing! This project is open source and welcomes bug reports, feature ideas, and pull requests.

## Development setup

```bash
git clone https://github.com/grinn/focus-tower.git
cd focus-tower
bun install
bun run build
bun test
bun run typecheck
```

Load the `dist/` folder as an unpacked extension in `chrome://extensions` (Developer mode).

## Pull requests

1. Fork the repository and create a branch from `main`.
2. Make your changes with tests where behavior could regress.
3. Run `bun test`, `bun run typecheck`, and `bun run build` before opening a PR.
4. Describe what changed and why in the pull request template.

Keep changes focused — smaller PRs are easier to review and merge.

## Code style

- Match existing patterns in the file you are editing.
- Keep UI components thin; put orchestration in hooks or `lib/`.
- Zod schemas use PascalCase names without a `Schema` suffix (see project conventions).

## Reporting issues

Use the [bug report](https://github.com/grinn/focus-tower/issues/new?template=bug_report.yml) or [feature request](https://github.com/grinn/focus-tower/issues/new?template=feature_request.yml) templates so we have enough context to help.

## License

By contributing, you agree that your contributions will be licensed under the [MIT License](LICENSE).
