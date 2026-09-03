---
"@xihan-ui/styles": minor
---

**`approval` 判定在途补上视觉，默认渲染会变。**

**此前在途只有禁用那一档灰**，与「必选项没勾满、批不了」长得一模一样：用户按下批准，两颗钮同时变灰，看不出是系统正在想还是自己漏勾了什么，只会接着点。现在两颗钮那一行里转一枚圆环，与 `download-trigger`、`clipboard`、`popconfirm`、`switch` 的在途同形——在途在全库读起来是同一件事。圆环挂在这一行上而不是某一颗钮上：连接层只拿到「有一条判定在途」，拿不到是哪一颗按下的。

**在途那一档不再置灰**：`[data-part='approve-trigger'][aria-disabled='true']` 这条置灰规则现在排除在途（`:not([data-loading])`），只留给「必选项没勾满」。在途时两颗钮保持原来的底色与对比度，按不动这件事由圆环与 `cursor: progress` 说；读屏那一侧照旧由 `aria-disabled` 与 `aria-busy` 说。

减弱动效（系统偏好与作者打的 `data-motion="reduce"` 两条通道）下圆环停下并整圈换成虚线，静止的形状仍读得出「还没好」。

**拒绝钮的「按不动」那一档改挂在 `:disabled` 上。** 它原先写在 `[aria-disabled='true']` 上，而拒绝钮那一位只在判定在途时为真——等于整条规则从来只在在途那一档生效，落定后的拒绝钮反而没有描边上的变化。`--xh-approval-deny-border-off` 与 `--xh-approval-deny-bg-off` 两个槽仍是这两句的入口，生效的时机从「在途」换成了「已落定」。

圆环的直径取两颗钮那一档字号（`--xh-approval-action-font-size`）的 1em，不取整行继承来的字号——它的宿主是整行而不是某一颗钮，不锁字号画出来会比另外两家大一圈。改这个槽会同时改按钮文字与圆环。

**新增 1 个使用者覆盖槽**：`--xh-approval-loading-duration`。
