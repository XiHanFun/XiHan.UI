![logo](../assets/logo.png)

[中文](README_cn.md)

# XiHan.UI

Framework-agnostic component library. State machines and accessibility live in a headless core; each framework only gets a thin adapter.

121 components, each shipping a headless core, a Vue component, a custom element, and a default skin.

> **Preview.** Published to npm under the `preview` dist-tag — a pre-release: no semver guarantees, the API can still change. The documentation site is live at https://ui.docs.xihanfun.com. Accessibility is scanned in real Chromium; the backlog is down to two recorded entries (the shared table’s `tag` disabled-state contrast and the WC-side `steps` required-children), plus one replay exemption for `breadcrumb`. Do not depend on it in production.

## Packages

| Package | Responsibility |
| --- | --- |
| `@xihan-ui/kernel` | Structural primitives: anatomy, `mergeProps`, `normalizeProps`, scope, context, ids |
| `@xihan-ui/machine` | State machine runtime: `createMachine`, interpreter contract, controlled bindings |
| `@xihan-ui/behavior` | Behavior primitives: dismissable layer, focus scope, scroll lock, presence, collection, typeahead |
| `@xihan-ui/motion` | Motion primitives: easing single source, tweening, frame loop, reduced-motion preference, closed-form springs, Web Animations wrapper |
| `@xihan-ui/headless` | 121 components as anatomy + machine + `connect` — no styles, no framework |
| `@xihan-ui/vue` | Vue 3 adapter |
| `@xihan-ui/web-components` | Web Components adapter (own reactive base, no third-party runtime dep) |
| `@xihan-ui/styles` | Default skins, layered CSS |
| `@xihan-ui/tokens` | Design tokens (from DTCG sources) + theme runtime (color scheme / density / direction) |
| `@xihan-ui/position` | Floating layer positioning — self-implemented, no third-party runtime dependency |
| `@xihan-ui/pointer` | Pointer session: one pointer from press to release — tracking, filtering, teardown; self-implemented, zero dependencies |
| `@xihan-ui/chat-stream` | AI protocol core: SSE reading → protocol normalization → parts reduction → thread store (no DOM, no framework) |
| `@xihan-ui/code-highlight` | Code highlighting — self-implemented coarse tokenizer, no third-party runtime dependency |
| `@xihan-ui/markdown` | Streaming markdown renderer: incremental block splitting, stable keys, sanitization (CommonMark subset, 489/652) |
| `@xihan-ui/backgrounds` | Background layer: WebGL2 effects and data-driven particle clouds, framework agnostic |
| `@xihan-ui/sound` | Procedural UI sounds synthesized with the Web Audio API — zero audio files, framework agnostic |
| `@xihan-ui/animations` | Animation layer: serializable motion recipes, built-in enter and attention effects, stagger, text splitting |
| `@xihan-ui/icons` | First-party icon set: structured `IconRecord` data, rendered node by node, no runtime SVG string parsing |

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
pnpm size         # bundle size ratchet — builds, then checks the 28 budgets in .size-limit.json
```

## Conventions

- Internal runtime dependencies are always `workspace:^` (dev-only ones use `workspace:*`); third-party versions come from the workspace catalog only.
- `packages/engine/motion` has zero runtime dependencies; `kernel` depends only on `motion`, `machine` only on `kernel`.
- Layer order is enforced by dependency-cruiser, not by convention.
- Commits follow conventional commits; releases go through changesets as one fixed version group.
