---
'@xihan-ui/headless': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
'@xihan-ui/web-components': minor
'@xihan-ui/styles': minor
---

直角坐标图加入数据标签、堆叠合计与线尾标签。

- 柱系列 `labels: 'inside' | 'end'`：inside 写在柱内居中、字取与色槽配对的前景色；end 写在柱的远端外侧，负值翻到另一侧，堆叠中的段写在段内的远端。放不下、与更要紧的标签重叠时不写。
- 折线系列 `labels: 'end'` 把数值写在每个点的上方；`endLabel` 在线尾写系列名与末值，末端挤在一起时上下推开。
- 图级 `totals`：每个堆叠组在整叠外侧写合计，含负值时正负两端各写一个；百分比堆叠不写。
- 柱端外侧的标签写在绘图区里，数值轴两端各收进一截；线尾标签在右边留出位置。标签只给眼睛看，首次出现等柱长完、笔尖扫到再淡入，所属系列被淡出时一起淡出。
- 新增部件 `data-label`、`total-label`、`end-label`；三端都画出场景的前景层。直角坐标图皮肤因标签规则涨约 20%。
