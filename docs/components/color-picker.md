# ColorPicker <Badge type="info" text="颜色选择器" />

选一个颜色：色域面板加通道滑块，另有预设色板与屏幕取色。

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/color-picker" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/color-picker.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/color-picker" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/color-picker" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/color-picker.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## 用法

必备部件是 trigger / content / saturation-area / area-thumb，缺一个组件就不工作

<XhDemo src="color-picker/01-basic" />

## 示例

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

## 设计指引

### 何时使用

- 用户要自由指定颜色（主题定制、标注、画布）。

### 何时不用

- 可选颜色是固定的几种：用[单选组](./radio-group)配色块，或[选择器](./select)。

### 特性

- 必备部件是 `root` · `content` · `saturation-area` · `area-thumb`，缺一个组件就不工作。
- `format` 决定值串写法；面板里也可以让用户自己切换写法。
- `alpha` 打开透明度通道。
- 支持屏幕取色（依赖平台能力）与数值输入。
- 文本输入严格校验范围：不完整、非法或越界内容保留在输入框，并通过 `errors.input` / `onColorError` 明确报告；不会悄悄复原或夹回合法区间。
- 运行期未知 `format`、整体颜色解析失败与屏幕取色异常分别保存在 `errors.format`、`errors.parse`、`errors.eyeDropper`。`clearError()` 可显式清理；再次屏幕取色会先清掉上一轮取色相关诊断。
- 用户取消屏幕取色（`AbortError`）不是失败；接口抛错或拒绝才走 `eye-dropper` 错误。已经关闭或被下一轮替代的旧取色结果不会回写新值。
- 预设色板当前项由 `isSwatchSelected`、`aria-pressed` 与 `data-state=checked` 持久标识，不依赖悬停反馈。
- 输入框与通道输入保持实体表面，弹层使用 M2 磨砂背景、细顶光与统一边界阴影；顶光不覆盖取色区域，也不拦截鼠标。
- 色域、色相轨道和预设色板保留原色，磨砂只作用于浮层背后的内容，不通过整层透明度淡化静止状态下的颜色。
- 浮层按实际落位方向淡入并短距离移动，不缩放取色区域；收起时完整播放退场，再由适配器隐藏。
- 局部明暗主题随 Portal 传递。增强对比度和减少透明度沿用材质令牌切为实体表面；减弱动效缩短进出场并归零位移。

## 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-color-picker>` |
| Vue 组件 | `XhColorPickerAreaThumb` `XhColorPickerChannelInput` `XhColorPickerChannelSlider` `XhColorPickerChannelSliderThumb` `XhColorPickerChannelSliderTrack` `XhColorPickerContent` `XhColorPickerControl` `XhColorPickerEyeDropperTrigger` `XhColorPickerHiddenInput` `XhColorPickerLabel` `XhColorPickerPositioner` `XhColorPickerRoot` `XhColorPickerSaturationArea` `XhColorPickerSwatch` `XhColorPickerSwatchGroup` `XhColorPickerSwatchItem` `XhColorPickerTrigger` `XhColorPickerValueText` |
| 组合式函数 | `useColorPicker` |
| 状态机 | `colorPickerMachine` |
| 皮肤 | `@xihan-ui/styles/color-picker.css` |

## 解剖

部件名即 `data-part` 属性值，也是皮肤的选择器。加粗的是必备部件，不渲染它组件不工作（Web Components 适配器会在诊断通道上报 `wc.missing-part`）。

`data-scope="color-picker"`：`root` · `label` · `control` · **`trigger`** · `value-text` · `swatch` · `positioner` · **`content`** · **`saturation-area`** · **`area-thumb`** · `channel-slider` · `channel-slider-track` · `channel-slider-thumb` · `channel-input` · `eye-dropper-trigger` · `swatch-group` · `swatch-item` · `hidden-input`

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
| `onColorError` | `(details: ColorPickerErrorDetails) => void` |  | 格式、文本、颜色解析或屏幕取色失败；与 value/open 事件独立。 |

## 事件

自定义元素派发这些事件，Vue 组件对应同名 emit；载荷都在 `detail` 上。可双向绑定的值另有 `update:xxx`，见 Props。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `value-change` | `ColorPickerValueChangeDetails` | 颜色变化；detail 为 `{ value: string }` |
| `open-change` | `ColorPickerOpenChangeDetails` | open 状态变化；detail 为 `{ open: boolean }` |
| `color-error` | `ColorPickerErrorDetails` | 格式、输入、颜色解析或屏幕取色失败；detail 为判别式错误对象 |

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

**事件**：`OPEN` · `TOGGLE` · `CLOSE` · `CONTROLLED.OPEN` · `CONTROLLED.CLOSE` · `VALUE.SET` · `AREA.SET` · `AREA.STEP` · `AREA.TO_EDGE` · `CHANNEL.SET` · `CHANNEL.STEP` · `CHANNEL.TO_EDGE` · `INPUT.CHANGE` · `INPUT.COMMIT` · `DRAG.START` · `DRAG.MOVE` · `DRAG.END` · `EYE_DROPPER.OPEN` · `EYE_DROPPER.RESULT` · `EYE_DROPPER.CANCEL` · `EYE_DROPPER.ERROR` · `ERROR.CLEAR` · `FORM.RESET`

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
| `errors` | `ColorPickerErrors` | 格式、文本、颜色解析与屏幕取色四路互不覆盖的错误。 |
| `swatches` | `string[]` | 预设色板（原样透传 swatches prop，缺省是空数组）。 |
| `isSwatchSelected` | `(value: string) => boolean` |  |
| `channelState` | `(channel: ColorPickerChannel) => ColorPickerChannelState` |  |
| `inputText` | `(channel: ColorPickerInputChannel) => string` | 某个数值框此刻该显示的字（有草稿显示草稿，否则显示规范文本）。 |
| `setOpen` | `(next: boolean) => void` |  |
| `setValue` | `(next: string) => void` |  |
| `clearError` | `() => void` | 清掉四路显式错误；屏幕取色重试也会先清它自己那一路。 |
| `getRootProps` | `() => T['element']` |  |
| `getLabelProps` | `() => T['label']` |  |
| `getControlProps` | `() => T['element']` |  |
| `getTriggerProps` | `() => T['button']` |  |
| `getValueTextProps` | `() => T['element']` |  |
| `getSwatchProps` | `() => T['element']` |  |
| `getPositionerProps` | `() => T['element']` |  |
| `getContentProps` | `() => T['element']` |  |
| `getSaturationAreaProps` | `() => T['element']` |  |
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
| `PageUp` / `PageDown` | focus in channel-slider-thumb, channel enabled | 朝 max / min 各走 10，与 dir 无关 |
| `Home` / `End` | focus in channel-slider-thumb, channel enabled | 该通道取 min / max（色相 0-360，透明度 0-100） |
| `Enter` | focus in channel-input | 收下框里的字；收不了就保留草稿并报告输入错误。一并拦住表单提交 |
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
| `content` | `aria-hidden` | !open \|\| undefined |
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

`forced-colors: active` 下另有一套规则：颜色交给系统，边框与状态标记改用系统色关键字。

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
| `saturation-area` | `data-dragging` | ''（条件成立时才出现） |
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

<!-- xh-component-tokens:start -->
## CSS 变量

本组件公开覆盖槽由独立皮肤的实际消费位生成；缺省来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 缺省来源 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `--xh-color-picker-action-bg` | `eye-dropper-trigger` | `background` | `default` | `transparent` | color-picker 的 eye-dropper-trigger 部件 background 覆盖槽。 |
| `--xh-color-picker-action-bg-active` | `eye-dropper-trigger` | `background` | `active`<br>`not(:disabled)`<br>`state=picking` | `--xh-bg-subtle-active` | color-picker 的 eye-dropper-trigger 部件 background 覆盖槽。 |
| `--xh-color-picker-action-bg-hover` | `eye-dropper-trigger` | `background` | `hover`<br>`not(:disabled)` | `--xh-bg-subtle-hover` | color-picker 的 eye-dropper-trigger 部件 background 覆盖槽。 |
| `--xh-color-picker-action-border` | `eye-dropper-trigger` | `border` | `default` | `--xh-border-control` | color-picker 的 eye-dropper-trigger 部件 border 覆盖槽。 |
| `--xh-color-picker-action-border-active` | `eye-dropper-trigger` | `border-color` | `state=picking` | `--xh-bg-brand` | color-picker 的 eye-dropper-trigger 部件 border-color 覆盖槽。 |
| `--xh-color-picker-action-fg` | `eye-dropper-trigger` | `color` | `default` | `--xh-fg-muted` | color-picker 的 eye-dropper-trigger 部件 color 覆盖槽。 |
| `--xh-color-picker-action-fg-hover` | `eye-dropper-trigger` | `color` | `hover`<br>`not(:disabled)` | `--xh-fg-default` | color-picker 的 eye-dropper-trigger 部件 color 覆盖槽。 |
| `--xh-color-picker-action-font-size` | `eye-dropper-trigger` | `font-size` | `default` | `--xh-text-secondary-size` | color-picker 的 eye-dropper-trigger 部件 font-size 覆盖槽。 |
| `--xh-color-picker-action-radius` | `eye-dropper-trigger` | `border-radius` | `default` | `--xh-shape-control` | color-picker 的 eye-dropper-trigger 部件 border-radius 覆盖槽。 |
| `--xh-color-picker-action-size` | `eye-dropper-trigger` | `block-size`<br>`inline-size` | `default` | `--xh-control-action-size` | color-picker 的 eye-dropper-trigger 部件 block-size、inline-size 覆盖槽。 |
| `--xh-color-picker-checker` | `channel-slider` | `background-image` | `channel=alpha` | `--xh-color-neutral-300` | color-picker 的 channel-slider 部件 background-image 覆盖槽。 |
| `--xh-color-picker-content-backdrop` | `content` | `-webkit-backdrop-filter`<br>`backdrop-filter` | `default` | `--xh-material-frosted-backdrop` | color-picker 的 content 部件 -webkit-backdrop-filter、backdrop-filter 覆盖槽。 |
| `--xh-color-picker-content-bg` | `content` | `background` | `default` | `--xh-material-frosted-bg` | color-picker 的 content 部件 background 覆盖槽。 |
| `--xh-color-picker-content-border` | `content` | `border` | `default` | `--xh-material-frosted-border` | color-picker 的 content 部件 border 覆盖槽。 |
| `--xh-color-picker-content-fg` | `content` | `color` | `default` | `--xh-material-frosted-fg` | color-picker 的 content 部件 color 覆盖槽。 |
| `--xh-color-picker-content-gap` | `content` | `gap` | `default` | `--xh-space-3` | color-picker 的 content 部件 gap 覆盖槽。 |
| `--xh-color-picker-content-highlight` | `content` | `background` | `default` | `--xh-material-frosted-highlight` | color-picker 的 content 部件 background 覆盖槽。 |
| `--xh-color-picker-content-px` | `content` | `padding-inline` | `default` | `--xh-space-3` | color-picker 的 content 部件 padding-inline 覆盖槽。 |
| `--xh-color-picker-content-py` | `content` | `padding-block` | `default` | `--xh-space-3` | color-picker 的 content 部件 padding-block 覆盖槽。 |
| `--xh-color-picker-content-radius` | `content` | `border-radius` | `default` | `--xh-shape-surface` | color-picker 的 content 部件 border-radius 覆盖槽。 |
| `--xh-color-picker-content-shadow` | `content` | `box-shadow` | `default` | `--xh-material-frosted-shadow` | color-picker 的 content 部件 box-shadow 覆盖槽。 |
| `--xh-color-picker-content-w` | `content` | `inline-size` | `default` | `--xh-overlay-min-w` | color-picker 的 content 部件 inline-size 覆盖槽。 |
| `--xh-color-picker-control-bg` | `control` | `background` | `default` | `--xh-bg-canvas` | color-picker 的 control 部件 background 覆盖槽。 |
| `--xh-color-picker-control-bg-disabled` | `control` | `background` | `disabled` | `--xh-bg-subtle` | color-picker 的 control 部件 background 覆盖槽。 |
| `--xh-color-picker-control-bg-hover` | `control` | `background` | `disabled`<br>`hover`<br>`not([data-disabled], [data-readonly])`<br>`readonly` | `--xh-bg-subtle` | color-picker 的 control 部件 background 覆盖槽。 |
| `--xh-color-picker-control-bg-readonly` | `control` | `background` | `readonly` | `--xh-bg-subtle` | color-picker 的 control 部件 background 覆盖槽。 |
| `--xh-color-picker-control-border` | `control` | `border` | `default` | `--xh-border-control` | color-picker 的 control 部件 border 覆盖槽。 |
| `--xh-color-picker-control-border-focus` | `control` | `border-color` | `disabled`<br>`focus-within`<br>`not([data-disabled])` | `--xh-_tone` | color-picker 的 control 部件 border-color 覆盖槽。 |
| `--xh-color-picker-control-border-hover` | `control` | `border-color` | `disabled`<br>`hover`<br>`not([data-disabled], [data-readonly])`<br>`readonly` | `--xh-border-control-hover` | color-picker 的 control 部件 border-color 覆盖槽。 |
| `--xh-color-picker-control-fg` | `control` | `color` | `default` | `--xh-fg-default` | color-picker 的 control 部件 color 覆盖槽。 |
| `--xh-color-picker-control-gap` | `control` | `gap` | `default` | `--xh-_color-picker-gap` | color-picker 的 control 部件 gap 覆盖槽。 |
| `--xh-color-picker-control-h` | `control` | `block-size` | `default` | `--xh-_color-picker-h` | color-picker 的 control 部件 block-size 覆盖槽。 |
| `--xh-color-picker-control-min-w` | `control`<br>`root` | `min-inline-size` | `default` | `--xh-control-min-w` | color-picker 的 control、root 部件 min-inline-size 覆盖槽。 |
| `--xh-color-picker-control-px` | `control` | `padding-inline` | `default` | `--xh-_color-picker-px` | color-picker 的 control 部件 padding-inline 覆盖槽。 |
| `--xh-color-picker-control-radius` | `control` | `border-radius` | `default` | `--xh-shape-control` | color-picker 的 control 部件 border-radius 覆盖槽。 |
| `--xh-color-picker-control-shadow` | `control` | `box-shadow` | `default` | `--xh-elevation-raised` | color-picker 的 control 部件 box-shadow 覆盖槽。 |
| `--xh-color-picker-gap` | `root` | `gap` | `default` | `--xh-space-1` | color-picker 的 root 部件 gap 覆盖槽。 |
| `--xh-color-picker-input-bg` | `channel-input` | `background` | `default` | `--xh-bg-canvas` | color-picker 的 channel-input 部件 background 覆盖槽。 |
| `--xh-color-picker-input-bg-disabled` | `channel-input` | `background` | `disabled` | `--xh-bg-subtle` | color-picker 的 channel-input 部件 background 覆盖槽。 |
| `--xh-color-picker-input-bg-readonly` | `channel-input` | `background` | `readonly` | `--xh-bg-subtle` | color-picker 的 channel-input 部件 background 覆盖槽。 |
| `--xh-color-picker-input-border` | `channel-input` | `border` | `default` | `--xh-border-control` | color-picker 的 channel-input 部件 border 覆盖槽。 |
| `--xh-color-picker-input-border-focus` | `channel-input` | `border-color` | `focus-visible` | `--xh-_tone` | color-picker 的 channel-input 部件 border-color 覆盖槽。 |
| `--xh-color-picker-input-border-invalid` | `channel-input` | `border-color` | `invalid` | `--xh-border-invalid` | color-picker 的 channel-input 部件 border-color 覆盖槽。 |
| `--xh-color-picker-input-font-size` | `channel-input` | `font-size` | `default` | `--xh-text-secondary-size` | color-picker 的 channel-input 部件 font-size 覆盖槽。 |
| `--xh-color-picker-input-h` | `channel-input` | `block-size` | `default` | `--xh-control-h-sm` | color-picker 的 channel-input 部件 block-size 覆盖槽。 |
| `--xh-color-picker-input-px` | `channel-input` | `padding-inline` | `default` | `--xh-control-px-sm` | color-picker 的 channel-input 部件 padding-inline 覆盖槽。 |
| `--xh-color-picker-input-radius` | `channel-input` | `border-radius` | `default` | `--xh-shape-control` | color-picker 的 channel-input 部件 border-radius 覆盖槽。 |
| `--xh-color-picker-label-fg` | `label` | `color` | `default` | `--xh-fg-default` | color-picker 的 label 部件 color 覆盖槽。 |
| `--xh-color-picker-label-font-size` | `label` | `font-size` | `default` | `--xh-_color-picker-label-font-size` | color-picker 的 label 部件 font-size 覆盖槽。 |
| `--xh-color-picker-label-font-weight` | `label` | `font-weight` | `default` | `--xh-text-label-weight` | color-picker 的 label 部件 font-weight 覆盖槽。 |
| `--xh-color-picker-layer` | `positioner` | `z-index` | `default` | `--xh-_layer` | color-picker 的 positioner 部件 z-index 覆盖槽。 |
| `--xh-color-picker-max-h` | `content` | `max-block-size` | `default` | `--xh-viewport-h-md` | color-picker 的 content 部件 max-block-size 覆盖槽。 |
| `--xh-color-picker-saturation-area-h` | `saturation-area` | `block-size` | `default` | `9rem` | color-picker 的 saturation-area 部件 block-size 覆盖槽。 |
| `--xh-color-picker-saturation-area-radius` | `saturation-area` | `border-radius` | `default` | `--xh-shape-control` | color-picker 的 saturation-area 部件 border-radius 覆盖槽。 |
| `--xh-color-picker-swatch-border` | `swatch`<br>`swatch-item` | `border` | `default` | `--xh-border-default` | color-picker 的 swatch、swatch-item 部件 border 覆盖槽。 |
| `--xh-color-picker-swatch-border-hover` | `swatch-item` | `border-color` | `hover`<br>`not(:disabled)` | `--xh-border-strong` | color-picker 的 swatch-item 部件 border-color 覆盖槽。 |
| `--xh-color-picker-swatch-gap` | `swatch-group` | `gap` | `default` | `--xh-space-1` | color-picker 的 swatch-group 部件 gap 覆盖槽。 |
| `--xh-color-picker-swatch-item-size` | `swatch-item` | `block-size`<br>`inline-size` | `default` | `1.25rem` | color-picker 的 swatch-item 部件 block-size、inline-size 覆盖槽。 |
| `--xh-color-picker-swatch-radius` | `swatch`<br>`swatch-item` | `border-radius` | `default` | `--xh-shape-inset` | color-picker 的 swatch、swatch-item 部件 border-radius 覆盖槽。 |
| `--xh-color-picker-swatch-ring` | `swatch-item` | `outline` | `state=checked` | `--xh-bg-brand` | color-picker 的 swatch-item 部件 outline 覆盖槽。 |
| `--xh-color-picker-swatch-size` | `swatch` | `block-size`<br>`inline-size` | `default` | `18px` | color-picker 的 swatch 部件 block-size、inline-size 覆盖槽。 |
| `--xh-color-picker-thumb-border` | `area-thumb`<br>`channel-slider-thumb` | `border` | `default` | `--xh-color-neutral-0` | color-picker 的 area-thumb、channel-slider-thumb 部件 border 覆盖槽。 |
| `--xh-color-picker-thumb-radius` | `area-thumb`<br>`channel-slider-thumb` | `border-radius` | `default` | `--xh-shape-pill` | color-picker 的 area-thumb、channel-slider-thumb 部件 border-radius 覆盖槽。 |
| `--xh-color-picker-thumb-scale-dragging` | `area-thumb`<br>`channel-slider-thumb` | `scale` | `dragging` | `--xh-motion-scale-drag` | color-picker 的 area-thumb、channel-slider-thumb 部件 scale 覆盖槽。 |
| `--xh-color-picker-thumb-shadow` | `area-thumb`<br>`channel-slider-thumb` | `box-shadow` | `default` | `--xh-elevation-raised` | color-picker 的 area-thumb、channel-slider-thumb 部件 box-shadow 覆盖槽。 |
| `--xh-color-picker-thumb-size` | `area-thumb`<br>`channel-slider`<br>`channel-slider-thumb` | `block-size`<br>`inline-size`<br>`margin-block-start`<br>`margin-inline-start` | `default` | `14px` | color-picker 的 area-thumb、channel-slider、channel-slider-thumb 部件 block-size、inline-size、margin-block-start、margin-inline-start 覆盖槽。 |
| `--xh-color-picker-track-radius` | `channel-slider`<br>`channel-slider-track` | `border-radius` | `default` | `--xh-shape-pill` | color-picker 的 channel-slider、channel-slider-track 部件 border-radius 覆盖槽。 |
| `--xh-color-picker-track-thickness` | `channel-slider-track` | `block-size` | `default` | `8px` | color-picker 的 channel-slider-track 部件 block-size 覆盖槽。 |
| `--xh-color-picker-trigger-fg` | `trigger` | `color` | `default` | `--xh-fg-default` | color-picker 的 trigger 部件 color 覆盖槽。 |
| `--xh-color-picker-trigger-font-size` | `trigger` | `font-size` | `default` | `--xh-text-body-size` | color-picker 的 trigger 部件 font-size 覆盖槽。 |
| `--xh-color-picker-trigger-gap` | `trigger` | `gap` | `default` | `--xh-_color-picker-gap` | color-picker 的 trigger 部件 gap 覆盖槽。 |
| `--xh-color-picker-value-fg` | `value-text` | `color` | `default` | `--xh-fg-default` | color-picker 的 value-text 部件 color 覆盖槽。 |
| `--xh-color-picker-value-font-size` | `value-text` | `font-size` | `default` | `--xh-text-body-size` | color-picker 的 value-text 部件 font-size 覆盖槽。 |
<!-- xh-component-tokens:end -->

## 动效

关键帧 `xh-overlay-slide-in` · `xh-overlay-slide-out` 随皮肤自带，不引用别处文件里的名字；`background` · `border-color` · `scale` 走 `transition` 过渡。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

皮肤之外还有一段：退场由适配器的退场闸门把关，动画播完才真收起。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。

## RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像；另有按 `dir` 分支的规则。

## 组合

- 外面套[表单字段](./field)；预设色板走 `swatches`。

## 最佳实践

- 提供预设色板：绝大多数用户不需要在色域里精挑。
- 回显时同时给色块和色值串，色块用来看、值串用来复制。
- 监听 `onColorError` 给错误配可见说明；错误对象是诊断出口，不会自动替你渲染提示。

## 反模式

- 只给色域不给数值输入：用户手上有确切色值时无处可填。
- 在需要满足对比度的场景里放任意取色而不给对比度提示。
