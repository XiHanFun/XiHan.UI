---
'@xihan-ui/tokens': minor
'@xihan-ui/styles': patch
---

新增侧栏宽度语义令牌 `--xh-sider-w`（展开，`15rem`）与 `--xh-sider-collapsed-w`（折叠成图标栏，`4rem`），`layout` 的侧栏改为缺省读这两支令牌。

此前侧栏宽度只以字面量写在 `layout` 皮肤的兜底里，页面要统一换侧栏宽只能逐个组件改覆盖槽。现在改这两支令牌即可；只想改一处时照旧写 `--xh-layout-sider-w` / `--xh-layout-sider-collapsed-w`，组件槽优先于令牌。`layout` 的默认宽度不变。
