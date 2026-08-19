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

### 透明度

alpha 打开后多一条透明度滑杆，值串跟着带上透明度；关掉时透明度恒是不透明，那条滑杆整条不可用

<XhDemo src="color-picker/05-alpha" />

### 值串写法

format 只决定对外的序列化，工作色始终是同一套；三种写法各挑一个色，改动后按各自的写法产出

<XhDemo src="color-picker/06-format" />

### 数值输入与屏幕取色

四个数值框各管一路，回车才收下，收不下的留着草稿并标红；宿主环境没有取色接口时那个按钮自己禁用

<XhDemo src="color-picker/07-inputs" />

### 空态与面板按钮

受控时「没有颜色」由宿主表达：值置空，触发器换成占位方框；面板底下的两个按钮是作者自己的，收起浮层同样归宿主

<XhDemo src="color-picker/08-clearable" />

### 随表单提交

值串的表单出口由作者自己挂：把当前值写进一份 input[type=hidden] 就带得走；浮层就地渲染，节点始终留在 form 里

<XhDemo src="color-picker/09-form" />

### 面板里切换写法

format 只管对外的序列化：换过之后把当前值原样写回一次，值串就改按新写法产出，工作色一点不动

<XhDemo src="color-picker/10-format-switch" />

## 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-color-picker>` |
| Vue 组件 | `XhColorPickerArea` `XhColorPickerAreaThumb` `XhColorPickerChannelInput` `XhColorPickerChannelSlider` `XhColorPickerChannelSliderThumb` `XhColorPickerChannelSliderTrack` `XhColorPickerContent` `XhColorPickerEyeDropperTrigger` `XhColorPickerHiddenInput` `XhColorPickerLabel` `XhColorPickerPositioner` `XhColorPickerRoot` `XhColorPickerSwatch` `XhColorPickerSwatchGroup` `XhColorPickerSwatchItem` `XhColorPickerTrigger` `XhColorPickerValueText` |
| 组合式函数 | `useColorPicker` |
| 状态机 | `colorPickerMachine` |
| 皮肤 | `@xihan-ui/styles/color-picker.css` |

## 解剖

部件名即 `data-part` 属性值，也是皮肤的选择器。加粗的是必备部件，不渲染它组件不工作（Web Components 适配器会在诊断通道上报 `wc.missing-part`）。

`data-scope="color-picker"`：`root` · `label` · **`trigger`** · `value-text` · `swatch` · `positioner` · **`content`** · **`area`** · **`area-thumb`** · `channel-slider` · `channel-slider-track` · `channel-slider-thumb` · `channel-input` · `eye-dropper-trigger` · `swatch-group` · `swatch-item` · `hidden-input`

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
| `name` | `string` |  | 表单字段名；给了表单影子才带 name 并参与提交。 |
| `alpha` | `boolean` |  | 带透明度，默认关。关掉时值串恒不透明，透明度那条滑杆与输入框整条禁用。 |
| `dir` | `Direction` |  | 文字方向。只改写横轴（取色区的饱和度、通道滑杆）上左右两键与指针的语义。 |
| `placement` | `Placement` |  |  |
| `offset` | `number` |  |  |
| `translations` | `Partial<ColorPickerTranslations>` |  |  |
| `onValueChange` | `(details: ColorPickerValueChangeDetails) => void` |  | value 变化意图回调；受控时是唯一出口，非受控随内部写入一并通知。 |
| `onOpenChange` | `(details: ColorPickerOpenChangeDetails) => void` |  | open 变化意图回调；受控时是唯一出口，非受控随内部转移一并通知。 |

## 事件

自定义元素派发这些事件，Vue 组件对应同名 emit；载荷都在 `detail` 上。可双向绑定的值另有 `update:xxx`，见 Props。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `value-change` | `ColorPickerValueChangeDetails` | 颜色变化；detail 为 `{ value: string }` |
| `open-change` | `ColorPickerOpenChangeDetails` | open 状态变化；detail 为 `{ open: boolean }` |

## 插槽

作者能拿到载荷的插槽。只转发内容、不带载荷的默认插槽不在此列——那类直接写子节点即可。

| Vue 组件 | 插槽 | 载荷 | 说明 |
| --- | --- | --- | --- |
| `XhColorPickerRoot` | `default` | `ColorPickerRootSlotProps` |  |

## 状态机

内部转移，写样式与业务都用不到；要监听变化请看上面的「事件」。

**状态**：`closed` · `open` · `open.idle` · `open.dragging` · `open.picking`

**事件**：`OPEN` · `TOGGLE` · `CLOSE` · `CONTROLLED.OPEN` · `CONTROLLED.CLOSE` · `VALUE.SET` · `AREA.SET` · `AREA.STEP` · `AREA.TO_EDGE` · `CHANNEL.SET` · `CHANNEL.STEP` · `CHANNEL.TO_EDGE` · `INPUT.CHANGE` · `INPUT.COMMIT` · `DRAG.START` · `DRAG.MOVE` · `DRAG.END` · `EYE_DROPPER.OPEN` · `EYE_DROPPER.RESULT` · `EYE_DROPPER.CANCEL` · `FORM.RESET`

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
| `getHiddenInputProps` | `() => T['input']` | 表单影子：值随表单提交。给了 name 才带 name，不给就不参与提交。 |

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

## CSS 变量

本组件皮肤读的组件级令牌，写在组件自身或任意祖先上都生效。缺省值来自[设计令牌](../guide/theme)，不设即按缺省走。

`--xh-color-picker-action-bg` · `--xh-color-picker-action-bg-active` · `--xh-color-picker-action-bg-hover` · `--xh-color-picker-action-border` · `--xh-color-picker-action-border-active` · `--xh-color-picker-action-fg` · `--xh-color-picker-action-fg-hover` · `--xh-color-picker-action-font-size` · `--xh-color-picker-action-radius` · `--xh-color-picker-action-size` · `--xh-color-picker-area-h` · `--xh-color-picker-area-radius` · `--xh-color-picker-checker` · `--xh-color-picker-content-bg` · `--xh-color-picker-content-border` · `--xh-color-picker-content-fg` · `--xh-color-picker-content-gap` · `--xh-color-picker-content-p` · `--xh-color-picker-content-radius` · `--xh-color-picker-content-shadow` · `--xh-color-picker-content-w` · `--xh-color-picker-gap` · `--xh-color-picker-input-bg` · `--xh-color-picker-input-bg-disabled` · `--xh-color-picker-input-bg-readonly` · `--xh-color-picker-input-border` · `--xh-color-picker-input-border-focus` · `--xh-color-picker-input-border-invalid` · `--xh-color-picker-input-font-size` · `--xh-color-picker-input-h` · `--xh-color-picker-input-px` · `--xh-color-picker-input-radius` · `--xh-color-picker-label-fg` · `--xh-color-picker-label-font-size` · `--xh-color-picker-label-font-weight` · `--xh-color-picker-max-h` · `--xh-color-picker-swatch-border` · `--xh-color-picker-swatch-gap` · `--xh-color-picker-swatch-item-size` · `--xh-color-picker-swatch-radius` · `--xh-color-picker-swatch-ring` · `--xh-color-picker-swatch-size` · `--xh-color-picker-thumb-border` · `--xh-color-picker-thumb-radius` · `--xh-color-picker-thumb-scale-dragging` · `--xh-color-picker-thumb-shadow` · `--xh-color-picker-thumb-size` · `--xh-color-picker-track-radius` · `--xh-color-picker-track-thickness` · `--xh-color-picker-trigger-bg` · `--xh-color-picker-trigger-bg-disabled` · `--xh-color-picker-trigger-bg-readonly` · `--xh-color-picker-trigger-border` · `--xh-color-picker-trigger-border-hover` · `--xh-color-picker-trigger-fg` · `--xh-color-picker-trigger-font-size` · `--xh-color-picker-trigger-gap` · `--xh-color-picker-trigger-h` · `--xh-color-picker-trigger-min-w` · `--xh-color-picker-trigger-px` · `--xh-color-picker-trigger-radius` · `--xh-color-picker-value-fg` · `--xh-color-picker-value-font-size`
