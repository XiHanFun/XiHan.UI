---
"@xihan-ui/styles": patch
---

**宿主页面带焦点复位时，指针切换标签页等集合条目不再闪出一圈蓝边；集合条目的键盘环改为即时出现。**

Collection Item 配方在条目根上常驻 `solid` 描边、静息透明，此前把 `outline-color` 放在 micro 过渡里。宿主页面常见的 `button:focus:not(:focus-visible) { outline: none !important }`（VitePress 默认主题 base.css 原文）是无层规则，压过库里分层的家族描边：指针点中标签时它把 `outline` 简写复位成 `none`，`outline-color` 同时落到 `currentColor`（当前页是品牌深字）；再点下一枚标签、焦点离开时规则失效，`solid` 立即回来，而颜色还要从品牌色淡回透明——这几帧上一枚标签画出一圈实心蓝边。文档站的 Tabs 页即如此。

配方不再过渡 `outline-color`，与公共层 `focus.css` 的环同一节奏（即时出现、即时消失）；`tree.css` 自写的同款过渡一并去掉。受影响的是全部投影 `data-xh-collection-item` 的条目（菜单、右键菜单、菜单栏、下拉选项、列表框、级联、命令面板、提及、树、树选择、穿梭框、表格行、侧边导航、锚点、面包屑、导航菜单、标签页、日期 / 时间选择器的预设与时间列）：键盘 `:focus-visible` 与 `data-highlighted` 的环不再有 120ms 淡入淡出，面与字色的过渡不变。
