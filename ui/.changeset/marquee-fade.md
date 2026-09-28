---
'@xihan-ui/headless': minor
'@xihan-ui/styles': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
'@xihan-ui/web-components': minor
---

Marquee 新增 `fade`：窗口两端沿滚动方向渐隐，内容从一端淡入、从另一端淡出，根上投影 `data-fade`，渐隐段长由新公开槽 `--xh-marquee-fade-size`（缺省 `--xh-space-6`）调整。有暂停开关时行尾那一端淡到开关之前，开关所在那一块整块露出、不被淡掉；rtl 与竖排随方向翻转。减弱动效与打印时轨道停住、窗口改成可滚，两端不再淡。 皮肤涨在渐隐的遮罩层、开关留位与减弱动效 / 打印的撤销三组规则上；暂停开关的边长改由根上的同一支私有槽给出，与遮罩留出的位置同源，外观不变。
