---
"@xihan-ui/headless": minor
"@xihan-ui/vue": minor
"@xihan-ui/web-components": minor
"@xihan-ui/styles": minor
---

**反馈与状态族补十一项能力，全部是加法：不渲染新部件、不写新 prop 的既有用法逐值不变。**

**`alert` 补 `content` 与 `action` 两个部件。** `content` 是文本列容器，套上它标题与说明就排成真正的一列；不套时 root 那层 `flex-wrap` 的旧排法一字未动。`action` 是操作槽，圈出按钮区、自占一行——此前全族只有 `alert` 是「能关不能做」的一件。Vue 侧新增 `XhAlertContent` / `XhAlertAction`，Web Components 侧新增两个 `csspart`。新增覆盖槽 `--xh-alert-content-gap` 与 `--xh-alert-action-gap`。

**`toast` 补 `indicator` 与 `progress` 两个部件。** `indicator` 让作者换得掉那枚严重度字形：不渲染它时 root 伪元素上的兜底字形照旧，渲染了就由 `:has()` 让位，一行里不会出现两枚图形；部件为空时皮肤按 `data-severity` 画同一套兜底字形（`loading` 那一档连自转一起带上，并各自配了两块减弱动效停表）。`progress` 是倒计时条：连接层把机器算出的停留时长写进 `--xh-toast-progress-duration`，不自动消失的那些整条收起；指针悬停或焦点停留把计时按住时，动画随 `data-paused` 一并停住。新增 api 只读字段 `duration`，新增覆盖槽 `--xh-toast-progress-thickness` / `--xh-toast-progress-bg`。

**`notification` 补 `item-progress` 部件**，与 `toast` 的那条同一件事：横跨卡片、走同一条 `xh-countdown`、同样随 `data-paused` 停表。新增 api 只读字段 `duration`，新增覆盖槽 `--xh-notification-progress-thickness` / `-radius` / `-bg`。

`toast` 与 `notification` 的 `data-paused` 此前登记在 `check-dead-state-attr` 的「解剖里没有能承载停表的部件」名下，两条登记随这两个部件删除。

**`loading-bar` 补 `peg` 部件**：跟在进度段末端的一道亮边，作者也可以往里塞自己的图形。它是纯装饰，进度仍由 range 的宽度与 root 上的 `aria-valuenow` 表出；高对比档整层背景图被丢弃，这一档由 range 自己的底色接住。新增覆盖槽 `--xh-loading-bar-peg-w` / `-fg`。

**`empty-state` 补 `media` 部件**：插画槽，与图标槽二选一，尺寸另走一档（缺省由图标档翻一倍派生，跟着三个尺寸档走）。插画塞进按字形量的图标槽会被压到 40px 以下，这是它此前无处可放的原因。新增覆盖槽 `--xh-empty-state-media-size` / `-fg`。

**`empty-state` 补语气轴 `tone`**（六值，不写即维持中性）。写了就把图标区的强调色接到语气层派生好的前景档上；两条规则排在状态码那几条之后，`status` 与 `tone` 都写时以显式的语气为准。

**`spinner` 补形态轴 `variant`**（`ring` / `arc` / `dots`，缺省 `ring` 逐值等于现状）。`arc` 用锥形渐变加一圈环形遮罩画渐隐弧，转的还是同一条 `xh-spinner-rotate`；`dots` 是一行三点整组呼吸，自带 `xh-spinner-dots` 与两块减弱动效停表。高对比档会把整层背景图丢掉，两档在那一档里退回描边画法。

**`skeleton` 补动效轴 `animation`**（`shimmer` / `pulse` / `none`，缺省 `shimmer` 逐值等于现状），落在容器的 `data-animation` 上。`pulse` 撤掉微光那层、整根条子在原色与禁用档之间来回淡（自带 `xh-skeleton-pulse` 与两块停表），`none` 两层动效都撤掉只留底色。新增覆盖槽 `--xh-skeleton-pulse-duration`。

**`progress` 补语义轴 `semantics`**（`progress` / `meter`，缺省 `progress`）。`meter` 档发 `role="meter"` 并且 `indeterminate` 不再生效——磁盘占用、电量、评分这类量没有「未知」这一档。不新建组件：两者的皮肤逐行同构，拆开只会多出一份要同步维护的孪生皮肤。新增 api 只读字段 `semantics`。
