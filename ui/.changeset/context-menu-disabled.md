---
'@xihan-ui/headless': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
'@xihan-ui/web-components': minor
---

ContextMenu 新增整张菜单的 `disabled`，与 Menu 同名同义：右键、触摸长按、菜单键与 Shift+F10 都不再展开，也不拦截浏览器自己的右键菜单；触发区撤下 `aria-haspopup` / `aria-controls` / `aria-keyshortcuts` 并退出 Tab 序列，投影 `data-disabled`；条目全部为 `aria-disabled`，命令式 `setOpen(true)` / `openAt` 不生效；展开或长按计时途中转为禁用即收起（受控时只发收起意图）。Web Components 解禁后条目回到作者各自的禁用声明。
