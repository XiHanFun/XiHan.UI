---
'@xihan-ui/headless': major
'@xihan-ui/react': patch
'@xihan-ui/vue': patch
'@xihan-ui/web-components': patch
---

TextField textarea 的 `autoSize` 现在完整跟随运行期值与配置：程序化写值、`minRows` / `maxRows`
变化都会重新测量，切为 `false`、改回 input、节点换代或组件卸载时会归还 helper 首次启用前的
`block-size` 与 `overflow-y` 内联声明，包括各自的 `!important` priority。作者原本没有声明的项
才会被移除，不再把作者样式一并清空。

测量与样式读取严格使用 textarea 所属 Document 的 Window，三端适配器共用同一 helper。
`minRows` 与 `maxRows` 作为原生 rows 同义的行数边界，给值时必须是大于等于 1 的有限整数，
且 `minRows` 不得大于 `maxRows`；无效配置现在明确抛错并撤销旧量高结果，不再静默沿用旧配置。
这项约束收紧了已公开的 `TextFieldAutoSize` 数值语义，因此 Headless 按 major 记录。
