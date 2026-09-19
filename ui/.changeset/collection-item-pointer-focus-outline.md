---
"@xihan-ui/styles": patch
---

**集合类条目指针划过后，上一条目不再闪出一圈黑色描边。**

菜单、右键菜单、菜单栏、下拉选项、列表框、级联、树、树选择、穿梭框、表格行、侧边导航、标签组与日期 / 时间选择器的预设、时间列这 17 份皮肤，都在 `:focus:not(:focus-visible)` 下给条目写了 `outline: none`。指针划入条目时焦点跟着搬到它身上，这条规则命中；`outline` 简写把 `outline-color` 复位成 `currentColor`。划到下一条时焦点离开、规则失效，`outline-style` 立即回到配方的 `solid`，而 `outline-color` 还要从近黑过渡回透明——这几帧里上一条目画出一圈实心黑边。

UA 只在 `:focus-visible` 绘制环，这 21 条复位本就是死代码；整条删掉，条目的环仍由 Collection Item 配方经描边槽驱动，指针路径恒为透明，键盘 `:focus-visible` 照常带环。新增门禁 `check-focus-outline-reset` 拦住同类写法。
