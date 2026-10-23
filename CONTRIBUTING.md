# Contributing

**English** | [简体中文](./CONTRIBUTING_cn.md)

Thanks for helping with XiHan.UI. This guide is for people: it covers what to do between cloning the repository and getting a change merged. The detailed rules (component architecture, styling constraints, test requirements) live in [AGENTS.md](./AGENTS.md), and people and AI coding tools follow the same set.

## Open an issue first

Please open an issue to agree on the direction before you start on any of these:

- a new component or a new package;
- removing or renaming public surface: exports, props, events, part names, CSS variables, custom element tags and attributes;
- a capability for only one adapter (all three adapters are the default requirement).

Typos, docs and clear bug fixes can go straight to a pull request.

## Set up

You need Node.js 24 or later and pnpm 11 or later. The repository root has no `package.json`: the library lives in `ui/` and the documentation site in `docs/`.

```bash
cd ui
pnpm install --frozen-lockfile
pnpm build
```

`pnpm install` also installs the commit-msg hook. Install Chromium once before running browser tests:

```bash
pnpm exec playwright install chromium
```

To run the documentation site locally, build `ui/` first, then:

```bash
cd docs
pnpm install
pnpm dev
```

## Where a change belongs

| What | Where |
| --- | --- |
| Framework-agnostic behaviour shared across components | `ui/packages/engine/core` |
| Component state machine, defaults, events, keyboard, ARIA, anatomy | `ui/packages/engine/headless/src/<component>` |
| Vue / React / Web Components bridges | `ui/packages/adapters/<adapter>` |
| Design tokens | `ui/packages/design/tokens` |
| Default skins | `ui/packages/design/styles/css/<component>.css` |
| Cross-adapter conformance suite | `ui/tooling/testing/src/suites` |
| Documentation demos | `docs/.vitepress/demos/<component>` |

Two principles:

- The three adapters must agree on props, events, parts, defaults and state semantics. Fix a shared bug in Core or Headless, not once in each adapter.
- Skins only consume semantic tokens, parts and state attributes. No raw colours, spacing, radii, shadows or durations.

## New components

Dry-run the scaffold first and check every registration point:

```bash
cd ui
pnpm new:component -- --list-categories
pnpm new:component -- <kebab-name> --label=<display name> --category=<category> --dry-run --show-hunks
```

When it looks right, run it again without `--dry-run`, then work in this order: the Headless contract and its unit tests → the three adapters → the skin → generated files (CEM, component tokens, docs, public surface) → real-browser and cross-adapter checks.

## Tests and gates

Run these in `ui/`:

| Task | Command |
| --- | --- |
| Unit and conformance tests (jsdom) | `pnpm test` |
| Real Chromium tests | `pnpm test:browser` (`--list` shows categories, `--pkg=vue` limits to one package) |
| Type check | `pnpm typecheck` |
| Lint | `pnpm lint` |
| Structural gates | `pnpm gate` (`pnpm gate --list` shows modules; you can run only the relevant ones) |
| Size budgets | `pnpm size` |
| Full build | `pnpm build` |

Run the tests closest to your change first, then `pnpm gate` and `pnpm build`. If you changed the docs, also run `pnpm build` in `docs/`.

A few conventions that are easy to miss:

- Generated files (component docs, CEM, unlayered CSS, the public-surface baseline and so on) come from scripts. Commit them together with their sources and never edit them by hand. The common ones are `pnpm gen:docs`, `pnpm surface:update` and `pnpm --filter @xihan-ui/styles gen`.
- For a visual bug, first write a browser assertion that reproduces the failure, then change the implementation.
- jsdom does not check real layout, animation or overlay geometry; assert those in Chromium.
- Don't loosen a gate or add to its exception list to make it pass. If an exception is truly needed, explain each entry in the pull request.

## Commits

Commit messages follow Conventional Commits. The project writes the description in Chinese:

```text
<type>(<scope>): <description>
```

- `type` is one of feat, fix, refactor, perf, docs, style, test, build, ci, chore, revert. Recommended scopes are listed in [`ui/commitlint.config.js`](./ui/commitlint.config.js).
- One commit per component or per shared recipe. Contract, adapters, tests, docs and generated files for the same feature go in the same commit.
- Mark breaking changes with `!` after the type, for example `feat(select)!: …`.
- Run `git diff --check` before committing.

## Changesets

When a published package changes behaviour, styling or public surface, run `pnpm changeset` in `ui/` to add a record:

- patch for bug fixes, minor for compatible additions, major for removing or renaming public surface;
- the 23 public packages are released in lockstep, so a major in any one of them moves every package to the next major;
- what counts as breaking is defined in the [versioning and compatibility policy](./docs/guide/versioning.md).

Changes to docs, tests and internal tooling only don't need a changeset.

## Pull requests

- Branch from `dev` and open the pull request against `dev`. CI runs on pull requests to `dev` and `main` and checks every commit message.
- Fill in the [pull request template](./.github/PULL_REQUEST_TEMPLATE.md). Read the section on changes the gates can't catch carefully: no script stops those, only review does.
- Keep one pull request to one change. Open a separate issue or pull request for unrelated problems you find along the way.

## License

By contributing, you agree that your changes are released under the [MIT License](./LICENSE).
