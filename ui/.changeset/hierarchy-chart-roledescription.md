---
'@xihan-ui/headless': patch
'@xihan-ui/vue': patch
'@xihan-ui/react': patch
'@xihan-ui/web-components': patch
---

HierarchyChart 的绘图区补上读屏角色说明（`aria-roledescription`），取 `translations.chartRoleDescription`，与其余六种图表一致。绘图区是 `role="tree"`、按方向键展开收起，缺省说法因此用 `tree chart`（各语言包同为「树状图表」一类保留「树」字的说法），不用笼统的 `chart`，读屏才不会把树的操作提示盖掉。
