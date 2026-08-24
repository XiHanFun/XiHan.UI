---
"@xihan-ui/styles": patch
---

菜单族的勾选标记跟着语气走。

`context-menu` 与 `menubar` 都有 `tone` 轴、也都在根上发 `data-tone`，但 `item-indicator`
的颜色写死在 `--xh-fg-brand`：把菜单标成 `tone="danger"`，整条菜单换了族，勾选标记还是品牌蓝。
同族的 `select` / `popselect` / `combobox` / `cascader` / `tree-select` 五家早就是跟着语气走的，
只有这两家掉队。

两家的颜色链改成 `var(--xh-<组件>-item-indicator-fg, var(--xh-_tone, var(--xh-fg-brand)))`：
写了语气跟语气，没写落回 `--xh-fg-brand`——**没写 `tone` 的用法一个像素都不变**。
`listbox` 不动，它没有语气轴，链尾就是全部。
