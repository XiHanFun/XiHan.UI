---
'@xihan-ui/headless': major
'@xihan-ui/styles': major
---

NumberField 增减钮改为悬停 / 聚焦时显出，精细指针下上下叠放：

- 两颗钮的 `data-xh-action-display` 由 `always` 改为 `hover-focus`，control 投影 `data-xh-action-owner`：可悬停的精细指针下平时收起，指针落到盒上或盒里有焦点时显出；粗指针与不能悬停的设备上照旧常显。钮不占 Tab 位，键盘 ↑ / ↓ 步进不受影响
- 精细指针下两颗钮上下叠在盒的逻辑末端（宽 `--xh-control-indicator-lg`、四周内收 4px、sm 档 2px、各占盒内高一半），显出时铺淡底、悬停 / 按下沿淡底阶梯升一档、两档，字形改为上下箭头、取 `--xh-control-indicator-sm`；盒的末端让出钮那一截，数值与后缀不排到钮底下。新增覆盖槽 `--xh-number-field-stepper-w`、`--xh-number-field-stepper-inset`、`--xh-number-field-stepper-bg`、`--xh-number-field-stepper-bg-hover`
- 钮字改取次要前景 `--xh-fg-muted`；数值改为从起始缘排起（`--xh-number-field-input-align` 缺省 `start`）
- 删除输入与动作组之间的分隔线及覆盖槽 `--xh-number-field-trigger-divider`、`--xh-number-field-trigger-divider-h`
- 皮肤体积随叠放档上调
