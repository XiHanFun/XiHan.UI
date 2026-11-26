---
'@xihan-ui/headless': major
'@xihan-ui/vue': major
'@xihan-ui/react': major
'@xihan-ui/web-components': major
---

**改动** Anchor 的 `collection` 改为只收 `{ value, label? }` 对象（`value` 是目标区块的 id，`label` 缺省回退为 id），不再收 id 字符串：原来写 `['intro', 'usage']` 的改成 `[{ value: 'intro' }, { value: 'usage' }]`。

**新增** 只给 `collection` 时按标准结构铺出目录：`nav` 里一个列表，每条一个链接，末尾是指示条；观察器照旧按这份清单查目标区块。headless 新增 `anchorStructure`、`AnchorNode`、`AnchorNodeMeta` 与 api 的 `collection`。
