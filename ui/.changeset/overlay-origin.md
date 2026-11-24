---
'@xihan-ui/styles': minor
---

**改进** 锚定弹层一律从贴着锚点的那条边放大。此前只有 Popover、HoverCard、Popconfirm、Tour、Citation 按落位取缩放原点，Menu 族、Select、Combobox、TreeSelect、Cascader、Mention、ExpressionInput、日期 / 时间 / 颜色面板、Pagination 省略页码面板、Tooltip 与 SideNav 折叠态的弹出分支都从中心点放大。现在落位到原点的映射收进一份定位层公共层（`@xihan-ui/styles/overlay-origin.css`，全量入口已含）：主轴按落定的那一侧，交叉轴按对齐（start / end 从那一端涨开，上下两侧随书写方向）。只影响进出场那一两百毫秒，静止的画面不变。
