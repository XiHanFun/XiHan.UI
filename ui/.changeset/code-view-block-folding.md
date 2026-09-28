---
'@xihan-ui/headless': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
'@xihan-ui/web-components': minor
'@xihan-ui/styles': minor
---

CodeView 新增按语法块折叠：

- 新增 `blockFolding`：按缩进找出语法块（一行之下缩进更深的连续行，夹在中间的空行算在内），块头那一行的行首出现折叠钮，新部件 `line-fold-trigger` 由组件铺在正文最前面；收起的行带 `hidden`、不占高度，块头的行与正文带 `data-folded`，皮肤在正文后面画一枚省略号；root 带 `data-block-folding`。
- 折叠集合写块头的行号（随 `startLine`）：`folded` 受控（Vue `v-model:folded`）、`defaultFolded` 非受控（Web Components 属性 `folded` / `default-folded`，逗号分隔），变化经 `folded-change` 报出 `{ folded }`。
- 行首折叠钮合起来只占一个 Tab 位，上下方向键在看得见的钮之间走，Home / End 到首末；可访问名取 `translations.foldBlock(first, last)`，开合由 `aria-expanded` 表达。
- 新增导出 `findCodeViewFoldRegions` 与类型 `CodeViewFoldRegion`、`CodeViewFoldedChangeDetails`；API 新增 `foldRegions`、`folded`、`isFoldStart`、`toggleFold`、`getLineFoldTriggerProps`。
- 外观槽：`--xh-code-view-fold-col`、`--xh-code-view-line-fold-trigger-{radius,fg}`、`--xh-code-view-icon-size`、`--xh-code-view-folded-{gap,fg}`。
