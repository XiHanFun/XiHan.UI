---
'@xihan-ui/headless': minor
'@xihan-ui/styles': minor
---

Menubar 入口接入 Collection Item 家族的 `nav` 语境：`getTriggerProps` 投影 `data-xh-collection-item` / `data-xh-collection-size` / `data-xh-collection-context='nav'`，展开着的那一张新增布尔属性 `data-in-path`（与 Menu 子菜单入口同法；`data-state` open / closed 仍保留给箭头与 positioner）。皮肤删掉手写的悬停、展开、按下、禁用规则与 forced-colors 按下块，改在入口基础规则里把 `--xh-menubar-trigger-*` 公开槽映射到家族桥接槽，并新增 `--xh-menubar-trigger-fg` 静息字色槽（缺省 `--xh-fg-default`，菜单名不取 nav 缺省的 muted）；取值不变：hover `--xh-bg-subtle`（100），打开中与 hover 同档的中性面、不加粗不用品牌色，pressed `--xh-bg-subtle-hover`（200）只换面，禁用由家族按 `aria-disabled` 给字色与 not-allowed。
