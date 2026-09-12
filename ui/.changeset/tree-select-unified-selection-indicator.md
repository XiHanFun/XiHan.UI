---
'@xihan-ui/styles': patch
'@xihan-ui/vue': patch
'@xihan-ui/react': patch
'@xihan-ui/web-components': patch
---

TreeSelect 的单选、多选、叶子与分支统一使用末端对号表示选中，级联半选显示横线。
选中正文不再变色或加粗，中性底仅表示悬停和键盘高亮；展开箭头与选择标记独立排布。

补齐 Vue / React 自动分支结构的 `item-indicator`，Web Components 同一部件按最近叶子或分支接线。
同步现有三端示例，级联示例使用正式标记部件，移除另外自绘的方框和重复状态判断。
自定义分支结构应显式加入 `item-indicator`，未提供时不猜测或自动插入作者节点。

皮肤体积（去注释、压空白）：前一提交源码 21941 字节，当前 21942 字节；登记基线 21941 → 21942，只更新本组件，10% 容差保持不变。
