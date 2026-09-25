---
'@xihan-ui/styles': patch
---

`side-nav` 的两档宽度改为缺省读侧栏令牌，与 `layout` 的侧栏同源。

展开宽 `--xh-side-nav-w` 缺省改取 `--xh-sider-w`（`15rem`，根字号 16px 时仍是 240px），折叠宽 `--xh-side-nav-collapsed-w` 缺省改取 `--xh-sider-collapsed-w`（`4rem`）。**折叠成图标栏时由 56px 变为 64px**，与 `layout` 折叠后的侧栏同宽；行内容居中，图标位置不变、两侧留白各多 4px。

需要保留 56px 的，在侧栏上写 `--xh-side-nav-collapsed-w: 56px`。改 `--xh-sider-w` / `--xh-sider-collapsed-w` 两支令牌会让 `layout` 的侧栏与 `side-nav` 一起换宽。
