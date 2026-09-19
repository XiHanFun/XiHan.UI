---
'@xihan-ui/styles': minor
---

Collection Item 家族配方补 `nav` 语境（`data-xh-collection-context='nav'`，配方 version 3），给横向导航部件（Tabs line trigger、Anchor / Breadcrumb link、Menubar / NavigationMenu trigger）一整套白底承载阶梯：rest 透明面 + `--xh-fg-muted` + regular，hover `--xh-bg-subtle`（100）+ `--xh-fg-default` → pressed `--xh-bg-subtle-hover`（200）只换面，`data-in-path` 与 hover 同档；`data-current` = 透明面 + `--xh-fg-brand-strong` + `--xh-font-weight-medium`，叠加 hover 100 / pressed 200 / 焦点环；新增 `terminal` 态（`data-current` + `data-xh-collection-terminal`）给不可点的当前页：`--xh-fg-default` + medium + cursor default，不带交互守卫也不叠 hover / pressed，并以 (0,4,0) 压过家族禁用面。nav 不读 `aria-selected`、不画对号，2px 指示条由组件自己的滑动 indicator 部件承担；forced-colors 下当前页取 ButtonText。每态都带 `--xh-collection-<slot>-<state>` 覆盖槽（含 `-terminal`）。
