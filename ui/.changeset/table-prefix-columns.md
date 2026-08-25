---
"@xihan-ui/headless": minor
"@xihan-ui/vue": minor
"@xihan-ui/web-components": minor
---

表格补前缀列、树形子行与行号。

**前缀列**：`prefixColumns: ['index', 'select', 'expand']` 按给定顺序插在最前面，
并**占住列号**——不占的话右侧所有列的 `aria-colindex` 会整体串位，而这正是使用者
手工往 `columns` 里塞假列的原因。作者照 `api.columns` 渲染即可，每一项自报 `kind`。
默认一列都不插，现有用法一行不用改。

**树形子行**：`TableRowDef.parentId` 指父行。有子行的行不再产出详情行——
一行不可能同时既展开出子行、又展开出一块详情。`aria-level` / `aria-posinset` /
`aria-setsize` 从写死的 1 与 2 改成按真实层级给。

**行号** `api.rowNumber(rowId)`：
- 平表是**分页全局序号** `(page - 1) * pageSize + 可见序`，翻到第二页不会又从 1 开始；
  `page` / `pageSize` 只用来算序号，不参与切片（切片归调用方或分页组件的 `api.slice`）。
- 树形是**大纲编号**（`1` / `1.1` / `1.2`），取的是「在父的 children 里的下标」
  而不是可见序：**收起某一枝时，仍在场的行编号一个都不变**。取可见序的话收起一枝，
  其后所有行的号会整体前移，用户看到的是「序号跳了」。
