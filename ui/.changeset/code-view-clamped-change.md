---
'@xihan-ui/headless': major
'@xihan-ui/vue': major
'@xihan-ui/react': major
'@xihan-ui/web-components': major
---

**破坏性** CodeView 折叠态的变化回调从 `onClampToggle` 改叫 `onClampedChange`：受控值叫 `clamped`，它的变化事件就该是 `on<值>Change`，与全库 `value / onValueChange`、`open / onOpenChange` 同形。

| 旧名 | 新名 |
| --- | --- |
| `onClampToggle`（Vue `@clamp-toggle`，WC 事件 `clamp-toggle`） | `onClampedChange`（Vue `@clamped-change`，WC 事件 `clamped-change`） |
| 类型 `CodeViewClampToggleDetails` | `CodeViewClampedChangeDetails` |
