![logo](../assets/logo.png)

[中文](README_cn.md)

# XiHan.UI

Framework-agnostic component library. State machines and accessibility live in a headless core; each framework only gets a thin adapter.

69 components, each shipping a headless core, a Vue component, a custom element, and a default skin.

> **Experimental.** Not published to npm and no documentation site yet. Accessibility is scanned in real Chromium, but the first sweep left a backlog of recorded issues (17 components plus one global contrast problem). Do not depend on it in production.

## Packages

| Package | Responsibility |
| --- | --- |
| `@xihan-ui/core` | Structural primitives: anatomy, `mergeProps`, `normalizeProps`, scope, context, ids |
| `@xihan-ui/machine` | State machine runtime: `createMachine`, interpreter contract, controlled bindings |
| `@xihan-ui/behavior` | Behavior primitives: dismissable layer, focus scope, scroll lock, presence, collection, typeahead |
| `@xihan-ui/headless` | 69 components as anatomy + machine + `connect` — no styles, no framework |
| `@xihan-ui/vue` | Vue 3 adapter |
| `@xihan-ui/wc` | Web Components adapter (own reactive base, no third-party runtime dep) |
| `@xihan-ui/styled` | Default skins, layered CSS |
| `@xihan-ui/system` | Design tokens (from DTCG sources) + theme runtime (color scheme / density / direction) |
| `@xihan-ui/position` | Floating layer positioning — self-implemented, no third-party runtime dependency |
| `@xihan-ui/ai` | AI protocol core: SSE reading → protocol normalization → parts reduction → thread store (no DOM, no framework) |
| `@xihan-ui/highlight` | Code highlighting — self-implemented coarse tokenizer, no third-party runtime dependency |
| `@xihan-ui/markdown` | Streaming markdown renderer: incremental block splitting, stable keys, sanitization (CommonMark subset, 489/652) |
| `@xihan-ui/visual` | Visual layer: WebGL2 background effects and data-driven particle clouds, framework agnostic |
| `@xihan-ui/icons` | First-party icon set: structured `IconRecord` data, rendered node by node, no runtime SVG string parsing |

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
pnpm test:browser # accessibility sweep + floating position contract in real Chromium (run `pnpm exec playwright install chromium` first)
pnpm typecheck
pnpm lint
pnpm boundaries   # layered dependency gate (dependency-cruiser)
pnpm build
pnpm size         # bundle size ratchet — builds, then checks the 17 budgets in .size-limit.json
```

## Conventions

- Internal dependencies are always `workspace:*`; third-party versions come from the workspace catalog only.
- `packages/core` and `packages/machine` have zero runtime dependencies.
- Layer order is enforced by dependency-cruiser, not by convention.
- Commits follow conventional commits; releases go through changesets as one fixed version group.
