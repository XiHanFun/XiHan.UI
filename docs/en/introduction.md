# XiHan.UI

XiHan.UI is a framework-agnostic component library: state machines and accessibility logic live in a headless core, and each front-end framework gets only a thin adapter.

Every component comes as a headless core, a Vue component, a React component, a custom element and a default skin. The layers share one source: the core alone defines behavior, and each adapter wires it into its framework's rendering and event model.

::: tip About this English edition
The English pages cover getting started, theming, accessibility and the API reference of every component. The full documentation, including the remaining guides, usage guidance and live examples, is in [Chinese](/introduction).
:::

## How it differs from typical component libraries

Most component libraries bind behavior to one framework's component model: switching frameworks means rewriting everything, and accessibility and keyboard interaction are what a rewrite most easily loses. XiHan.UI separates the two:

| Layer | Packages | Responsibility |
| --- | --- | --- |
| Adapters | `@xihan-ui/vue`, `@xihan-ui/react`, `@xihan-ui/web-components` | Wire the same attributes and behavior into each host |
| Headless core | `@xihan-ui/headless` | Anatomy, state machines and `connect` |
| Primitives | `@xihan-ui/core`, `position`, `motion`, `pointer` | Runtime, positioning, motion and pointer sessions |
| Presentation | `@xihan-ui/tokens`, `@xihan-ui/styles` | Shared tokens and pure CSS skins |

This gives four verifiable properties:

- One behavior, three hosts. Vue, React and custom elements share the state machine and `connect`; the documentation site provides examples for each framework, and a demo gate checks the coverage.
- Styling is decoupled from logic. Skins only select `data-scope` / `data-part` / `data-*` state attributes, never frameworks or class names. Replacing the whole skin needs no JS change.
- Accessibility is a criterion. Every component has a machine-readable keyboard specification, and it doubles as the test denominator: a suite that misses one row fails.
- A small dependency surface. The runtime code of the library packages pulls in no third-party dependencies; each adapter depends only on its host framework. Date arithmetic, positioning, syntax highlighting and the Web Components reactive base class are all built in-house.

## Where to start

| Goal | Start here |
| --- | --- |
| Add it to an existing project | [Installation](./installation) |
| Write a first component | [Quick start](./quickstart) |
| Look up a component's parts, props and keyboard support | [Components](./components/) |
| Change the theme | [Design tokens and theming](./guide/theme) |
| Understand the keyboard and focus contract | [Accessibility and keyboard](./guide/a11y) |
| Read the architecture overview, adapter guides and skin layering | [Chinese documentation](/overview) |

## Related

- Source code: [GitHub](https://github.com/XiHanFun/XiHan.UI) · [Gitee](https://gitee.com/XiHanFun/XiHan.UI) · [GitCode](https://gitcode.com/XiHanFun/XiHan.UI)
- The two other repositories of the ecosystem: [XiHan.Framework](https://framework.docs.xihanfun.com/) and [XiHan.BasicApp](https://basicapp.docs.xihanfun.com/)

::: tip Relationship with XiHan.BasicApp
The front end of XiHan.BasicApp is built on XiHan.UI: since BasicApp v4.0.0 it has been rebuilt on this library, making it the library's first large consumer in real business code.
:::
