---
'@xihan-ui/headless': major
'@xihan-ui/styles': major
'@xihan-ui/vue': major
'@xihan-ui/react': major
'@xihan-ui/web-components': major
---

Segmented 并入 RadioGroup：删除 Segmented 组件，改用 `RadioGroup` 的 `variant="segmented"`。两者都是 `radiogroup` / `radio` + `aria-checked`、都随表单提交，Segmented 的 props 只比 RadioGroup 多 `loop` 与 `block`，这两个随之并入 RadioGroup。不留兼容别名。

**删除（破坏性）**

- Headless：`connectSegmented`、`segmentedMachine`、`segmentedAnatomy`、`segmentedItemQuery`、`segmentedKeyboard`、`segmentedMeta` 与 `Segmented*` 全部类型；`translations` 里的 `segmented` 键。
- Vue / React：`XhSegmentedRoot`、`XhSegmentedItem`、`XhSegmentedItemIcon`、`XhSegmentedItemText`、`XhSegmentedIndicator`、`XhSegmentedHiddenInput`、`useSegmented`、`useSegmentedContext`、`useSegmentedItemContext` 及对应 props / 上下文类型。
- Web Components：`<xh-segmented>` 与 `XhSegmentedElement`。
- 样式：`@xihan-ui/styles/segmented.css` 与全部 `--xh-segmented-*` 组件槽。

**迁移**

- `<XhSegmentedRoot …>` → `<XhRadioGroupRoot variant="segmented" …>`，`collection`、`value` / `defaultValue`、`disabled`、`readOnly`、`invalid`、`required`、`name`、`orientation`、`dir`、`loop`、`block`、`tone`、`size` 原样沿用；`XhSegmentedIndicator` → `XhRadioGroupThumb`（部件名 `thumb`，避开行首单选圆圈 `indicator`），`XhSegmentedItemIcon` / `XhSegmentedItemText` → `XhRadioGroupItemIcon` / `XhRadioGroupItemText`。
- 隐藏输入改为每个条目一份原生 radio（与 RadioGroup 其余形态相同），不再写整组那一份 `hidden-input`；只传 `collection` 时由组件铺出。
- Web Components：`<xh-segmented>` → `<xh-radio-group variant="segmented">`，滑块写 `data-xh-part="thumb"`，条目用 `<div data-xh-part="item">` 而不是原生 `<button>`（按钮会把 Enter 翻成点击）。
- 组件槽：轨道 `--xh-segmented-bg / -border / -radius / -track-padding` → `--xh-radio-group-track-*`，段 `--xh-segmented-item-*` → `--xh-radio-group-segment-*`，滑块 `--xh-segmented-indicator-*` → `--xh-radio-group-thumb-*`，段内图标 `--xh-segmented-icon-size` → `--xh-radio-group-icon-size`。

**键盘统一到 APG 的单选组（破坏性）**

- segmented 形态按 Enter 不再选中、不再进按压面，Home / End 不再跳到首末段：单选组只有方向键在组内移动、Space 选中当前项。RadioGroup 原有形态的键盘不变。
- 未传 `dir` 时左右方向键按祖先链上的书写方向翻转（原 RadioGroup 缺省按 ltr），整页 rtl 而组件没传 `dir` 时方向键跟着视觉顺序走。

**RadioGroup 新增**

- `variant="segmented"`：一条淡底轨道（surface 圆角）里首尾相接的段，选中段由新部件 `thumb`（`XhRadioGroupThumb`）标出——白色抬起面，写了 `tone` 时换实心语气面；只有换段时才滑，首次落位、窗口缩放、换上正式字体的重量直接到位（`data-instant`），liquid 档由前后沿两支弹簧推着走。段坐在淡底承载面上悬停 200 → 按下 300、只换面不缩放，不投影 Action Control 配方；这一形态不画行首圆圈、缺省横排，`label` 部件视觉隐藏只作可及名，一行排不下时折行。RTL 下滑块位移乘 `--xh-direction-sign`。
- 新 props：`loop`（方向键尽头是否回绕，缺省 true）、`block`（segmented 形态撑满行宽、各段等分）。`orientation` 没传时随形态取缺省：list / card 竖排，segmented 横排。
- 新部件 `item-icon`（`XhRadioGroupItemIcon`）：条目文字前的图标位，对读屏隐藏，直径随尺寸档、颜色随条目；节点新增 `icon` 字段，只传 `collection` 时自动铺出。三种形态都可用，卡片与带说明的列表行里图标自成一列。
- connect API 新增 `variant`、`measure()`、`getThumbProps()`、`getItemIconProps()`；Headless 导出 `radioGroupItemQuery` 与类型 `RadioGroupRefs`、`RadioGroupThumbRect`。
- 新增组件槽 `--xh-radio-group-icon-size`、`--xh-radio-group-track-*`、`--xh-radio-group-segment-*`、`--xh-radio-group-thumb-*`。
