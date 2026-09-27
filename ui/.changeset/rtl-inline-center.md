---
"@xihan-ui/styles": patch
---

rtl 下行内轴居中的盒不再偏出一个自身宽度。起点 `inset-inline-start` 是逻辑属性、`translate` 是物理通道，rtl 下起点落在右半边、再往左挪半个盒；现在 `:dir(rtl)` 下平移的行内分量掉头。涉及：Toast 在 top / bottom 居中的那一摞（rtl 下曾整摞偏出视口）、走马灯横轨分页条与纵轨翻页钮、粗指针下的分页点与自动播放进度条、图片预览的工具条与计数、评分空项的星形、可调尺寸上下把手的指示条、滑块刻度点与刻度文案（横排与竖排）。

滑块值气泡改用平移回中：原先两侧 inset 钉在 50% 靠自动外边距回中，可用宽度为 0、气泡比它宽时自动外边距按规范取 0，气泡在 ltr 与 rtl 下都从拇指中线起排、偏出半个自身宽。

六份皮肤（carousel / image-viewer / rating / resizable / slider / toast）的体积基线随之上调。
