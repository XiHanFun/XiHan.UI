# 颜色选择器 <Badge type="info" text="color-picker" />

选一个颜色：色域面板加通道滑块，另有预设色板与屏幕取色。

## 何时使用

- 用户要自由指定颜色（主题定制、标注、画布）。

## 何时不用

- 可选颜色是固定的几种：用[单选组](./radio-group)配色块，或[选择器](./select)。

## 特性

- 必备部件是 `root` · `content` · `area` · `area-thumb`，缺一个组件就不工作。
- `format` 决定值串写法；面板里也可以让用户自己切换写法。
- `alpha` 打开透明度通道。
- 支持屏幕取色（依赖平台能力）与数值输入。

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
| Vue 组件 | `XhColorPickerArea` `XhColorPickerAreaThumb` `XhColorPickerChannelInput` `XhColorPickerChannelSlider` `XhColorPickerChannelSliderThumb` `XhColorPickerChannelSliderTrack` `XhColorPickerContent` `XhColorPickerControl` `XhColorPickerEyeDropperTrigger` `XhColorPickerHiddenInput` `XhColorPickerLabel` `XhColorPickerPositioner` `XhColorPickerRoot` `XhColorPickerSwatch` `XhColorPickerSwatchGroup` `XhColorPickerSwatchItem` `XhColorPickerTrigger` `XhColorPickerValueText` |
| 组合式函数 | `useColorPicker` |
| 状态机 | `colorPickerMachine` |
| 皮肤 | `@xihan-ui/styles/color-picker.css` |

## 解剖

部件名即 `data-part` 属性值，也是皮肤的选择器。加粗的是必备部件，不渲染它组件不工作（Web Components 适配器会在诊断通道上报 `wc.missing-part`）。

`data-scope="color-picker"`：`root` · `label` · `control` · **`trigger`** · `value-text` · `swatch` · `positioner` · **`content`** · **`area`** · **`area-thumb`** · `channel-slider` · `channel-slider-track` · `channel-slider-thumb` · `channel-input` · `eye-dropper-trigger` · `swatch-group` · `swatch-item` · `hidden-input`

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
| `size` | `Size` |  | 尺寸：sm / md / lg。 |
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

## 状态

对外可见的状态落在 `data-state` 上，写样式与断言都读它：

| 部件 | 取值 |
| --- | --- |
| `positioner` | 'open' \| 'closed' |
| `eye-dropper-trigger` | 'picking' \| 'open' \| 'closed' |
| `swatch-item` | 'checked' \| 'unchecked' |

状态机内部转移，写样式与业务都用不到；要监听变化请看上面的「事件」。

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
| `getControlProps` | `() => T['element']` |  |
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

## 无障碍

下面这些由 `connect` 铺到部件上，作者不必自己写；重复写反而会覆盖掉正确值。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `trigger` | `aria-controls` | `content` 部件的 id |
| `trigger` | `aria-expanded` | 'true' \| 'false' |
| `trigger` | `aria-haspopup` | 'dialog' |
| `trigger` | `aria-labelledby` | `label` 部件的 id `value-text` 部件的 id |
| `swatch` | `aria-hidden` | 'true' |
| `content` | `aria-labelledby` | `label` 部件的 id |
| `content` | `aria-modal` | 'false' |
| `content` | `role` | 'dialog' |
| `area-thumb` | `aria-disabled` | 'true' \| 'false' |
| `area-thumb` | `aria-label` | label.area |
| `area-thumb` | `aria-valuemax` | '100' |
| `area-thumb` | `aria-valuemin` | '0' |
| `area-thumb` | `aria-valuenow` | String(Math.round(hsva.s)) |
| `area-thumb` | `aria-valuetext` | label.areaValueText(Math.round(hsva.s), Math.round(hs… |
| `area-thumb` | `role` | 'slider' |
| `channel-slider-thumb` | `aria-disabled` | 'true' \| 'false' |
| `channel-slider-thumb` | `aria-label` | label.channel(channel) |
| `channel-slider-thumb` | `aria-orientation` | 'horizontal' |
| `channel-slider-thumb` | `aria-valuemax` | String(info.max) |
| `channel-slider-thumb` | `aria-valuemin` | String(info.min) |
| `channel-slider-thumb` | `aria-valuenow` | String(info.value) |
| `channel-slider-thumb` | `aria-valuetext` | label.channelValueText(channel, info.value) |
| `channel-slider-thumb` | `role` | 'slider' |
| `channel-input` | `aria-invalid` | 'true' \| 'false' |
| `channel-input` | `aria-label` | label.input(channel) |
| `eye-dropper-trigger` | `aria-label` | label.eyeDropperTrigger |
| `swatch-group` | `aria-label` | label.swatchGroup |
| `swatch-group` | `role` | 'group' |
| `swatch-item` | `aria-label` | label.swatch(swatch) |
| `swatch-item` | `aria-pressed` | 'true' \| 'false' |

## 样式

默认皮肤 `@xihan-ui/styles/color-picker.css` 按部件选择：`[data-scope="color-picker"][data-part="root"]`。它落在 `xihan.components` 与 `xihan.motion` 层；业务样式不写进 `@layer` 即高于全部库层，要按层压过来就写进 `xihan.overrides`。

## 数据属性

由 `connect` 产出并铺到部件上，皮肤与测试都据此选择；`data-disabled` 这类无值属性在条件不成立时整个不出现。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-size` | props.size |
| `swatch` | `data-value` | context.get('value') |
| `positioner` | `data-hidden` | ''（条件成立时才出现） |
| `positioner` | `data-placement` | 定位引擎算出的实际落位 |
| `positioner` | `data-positioned` | ''（条件成立时才出现） |
| `positioner` | `data-size` | props.size |
| `positioner` | `data-state` | 'open' \| 'closed' |
| `content` | `data-placement` | 定位引擎算出的实际落位 |
| `area` | `data-dragging` | ''（条件成立时才出现） |
| `area-thumb` | `data-dragging` | ''（条件成立时才出现） |
| `channel-slider` | `data-channel` | channel |
| `channel-slider` | `data-disabled` | ''（条件成立时才出现） |
| `channel-slider` | `data-dragging` | ''（条件成立时才出现） |
| `channel-slider-track` | `data-channel` | channel |
| `channel-slider-track` | `data-disabled` | ''（条件成立时才出现） |
| `channel-slider-thumb` | `data-channel` | channel |
| `channel-slider-thumb` | `data-disabled` | ''（条件成立时才出现） |
| `channel-slider-thumb` | `data-dragging` | ''（条件成立时才出现） |
| `channel-input` | `data-channel` | channel |
| `channel-input` | `data-invalid` | ''（条件成立时才出现） |
| `eye-dropper-trigger` | `data-disabled` | ''（条件成立时才出现） |
| `eye-dropper-trigger` | `data-state` | 'picking' \| 'open' \| 'closed' |
| `swatch-item` | `data-disabled` | ''（条件成立时才出现） |
| `swatch-item` | `data-state` | 'checked' \| 'unchecked' |

## CSS 变量

本组件皮肤读的组件级令牌，写在组件自身或任意祖先上都生效。缺省值来自[设计令牌](../guide/theme)，不设即按缺省走。

`--xh-color-picker-action-bg` · `--xh-color-picker-action-bg-active` · `--xh-color-picker-action-bg-hover` · `--xh-color-picker-action-border` · `--xh-color-picker-action-border-active` · `--xh-color-picker-action-fg` · `--xh-color-picker-action-fg-hover` · `--xh-color-picker-action-font-size` · `--xh-color-picker-action-radius` · `--xh-color-picker-action-size` · `--xh-color-picker-area-h` · `--xh-color-picker-area-radius` · `--xh-color-picker-checker` · `--xh-color-picker-content-bg` · `--xh-color-picker-content-border` · `--xh-color-picker-content-fg` · `--xh-color-picker-content-gap` · `--xh-color-picker-content-px` · `--xh-color-picker-content-py` · `--xh-color-picker-content-radius` · `--xh-color-picker-content-shadow` · `--xh-color-picker-content-w` · `--xh-color-picker-control-bg` · `--xh-color-picker-control-bg-disabled` · `--xh-color-picker-control-bg-readonly` · `--xh-color-picker-control-border` · `--xh-color-picker-control-border-focus` · `--xh-color-picker-control-border-hover` · `--xh-color-picker-control-fg` · `--xh-color-picker-control-gap` · `--xh-color-picker-control-h` · `--xh-color-picker-control-min-w` · `--xh-color-picker-control-px` · `--xh-color-picker-control-radius` · `--xh-color-picker-control-shadow` · `--xh-color-picker-gap` · `--xh-color-picker-input-bg` · `--xh-color-picker-input-bg-disabled` · `--xh-color-picker-input-bg-readonly` · `--xh-color-picker-input-border` · `--xh-color-picker-input-border-focus` · `--xh-color-picker-input-border-invalid` · `--xh-color-picker-input-font-size` · `--xh-color-picker-input-h` · `--xh-color-picker-input-px` · `--xh-color-picker-input-radius` · `--xh-color-picker-label-fg` · `--xh-color-picker-label-font-size` · `--xh-color-picker-label-font-weight` · `--xh-color-picker-layer` · `--xh-color-picker-max-h` · `--xh-color-picker-swatch-border` · `--xh-color-picker-swatch-gap` · `--xh-color-picker-swatch-item-size` · `--xh-color-picker-swatch-radius` · `--xh-color-picker-swatch-ring` · `--xh-color-picker-swatch-size` · `--xh-color-picker-thumb-border` · `--xh-color-picker-thumb-radius` · `--xh-color-picker-thumb-scale-dragging` · `--xh-color-picker-thumb-shadow` · `--xh-color-picker-thumb-size` · `--xh-color-picker-track-radius` · `--xh-color-picker-track-thickness` · `--xh-color-picker-trigger-fg` · `--xh-color-picker-trigger-font-size` · `--xh-color-picker-trigger-gap` · `--xh-color-picker-value-fg` · `--xh-color-picker-value-font-size`

## 动效

关键帧 `xh-pop-in` · `xh-pop-out` 随皮肤自带，不引用别处文件里的名字；状态切换走 `transition`。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。

## RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像；另有按 `dir` 分支的规则。

## 组合

- 外面套[表单字段](./field)；预设色板走 `swatches`。

## 最佳实践

- 提供预设色板：绝大多数用户不需要在色域里精挑。
- 回显时同时给色块和色值串，色块用来看、值串用来复制。

## 反模式

- 只给色域不给数值输入：用户手上有确切色值时无处可填。
- 在需要满足对比度的场景里放任意取色而不给对比度提示。
