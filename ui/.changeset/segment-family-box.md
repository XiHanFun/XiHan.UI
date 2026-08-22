---
"@xihan-ui/headless": minor
"@xihan-ui/vue": minor
"@xihan-ui/web-components": minor
"@xihan-ui/styles": minor
---

四家分段控件（date-field · time-field · date-picker · time-picker）的盒内布局统一。

**解剖新增 `segment-group`**：包住全部段位与作者写在段间的分隔符。date-field / time-field /
time-picker 三家新增这个部件，date-picker 已有的分段容器 `input` 改名为它——四家从此同名同职。
time-picker 的 `input` 仍是段位本身（多实例），语义不动。

破坏性改动：

- `date-picker` 的 `input` 部件改名 `segment-group`，不留别名。
  - `getInputProps` → `getSegmentGroupProps`；`DatePickerInputProps` → `DatePickerSegmentGroupProps`。
  - Vue `XhDatePickerInput` → `XhDatePickerSegmentGroup`。
  - WC `@csspart input` → `@csspart segment-group`（作者标记写 `data-xh-part="segment-group"`）。
- `--xh-time-field-segment-fg-placeholder` → `--xh-time-field-placeholder-fg`；
  `--xh-time-picker-segment-fg-placeholder` → `--xh-time-picker-placeholder-fg`。
- `--xh-time-picker-column-max-h` → `--xh-time-picker-column-h`（列改定高）。
- `--xh-date-picker-content-p` → `--xh-date-picker-content-py` / `-px`；
  `--xh-time-picker-content-p` → `--xh-time-picker-content-py` / `-px`。

作者要把段位与分隔符挪进 `segment-group` 里，清空钮与展开钮留在 `control` 直属：

```html
<div data-xh-part="control">
  <div data-xh-part="segment-group">
    <span data-xh-part="segment"></span>
    <span>:</span>
    <span data-xh-part="segment"></span>
  </div>
  <button data-xh-part="clear-trigger"></button>
</div>
```

行为与外观：

- 尾部按钮一律靠框内末端，靠 `segment-group` 的 `flex: 1 1 auto` 顶；
  time-field 清空钮与 time-picker 展开钮的 `margin-inline-start: auto` 删掉。
- 四家 `control` 的 `gap` / `block-size` / `padding-inline` / `min-inline-size` 逐条同值，
  `gap` 随尺寸档走 `--xh-control-gap-sm/md/lg`。
- 时间列定高：`time-picker` 的 `column` 与 `date-picker` 的 `time-column` 走 `--xh-viewport-h-sm`，
  两家的快捷选项列同档；两家浮层补上最大高度。
- 段位内衬统一 `--xh-space-1`；标题不再写 `cursor`；`:focus-within` 一律带 `:not([data-disabled])`；
  time-picker 聚焦时补画聚焦环；图标尺寸随尺寸档走 `--xh-glyph-size-sm/md/lg`。
