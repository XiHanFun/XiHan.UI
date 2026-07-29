![logo](../assets/logo.png)

[中文](README_cn.md)

# XiHan.UI

Framework-agnostic component library. State machines and accessibility live in a headless core; each framework only gets a thin adapter.

65 components, each shipping a headless core, a Vue component, a custom element, and a default skin.

> **Experimental.** Not published to npm and no documentation site yet. Accessibility is scanned in real Chromium, but the first sweep left a backlog of recorded issues. Do not depend on it in production.

## Packages

| Package | Responsibility |
| --- | --- |
| `@xihan-ui/core` | Structural primitives: anatomy, `mergeProps`, `normalizeProps`, scope, context, ids |
| `@xihan-ui/machine` | State machine runtime: `createMachine`, interpreter contract, controlled bindings |
| `@xihan-ui/behavior` | Behavior primitives: dismissable layer, focus scope, scroll lock, presence, collection, typeahead |
| `@xihan-ui/headless` | 65 components as anatomy + machine + `connect` — no styles, no framework |
| `@xihan-ui/vue` | Vue 3 adapter |
| `@xihan-ui/wc` | Web Components adapter (built on `@lit/reactive-element`) |
| `@xihan-ui/styled` | Default skins, layered CSS |
| `@xihan-ui/system` | Design tokens (from DTCG sources) + theme runtime (color scheme / density / direction) |
| `@xihan-ui/position-floating-ui` | Floating layer positioning — the only package allowed to depend on `@floating-ui/dom` |
| `@xihan-ui/ai` | AI protocol core: SSE transport, Data Stream v1 normalize, parts reducer, thread store |
| `@xihan-ui/icons` | Icon set |

`tooling/*` holds internal build, lint, tsconfig, testing and script packages; they are never published.

## Layout

```
ui/
├── packages/     # published libraries
├── tooling/      # internal build & quality tooling
└── apps/
    ├── playground-vue   # Vue adapter demos
    └── playground-wc    # Web Components adapter demos
```

Both playgrounds cover the same components side by side, so the two adapters can be compared frame by frame.

## Development

Requires Node ≥ 24 and pnpm ≥ 11.

```bash
pnpm install --frozen-lockfile
pnpm dev          # start the playgrounds
pnpm test         # unit + cross-adapter conformance tests (jsdom)
pnpm test:browser # accessibility sweep in real Chromium (run `pnpm exec playwright install chromium` first)
pnpm typecheck
pnpm lint
pnpm boundaries   # layered dependency gate (dependency-cruiser)
pnpm build
pnpm size         # bundle size ratchet
```

## Conventions

- Internal dependencies are always `workspace:*`; third-party versions come from the workspace catalog only.
- `packages/core` and `packages/machine` have zero runtime dependencies.
- Layer order is enforced by dependency-cruiser, not by convention.
- Commits follow conventional commits; releases go through changesets as one fixed version group.
