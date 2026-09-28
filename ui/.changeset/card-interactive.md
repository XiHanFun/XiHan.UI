---
'@xihan-ui/headless': minor
'@xihan-ui/styles': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
'@xihan-ui/web-components': minor
---

Card 新增整卡可交互形态：

- `interactive` 加新部件 `trigger`（放在 title 里的原生链接或按钮；Vue / React 的 `XhCardTrigger` 给了 `href` 渲染 `<a>`、不给渲染 `<button type="button">`，路由链接用 `asChild`；WC 作者直接写 `<a data-xh-part="trigger">`）。trigger 的点击区由伪元素铺满整张卡片，可及名与 Tab 位只归它，根上投影 `data-interactive`、不拿焦点也不写 role。
- 反馈：outline 悬停抬高一档海拔（raised → lifted），按下换到白底阶梯 200；subtle 悬停 200、按下 300；ghost 悬停 100、按下 200。键盘聚焦时焦点环画在整张卡片外沿。脚部叠在点击区之上，里面的按钮照常可点、按下时整卡不换面。新增槽 `--xh-card-shadow-hover`、`--xh-card-bg-hover`、`--xh-card-bg-pressed`、`--xh-card-glint-duration`。
- `data-material="liquid"` 下，可交互卡片在细指针悬停时描边扫过一道交互光，与 Button 实心钮同一配方。
- subtle 卡片作为淡底容器向内下发承载面阶梯：放在里面的 ghost / outline 控件悬停与按下改按 200 → 300 换面。

皮肤涨在可交互形态的三档反馈、点击区与焦点环、交互光与淡底容器的承载面槽上。
