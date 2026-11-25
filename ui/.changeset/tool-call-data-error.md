---
'@xihan-ui/headless': major
'@xihan-ui/styles': patch
---

**破坏性** ToolCall 根上「这次调用跑砸了」的状态属性从 `data-errored` 改叫 `data-error`，与 Cascader、Tree、TreeSelect、ImageViewer 的失败态同一个名字；只差一个词尾的两个名字容易写错。`api.errored` 不变。自己写选择器读这一位的要跟着改。

| 旧名 | 新名 |
| --- | --- |
| root 上的 `data-errored` | `data-error` |
