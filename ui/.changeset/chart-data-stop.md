---
'@xihan-ui/headless': major
'@xihan-ui/styles': patch
---

**破坏性** 按值着色的图表标记上「落在色阶哪一段」的状态属性从缩写 `data-seg` 改叫 `data-stop`（取值仍是 `low` / `high`），不与 DateField 的 `data-segment` 只差一截。CartesianChart、FunnelChart、HierarchyChart 的标记与提示框色块同改；自己写选择器读这一位的要跟着改。

| 旧名 | 新名 |
| --- | --- |
| `data-seg="low" \| "high"` | `data-stop="low" \| "high"` |
