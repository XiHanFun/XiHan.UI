---
"@xihan-ui/headless": minor
"@xihan-ui/styles": minor
---

**四个条目集合浮层的面板不再窄于触发器。** select / popselect / combobox / tree-select 的浮层宽度此前只由静态档决定：`--xh-<组件>-content-min-w` 加一个 `--xh-overlay-max-w` 的上限，与触发器实际有多宽无关。控件被拉到 320px 时，展开的候选面板仍停在 200 出头，条目文字挤成两行，面板与它自己的触发框对不齐一条竖边。

定位引擎本来就在量锚点：开了 `size` 的浮层，结果里除 `availableWidth` / `availableHeight` 外还带一份 `anchorWidth`，只是从没有人接。现在这四家的连接层把它写成 positioner 上的内联自定义属性，皮肤的 content 拿它当最小宽的下界：

```css
min-inline-size: max(var(--xh-select-content-min-w, var(--xh-overlay-menu-min-w)), var(--xh-_select-anchor-w));
```

引擎没落位（或压根没有引擎）时该属性是 0，`max()` 取静态档，与改动前逐值相同。使用者槽仍排在最前：`--xh-<组件>-content-min-w` 写得比触发器还宽时以它为准。

接线名单只收「已接引擎 size 通道且 content 是条目集合」这四家。气泡类浮层（popover / tooltip / hover-card 一族）的宽度由正文长度决定，不该跟着锚点走，不在此列。
