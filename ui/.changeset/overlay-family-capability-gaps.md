---
"@xihan-ui/headless": minor
"@xihan-ui/vue": minor
"@xihan-ui/web-components": minor
"@xihan-ui/styles": minor
---

**浮层容器族的三处能力补齐**：全是加法，既有的部件名、槽名、props 与事件一个没动。

**`hover-card` 补 `title` / `description` 两个部件**（`XhHoverCardTitle` / `XhHoverCardDescription`，
Web Components 侧对应 `title` / `description` 两个 part）。卡片是 `role="dialog"`，它的可及名
此前恒取触发器：触发器是一张头像时，读屏念出来的对话框名字就是头像的替代文字。补上之后
`aria-labelledby` 指 `title`、`aria-describedby` 指 `description`。

**两个部件都不放的写法不受影响**：连接层现读 `getTitleEl` / `getDescriptionEl`，取不到节点
就把可及名指回触发器、也不发 `aria-describedby`，与升级前逐字一致。皮肤新增
`--xh-hover-card-title-*` 与 `--xh-hover-card-description-fg` 三支覆盖槽。

**`popconfirm` 补 `arrow` 部件**（`XhPopconfirmArrow` / `arrow` part）：它此前是族内唯一没有
尖角的锚定气泡，同一页上与 popover 并排时两者对不上。箭头坐标由它本来就在跑的 popover
机器给出，几何走共享的 `overlay-arrow.css`，皮肤只出底色与描边色，新增 `--xh-popconfirm-arrow-size`。
面板同批加了 `position: relative`——箭头的贴边要从面板自己的盒子起算。

**`tour` 补 `progress-indicator` / `progress-dot` 两个部件**（`XhTourProgressIndicator` /
`XhTourProgressDot`）：此前的进度只有 `progress-text` 一句话。圆点组挂 `aria-hidden`，
读屏仍走 `progress-text` 那一份；每颗圆点带 `data-index`，走过的带 `data-complete`、
当前那颗带 `data-current` 并拉成胶囊，换步时宽度与底色一起过渡。Vue 侧的
`XhTourProgressIndicator` 不写子节点时按 `steps` 的长度自己铺圆点，Web Components 侧由作者
逐个写节点、序号取节点上的 `index`（缺省按文档序）。新增 `--xh-tour-progress-indicator-gap`
与 `--xh-tour-progress-dot-bg` / `-bg-complete` / `-bg-current` 四支覆盖槽；
高对比档里走过的那几颗改由描边表出。
