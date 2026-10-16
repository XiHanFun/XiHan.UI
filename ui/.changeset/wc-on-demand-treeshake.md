---
'@xihan-ui/web-components': patch
---

按需注册（`defineXhElement`）真正只打包用到的元素：此前只注册一个统计数值（Statistic），产物里仍带着级联选择、选择器、组合框、日期选择器、时间选择器、树选择、颜色选择器、侧边导航、标签组与标签输入这十个元素及其整套状态机，gzip 约 160 kB；现在约 15 kB。原因是这些元素类的静态字段 `partContract` 在类定义时读取了另一个解剖对象的属性（`tagAnatomy.name`、`tooltipAnatomy.name`），打包器把属性读取视为可能有副作用，整个类因此无法摇掉；委派名改为字面量后，未引用的元素类随 tree-shaking 去掉。体积门禁新增「只按需注册一个元素」一条，防止回退。
