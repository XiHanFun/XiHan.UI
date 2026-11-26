---
'@xihan-ui/core': minor
'@xihan-ui/position': minor
'@xihan-ui/headless': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
'@xihan-ui/web-components': minor
---

**新增** 定位引擎的 `crossOffset`：沿交叉轴再挪一段，正值往结束方向（落在上下两侧时往行内结束方向，RTL 下向左；落在左右两侧时往下），算进原始落点、先于翻面与贴边挪位，箭头仍对着锚点中心。Popover、Popconfirm、HoverCard、Tooltip 随之外露同名 prop，Web Components 属性为 `cross-offset`。与 `placement`、`offset` 一样在打开时读取。
