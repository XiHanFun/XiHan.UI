# 颜色选择器 <Badge type="info" text="color-picker" />

数据录入组件。三层同源：无头内核给出解剖与状态机，Vue 组件与自定义元素只是它的两层外壳，行为完全一致。

## 示例

### 基础用法

必备部件是 trigger / content / area / area-thumb，缺一个组件就不工作

<XhDemo src="color-picker/01-basic" />

### 受控

传了 value 就由宿主说了算，取色只回写不自改

<XhDemo src="color-picker/02-controlled" />

### 预设色板

swatches 给出常用色，选中即写回 value

<XhDemo src="color-picker/03-swatches" />

### 禁用

disabled 同时挡住触发器与面板内的所有交互

<XhDemo src="color-picker/04-disabled" />

## 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-color-picker>` |
| Vue 组件 | `XhColorPickerArea` `XhColorPickerAreaThumb` `XhColorPickerChannelInput` `XhColorPickerChannelSlider` `XhColorPickerChannelSliderThumb` `XhColorPickerChannelSliderTrack` `XhColorPickerContent` `XhColorPickerEyeDropperTrigger` `XhColorPickerLabel` `XhColorPickerPositioner` `XhColorPickerRoot` `XhColorPickerSwatch` `XhColorPickerSwatchGroup` `XhColorPickerSwatchItem` `XhColorPickerTrigger` `XhColorPickerValueText` |
| 组合式函数 | `useColorPicker` |
| 状态机 | `colorPickerMachine` |
| 皮肤 | `@xihan-ui/styled/color-picker.css` |

## 解剖

部件名即 `data-part` 属性值，也是皮肤的选择器。加粗的是必备部件，不渲染它组件不工作（Web Components 适配器会在诊断通道上报 `wc.missing-part`）。

`data-scope="color-picker"`：`root` · `label` · **`trigger`** · `value-text` · `swatch` · `positioner` · **`content`** · **`area`** · **`area-thumb`** · `channel-slider` · `channel-slider-track` · `channel-slider-thumb` · `channel-input` · `eye-dropper-trigger` · `swatch-group` · `swatch-item`

## Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `value` | `string` |  | 颜色值串。给定即受控：cell 直读 prop，写只发 onValueChange 不落内部值。 |
| `defaultValue` | `string` |  |  |
| `format` | `ColorPickerFormat` |  | 值串的写法，默认 hex。改它只改对外的序列化，工作色恒是 HSVA。 |
| `open` | `boolean` |  | 展开态。给定即受控：内部不再自改，只发 onOpenChange。 |
| `defaultOpen` | `boolean` |  |  |
| `disabled` | `boolean` |  | 整个控件禁用：trigger 与两个按钮走原生 disabled，取色区与滑杆退出 Tab 序列。 |
| `readOnly` | `boolean` |  | 只读：浮层照开（看得见当前颜色），但任何改值的动作都不发生。 |
| `swatches` | `string[]` |  | 预设色板。作者据此渲染 swatch-item，组件只负责标出哪一格正被选中。 |
| `alpha` | `boolean` |  | 带透明度，默认关。关掉时值串恒不透明，透明度那条滑杆与输入框整条禁用。 |
| `dir` | `Direction` |  | 文字方向。只改写横轴（取色区的饱和度、通道滑杆）上左右两键与指针的语义。 |
| `placement` | `Placement` |  |  |
| `offset` | `number` |  |  |
| `translations` | `Partial<ColorPickerTranslations>` |  |  |
| `onValueChange` | `(details: ColorPickerValueChangeDetails) => void` |  | value 变化意图回调；受控时是唯一出口，非受控随内部写入一并通知。 |
| `onOpenChange` | `(details: ColorPickerOpenChangeDetails) => void` |  | open 变化意图回调；受控时是唯一出口，非受控随内部转移一并通知。 |

## 状态机

**状态**：`closed` · `open` · `open.idle` · `open.dragging` · `open.picking`

**事件**：`OPEN` · `TOGGLE` · `CLOSE` · `CONTROLLED.OPEN` · `CONTROLLED.CLOSE` · `VALUE.SET` · `AREA.SET` · `AREA.STEP` · `AREA.TO_EDGE` · `CHANNEL.SET` · `CHANNEL.STEP` · `CHANNEL.TO_EDGE` · `INPUT.CHANGE` · `INPUT.COMMIT` · `DRAG.START` · `DRAG.MOVE` · `DRAG.END` · `EYE_DROPPER.OPEN` · `EYE_DROPPER.RESULT` · `EYE_DROPPER.CANCEL`

**判据**：`isOpenControlled` · `canInteract` · `canPick`

## connect API

`useColorPicker` 产出的对象。`getXxxProps()` 铺到对应部件的宿主元素上，其余是可读状态与操作入口。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `open` | `boolean` |  |
| `value` | `string` | 当前值串（与 onValueChange 送出的是同一个）。 |
| `rgba` | `ColorPickerRgba` |  |
| `hsva` | `ColorPickerHsva` | 工作色。取色区与色相滑杆读的都是它。 |
| `format` | `ColorPickerFormat` |  |
| `alpha` | `boolean` |  |
| `disabled` | `boolean` |  |
| `readOnly` | `boolean` |  |
| `dragging` | `boolean` | 指针正拖着某一处。 |
| `picking` | `boolean` | 屏幕取色正在进行。 |
| `eyeDropperSupported` | `boolean` |  |
| `swatches` | `string[]` | 预设色板（原样透传 swatches prop，缺省是空数组）。 |
| `isSwatchSelected` | `(value: string) => boolean` |  |
| `channelState` | `(channel: ColorPickerChannel) => ColorPickerChannelState` |  |
| `inputText` | `(channel: ColorPickerInputChannel) => string` | 某个数值框此刻该显示的字（有草稿显示草稿，否则显示规范文本）。 |
| `setOpen` | `(next: boolean) => void` |  |
| `setValue` | `(next: string) => void` |  |
| `getRootProps` | `() => T['element']` |  |
| `getLabelProps` | `() => T['label']` |  |
| `getTriggerProps` | `() => T['button']` |  |
| `getValueTextProps` | `() => T['element']` |  |
| `getSwatchProps` | `() => T['element']` |  |
| `getPositionerProps` | `() => T['element']` |  |
| `getContentProps` | `() => T['element']` |  |
| `getAreaProps` | `() => T['element']` |  |
| `getAreaThumbProps` | `() => T['element']` |  |
| `getChannelSliderProps` | `(props: ColorPickerChannelProps) => T['element']` |  |
| `getChannelSliderTrackProps` | `(props: ColorPickerChannelProps) => T['element']` |  |
| `getChannelSliderThumbProps` | `(props: ColorPickerChannelProps) => T['element']` |  |
| `getChannelInputProps` | `(props: ColorPickerInputProps) => T['input']` |  |
| `getEyeDropperTriggerProps` | `() => T['button']` |  |
| `getSwatchGroupProps` | `() => T['element']` |  |
| `getSwatchItemProps` | `(props: ColorPickerSwatchItemProps) => T['button']` |  |

## 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/slider/#keyboardinteraction)

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `ArrowRight` / `ArrowLeft` | focus in area-thumb, not disabled/readOnly | 按 1 调饱和度；RTL 下左右对调，语义恒是"朝饱和走一格" |
| `ArrowUp` / `ArrowDown` | focus in area-thumb, not disabled/readOnly | 按 1 调明度，屏幕向上恒是变亮，与 dir 无关 |
| `Shift+ArrowRight` / `Shift+ArrowLeft` / `Shift+ArrowUp` / `Shift+ArrowDown` | focus in area-thumb, not disabled/readOnly | 同上，但一步走 10 |
| `Home` / `End` | focus in area-thumb, not disabled/readOnly | 饱和度取 0 / 100（与 aria-valuenow 报的是同一条轴） |
| `ArrowRight` / `ArrowLeft` / `ArrowUp` / `ArrowDown` | focus in channel-slider-thumb, channel enabled | 按 1 调该通道；RTL 下左右对调，上下恒是"朝 max 走" |
| `Shift+ArrowRight` / `Shift+ArrowLeft` / `Shift+ArrowUp` / `Shift+ArrowDown` | focus in channel-slider-thumb, channel enabled | 同上，但一步走 10 |
| `Home` / `End` | focus in channel-slider-thumb, channel enabled | 该通道取 min / max（色相 0-360，透明度 0-100） |
| `Enter` | focus in channel-input | 收下框里的字；收不了（打了一半）就复原成规范文本。一并拦住表单提交 |
| `Escape` | open（本层在层栈顶） | 收起浮层，焦点归还触发器 |
