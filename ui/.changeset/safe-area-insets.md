---
"@xihan-ui/styles": minor
---

**贴着视口边的七处让出安全区。**

带刘海、圆角与底部横条的移动视口上，屏幕四周有一段是系统占着的。此前全库 `env(safe-area-inset-*)` 零命中：轻提示与通知的摞只按 `--xh-toast-inset` / `--xh-notification-inset` 贴边，一角会被圆角切掉；回到顶部的钮与浮动按钮压在底部横条底下；顶部进度条整条藏在状态栏里；抽屉的首尾两行钻进状态栏；看图时的工具条与翻页钮贴在屏幕最边上。

改动的七处：`toast` / `notification` 的摞（内衬）、`back-top` 与 `float-button` 的四角贴边、`loading-bar` 的上沿、`drawer` 面板的内衬、`image-viewer` 那四件悬浮件的贴边。写法一律是 `max(<原来的贴边>, env(safe-area-inset-…))`——桌面上 `env()` 恒为 0，取值与原来完全一致，没有任何一处默认渲染变化。行内轴上两侧同取 `left` / `right` 里较宽的那一段：安全区只有物理方向的四个名字，分左右写在 RTL 下会翻错边。

挂在局部容器里的抽屉（`data-contained`）碰不到屏幕边，那一段让位收回去。居中的对话框同理不加。

新增门禁 `check-safe-area.mjs`：一份皮肤里被声明过 `position: fixed` 的部件，若还带着非零的贴边，那几条声明里必须至少有一条写了 `env(safe-area-inset-*)`；钉在铺满视口那一层上的悬浮件逐处登记，登记与放行两份名单都做过期反查。

`@xihan-ui/stylelint-config` 的长度白名单随之从 `calc()` 放宽到整族数学函数（`calc` / `min` / `max` / `clamp`）——里面藏的裸长度仍由禁用清单挡住，口径不变。
