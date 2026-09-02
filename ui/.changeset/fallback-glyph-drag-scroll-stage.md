---
"@xihan-ui/tokens": minor
"@xihan-ui/styles": patch
---

**补齐**三处按钮的兜底字形。这三个部件的解剖里都没有第二个节点放图形，皮肤又没画，渲染出来是摸得着却看不见的空盒：`sortable` 的 `item-handle` 是一块透明方块、`thread` 的 `scroll-button` 是一枚带边框带阴影的空胶囊、`floating-panel` 的 `stage-trigger` 是标题栏上并排的两三个一模一样的空方块。名字只在 `aria-label` 上，看得见的那一路什么都没有。

- `sortable` 的 `item-handle` 画两条竖线的抓手，与 `tabs` 的 `tab-drag-trigger`、`table` 的 `column-drag-trigger` 同一种画法（`:empty::after` + `border-inline`）。新增覆盖槽 `--xh-sortable-handle-grip-w` / `--xh-sortable-handle-grip-h`。
- `thread` 的 `scroll-button` 画一枚向下的字形，逐条对齐同为「回到底部」的 `message-feed` 的 `scroll-button`。新增覆盖槽 `--xh-thread-icon-size`，作者塞进按钮的图标与皮肤画的兜底字形由此共用一把尺。
- `floating-panel` 的 `stage-trigger` 按 `data-target-stage` 分三档：还原、铺满、收拢各一枚。选的是 `data-target-stage` 而不是面板身上的 `data-stage`——后者说的是面板此刻在哪一档，用它会让并排的几颗钮同时换成同一枚字形。

**新增**两个字形令牌 `--xh-glyph-mark-maximize`（四角朝外）与 `--xh-glyph-mark-restore`（四角朝内），供上面那三档使用；「收拢」复用已有的 `--xh-glyph-mark-minus`。

示例侧同步删掉手打的字符：`sortable` 四份示例里的 `⠿`、`thread` 四份示例里手写的内联 `<svg>`、`floating-panel` 三份示例里的 `—` 与 `▢`。它们是缺兜底字形时的权宜之计，皮肤补上之后留着反而会把兜底顶掉。
