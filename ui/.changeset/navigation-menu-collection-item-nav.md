---
'@xihan-ui/headless': minor
'@xihan-ui/styles': minor
---

NavigationMenu 入口与面板链接接入 Collection Item 家族的 `nav` 语境：`getTriggerProps` 投影 `data-xh-collection-item` / `data-xh-collection-size` / `data-xh-collection-context='nav'`，展开着的那一张新增布尔属性 `data-in-path`（`data-state` open / closed 仍保留给箭头、positioner 与 viewport）；`getLinkProps` 的 `data-xh-collection-context` 由 `'overlay'` 改为 `'nav'`，当前页（`data-current`）的 `--xh-fg-brand-strong` + medium 改由家族给。皮肤删掉入口手写的悬停、展开、按下、禁用规则、链接的 `[data-current]` 规则与 forced-colors 按下块，改在基础规则里把 `--xh-navigation-menu-trigger-*` / `--xh-navigation-menu-link-*` 公开槽映射到家族桥接槽。默认外观变化：入口悬停字色由 `--xh-fg-muted` 提到 `--xh-fg-default`，入口字重由 label（500）改为 regular（400）与 Anchor / Breadcrumb / Menubar 入口一致（作者可经 `--xh-navigation-menu-trigger-font-weight` 改回）；其余取值不变：静息 muted，hover 100，打开中与 hover 同档且不用品牌色，pressed 200 只换面，链接 hover 100 / pressed 200、当前页 brand-strong + medium 并叠 hover 面。
