![logo](../assets/logo.png)

[中文](README_cn.md)

# XiHan.UI

Framework-agnostic component library. State machines and accessibility live in a headless core; each framework only gets a thin adapter.

Every component ships a headless core, Vue and React components, a custom element, and a default skin.

> The public packages are released in lockstep and published to npm; the documentation site is at https://ui.docs.xihanfun.com. Accessibility is scanned in real Chromium; the backlog is down to six recorded entries, plus one replay exemption for `breadcrumb`.

## Packages

The public packages fall into five groups — core, components and adapters, presentation, content and effects, and developer tools. What each package does, what it depends on and which layer it sits in is listed on the documentation site under [Packages and dependencies](https://ui.docs.xihanfun.com/npm-package-dependency).

`tooling/*` holds internal build, lint, tsconfig, testing and script packages; they are never published.

## Layout

```
ui/
├── packages/     # published libraries
└── tooling/      # internal build & quality tooling
```

## Development

Requires Node ≥ 24 and pnpm ≥ 11.

```bash
pnpm install --frozen-lockfile
pnpm test         # unit + cross-adapter conformance tests (jsdom)
pnpm test:browser # accessibility sweep + floating position contract in real Chromium (run `pnpm exec playwright install chromium` first)
pnpm typecheck
pnpm lint
pnpm boundaries   # layered dependency gate (dependency-cruiser)
pnpm build
pnpm size         # bundle size ratchet — builds, then checks the budgets in .size-limit.json
```

## Conventions

- Internal runtime dependencies are always `workspace:^` (dev-only ones use `workspace:*`); third-party versions come from the workspace catalog only.
- `packages/engine/motion` has zero runtime dependencies; `kernel` depends only on `motion`, `machine` only on `kernel`.
- Layer order is enforced by dependency-cruiser, not by convention.
- Commits follow conventional commits; releases go through changesets as one fixed version group.
