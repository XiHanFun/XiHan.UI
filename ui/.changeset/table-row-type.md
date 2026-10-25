---
'@xihan-ui/headless': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
'@xihan-ui/web-components': minor
---

**新增** 表格的行类型泛型：根组件按 `data` 的元素类型推断行类型，数据列的 id、`field` 与 `rowKey` 只能写它的字段，写错编译即报错；`format` 的 `value` 是那个字段的类型，`compare`、`filter`、`format` 与 `cell` 插槽（React 是 `renderCell`）拿到的记录都是那一行的类型，插槽参数新增 `field`，按它判出字段后 `value` 跟着收窄。`TableColumnDef<TRow>` 与 `TableSchema<TRow>` 带上行类型参数，缺省仍是宽松的 `TableRecord`，没给 `data` 的手写结构表格不受影响。列定义另写成常量时标成 `TableColumnDef<行类型>[]`：标成不带参数的 `TableColumnDef[]` 再配上有具体类型的 `data` 会被判为字段名不符。Vue 在模板里由 Volar 推断，`h()` 推断不了泛型，那里按宽松的记录检查；Web Components 写 `querySelector<XhTableElement<行类型>>('xh-table')`。

**新增** 列定义的 `field`：数据驱动模式下列读记录里的哪个字段，缺省即列 id。列 id 想另起名字时写 `field: '字段名'`；写 `field: null` 是不读字段的列（操作列、由几个字段拼出来的列），文字靠 `format` 或 `cell` 插槽，排序与筛选靠 `compare` 与 `filter`。headless 新增 `TableColumnBase`、`TableField`、`TableFieldValue`、`TableRecordOf` 类型与 `tableColumnField`、`tableColumnValue` 两个取值函数。
