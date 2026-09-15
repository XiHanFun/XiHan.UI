# ColorPicker 颜色选择器 <Badge type="info" text="alpha" />

在色域中自由选取一个颜色：触发按钮显示当前色，浮层内包含取色面、色相与透明度两条滑块、数值框、屏幕取色与预设色板。它是颜色家族的组合件：两条滑块是[颜色滑块](./color-slider)，预设色板是[颜色色块选择器](./color-swatch-picker)，触发按钮内的色块与[颜色色块](./color-swatch)同族；只需要其中一件时不使用完整的选择器。

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/color-picker" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/color-picker.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/color-picker" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/color-picker" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/color-picker.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## 用法

取色面挑饱和度与明度，下面一条色相滑块；滑块是内嵌的颜色滑块组件，Vue / React 的挂载点不写子节点即自动铺开

<XhDemo src="color-picker/01-basic" />

## 组件结构

加粗的是必需部件。

`data-scope="color-picker"`：`root` · `label` · `control` · **`trigger`** · `value-text` · `swatch` · `positioner` · **`content`** · **`saturation-area`** · **`area-thumb`** · `hue-slider` · `alpha-slider` · `channel-input` · `eye-dropper-trigger` · `swatch-picker` · `hidden-input`

## 示例

### 预设色板

swatches 给一组常用颜色，浮层里内嵌一台色块选择器：方向键在格子间走、按颜色比选中

<XhDemo src="color-picker/02-swatches" />

### 禁用

禁止更改颜色

<XhDemo src="color-picker/03-disabled" />

### 透明度

alpha 开启后值串带透明度，浮层里多一条透明度滑块；两条滑块共用同一份工作色，推色相不会把透明度归 1

<XhDemo src="color-picker/04-alpha" />

### 精确输入

输入色值或使用屏幕取色

<XhDemo src="color-picker/05-inputs" />

## 设计指引

### 何时使用

- 用户需要自定义主题色、标注色或画布颜色，且不限于固定选项。
- 既需要可视化挑选（取色面、滑块）也需要精确输入（十六进制、分量框）。
- 需要从屏幕取色。

### 何时不用

- 只从几个固定颜色中选一个时，使用[颜色色块选择器](./color-swatch-picker)。
- 只调整一个通道（色相、透明度）时，使用[颜色滑块](./color-slider)。
- 用户已知颜色串并直接输入时，使用[颜色字段](./color-field)。
- 只展示一个颜色时，使用[颜色色块](./color-swatch)。

### 特性

- 工作色始终是 HSVA：取色面两轴是饱和度与明度，纯黑与灰度处的色相由锚点保持，拖到黑色再拉回时色相不丢失。
- `format` 决定值串写法（hex / rgba / hsla），`alpha` 决定是否带透明度；关闭时透明度滑块与输入框整体禁用。
- 色相与透明度两条滑块是内嵌的颜色滑块：整份工作色交给它们，调整色相不会把透明度归 1；键盘（方向键、PageUp / PageDown、Home / End、Shift 大步）与拖动都由滑块自身处理。
- 预设色板是内嵌的色块选择器：方向键在格子间移动并选中，当前颜色所在格按颜色比较（写法不同也能匹配）。
- 数值框输入只保留草稿，可解析时立即取值；不可解析时保留原文并报输入错误，回车同时拦截表单提交。
- 屏幕取色通过浮层内的按钮触发，环境不提供 EyeDropper 时始终禁用；取到的颜色与色板、外部 setValue 走同一条取值路径。
- 格式、输入、颜色解析与屏幕取色四路错误相互独立，修正一路不影响其他路。
- 受控 `value` 与 `open`：宿主不写回时界面不变化，回调照常发出；表单出口经 `hidden-input` 提交当前值串。

### 组合

- 三个挂载点 `hue-slider` / `alpha-slider` / `swatch-picker` 同时充当内嵌组件的根节点，内部放置的是[颜色滑块](./color-slider)与[颜色色块选择器](./color-swatch-picker)自己的部件；不写子节点时自动铺开最简结构。
- 放入[表单字段](./field)承接标题、说明与错误信息，`disabled` / `readOnly` 随字段下发。
- 与[颜色字段](./color-field)并排：选择器挑颜色，字段显示并微调该值。

### 最佳实践

- 通过 `swatches` 提供常用色，多数用户从这里即可完成选择。
- 触发按钮内同时放色块与值串，读屏与视觉各有一路。
- 需要精确输入时放数值框；一个十六进制框比四个分量框更节省空间。

### 反模式

- 只显示颜色不显示数值，颜色不能是唯一的信息通道。
- 有对比度要求的场景不提供校验反馈。
- 关闭 `alpha` 后仍保留透明度滑块，整条禁用的控件只会造成困惑。

## API 参考

### 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-color-picker>` |
| Vue 组件 | `XhColorPickerAlphaSlider` `XhColorPickerAreaThumb` `XhColorPickerChannelInput` `XhColorPickerContent` `XhColorPickerControl` `XhColorPickerEyeDropperTrigger` `XhColorPickerHiddenInput` `XhColorPickerHueSlider` `XhColorPickerLabel` `XhColorPickerPositioner` `XhColorPickerRoot` `XhColorPickerSaturationArea` `XhColorPickerSwatch` `XhColorPickerSwatchPicker` `XhColorPickerTrigger` `XhColorPickerValueText` |
| 组合式函数 | `useColorPicker` |
| 状态机 | `colorPickerMachine` |
| 皮肤 | `@xihan-ui/styles/color-picker.css` |

### Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `value` | `string` |  | 颜色值串。给定即受控：cell 直读 prop，写只发 onValueChange 不落内部值。 |
| `defaultValue` | `string` |  |  |
| `format` | `ColorFormat` |  | 值串的写法，默认 hex。改它只改对外的序列化，工作色恒是 HSVA。 |
| `open` | `boolean` |  | 展开态。给定即受控：内部不再自改，只发 onOpenChange。 |
| `defaultOpen` | `boolean` |  |  |
| `disabled` | `boolean` |  | 整个控件禁用：trigger 与两个按钮走原生 disabled，取色区与滑杆退出 Tab 序列。 |
| `readOnly` | `boolean` |  | 只读：浮层照开（看得见当前颜色），但任何改值的动作都不发生。 |
| `swatches` | `string[]` |  | 预设色板：交给内嵌的色块选择器铺格，选中的那一格按颜色比。 |
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

### 事件

自定义元素将载荷放在 `detail`；Vue 使用同名 emit。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `value-change` | `ColorPickerValueChangeDetails` | 颜色变化；detail 为 `{ value: string }` |
| `open-change` | `ColorPickerOpenChangeDetails` | open 状态变化；detail 为 `{ open: boolean }` |
| `color-error` | `ColorPickerErrorDetails` | 格式、输入、颜色解析或屏幕取色失败；detail 为判别式错误对象 |

### 插槽

仅列出带载荷的插槽。

| Vue 组件 | 插槽 | 载荷 | 说明 |
| --- | --- | --- | --- |
| `XhColorPickerRoot` | `default` | `ColorPickerRootSlotProps` |  |

### 状态

公开状态写入 `data-state`。

| 部件 | 取值 |
| --- | --- |
| `positioner` | 'open' \| 'closed' |
| `eye-dropper-trigger` | 'picking' \| 'open' \| 'closed' |

以下名称仅用于内部状态机。

**状态**：`closed` · `open` · `open.idle` · `open.dragging` · `open.picking`

**事件**：`OPEN` · `TOGGLE` · `CLOSE` · `CONTROLLED.OPEN` · `CONTROLLED.CLOSE` · `VALUE.SET` · `AREA.SET` · `AREA.STEP` · `AREA.TO_EDGE` · `HSVA.SET` · `INPUT.CHANGE` · `INPUT.COMMIT` · `DRAG.START` · `DRAG.MOVE` · `DRAG.END` · `EYE_DROPPER.OPEN` · `EYE_DROPPER.RESULT` · `EYE_DROPPER.CANCEL` · `EYE_DROPPER.ERROR` · `ERROR.CLEAR` · `FORM.RESET`

**判据**：`isOpenControlled` · `canInteract` · `canPick`

### connect API

`getXxxProps()` 返回对应部件的宿主属性。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `open` | `boolean` |  |
| `value` | `string` | 当前值串（与 onValueChange 送出的是同一个）。 |
| `rgba` | `ColorRgba` |  |
| `hsva` | `ColorHsva` | 工作色。取色区与色相滑杆读的都是它。 |
| `format` | `ColorFormat` |  |
| `alpha` | `boolean` |  |
| `disabled` | `boolean` |  |
| `readOnly` | `boolean` |  |
| `dragging` | `boolean` | 指针正拖着某一处。 |
| `picking` | `boolean` | 屏幕取色正在进行。 |
| `eyeDropperSupported` | `boolean` |  |
| `errors` | `ColorPickerErrors` | 格式、文本、颜色解析与屏幕取色四路互不覆盖的错误。 |
| `swatches` | `string[]` | 预设色板（原样透传 swatches prop，缺省是空数组）。 |
| `hueSlider` | `ColorSliderApi<T>` | 色相那条颜色滑块的 api：部件属性与取值都从这里拿，DOM 带 data-scope="color-slider"。 |
| `alphaSlider` | `ColorSliderApi<T>` | 透明度那条颜色滑块的 api。 |
| `swatchPicker` | `ColorSwatchPickerApi<T>` | 预设色板的 api，DOM 带 data-scope="color-swatch-picker"。 |
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
| `getHueSliderProps` | `() => T['element']` | 色相滑块的挂载点，同时充当那条滑块的根节点：滑块 root 的状态标记照抄在它身上。 |
| `getAlphaSliderProps` | `() => T['element']` | 透明度滑块的挂载点，同上。 |
| `getChannelInputProps` | `(props: ColorPickerInputProps) => T['input']` |  |
| `getEyeDropperTriggerProps` | `() => T['button']` |  |
| `getSwatchPickerProps` | `() => T['element']` | 预设色板的挂载点，同时充当色板的根节点（role=radiogroup 与键盘处理都在它身上）。 |
| `getHiddenInputProps` | `() => T['input']` | 表单影子：值随表单提交。给了 name 才带 name，不给就不参与提交。 |

## 无障碍

### 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/slider/#keyboardinteraction)

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `ArrowRight` / `ArrowLeft` | focus in area-thumb, not disabled/readOnly | 按 1 调饱和度；RTL 下左右对调，语义恒是"朝饱和走一格" |
| `ArrowUp` / `ArrowDown` | focus in area-thumb, not disabled/readOnly | 按 1 调明度，屏幕向上恒是变亮，与 dir 无关 |
| `Shift+ArrowRight` / `Shift+ArrowLeft` / `Shift+ArrowUp` / `Shift+ArrowDown` | focus in area-thumb, not disabled/readOnly | 同上，但一步走 10 |
| `Home` / `End` | focus in area-thumb, not disabled/readOnly | 饱和度取 0 / 100（与 aria-valuenow 报的是同一条轴） |
| `Enter` | focus in channel-input | 收下框里的字；收不了就保留草稿并报告输入错误。一并拦住表单提交 |
| `Escape` | open（本层在层栈顶） | 收起浮层，焦点归还触发器 |

### ARIA

以下属性由 `connect` 生成。

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
| `channel-input` | `aria-invalid` | 'true' \| 'false' |
| `channel-input` | `aria-label` | label.input(channel) |
| `eye-dropper-trigger` | `aria-label` | label.eyeDropperTrigger |

- 触发按钮是原生按钮，`aria-haspopup="dialog"`，名称由标题与当前值串合成；浮层是非模态 `role="dialog"`。
- 取色面的拇指是 `role="slider"`：`aria-valuenow` 报告饱和度，明度写入 `aria-valuetext`。
- 两条滑块的名称与带单位的播报文本取自 `translations.channel` / `channelValueText`，由内嵌滑块读出。
- 色板是 `role="radiogroup"`，每格 `role="radio"`；整组名称取 `translations.swatchGroup`，每格读 `translations.swatch(value)`。
- Escape 收起浮层并把焦点归还触发按钮。

## 样式参考

### 皮肤

`@xihan-ui/styles/color-picker.css` 使用 `[data-scope="color-picker"][data-part="root"]` 部件选择器，位于 `xihan.components` 与 `xihan.motion` 层。覆盖样式使用 `xihan.overrides`。

`forced-colors: active` 下另有一套规则：颜色交给系统，边框与状态标记改用系统色关键字。

### 数据属性

由 `connect` 生成；条件不成立时不输出无值属性。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-size` | props.size |
| `swatch` | `data-value` | context.get('value') |
| `swatch` | `data-xh-swatch` | '' |
| `swatch` | `data-xh-swatch-size` | props.size |
| `positioner` | `data-hidden` | ''（条件成立时才出现） |
| `positioner` | `data-placement` | 定位引擎算出的实际落位 |
| `positioner` | `data-positioned` | ''（条件成立时才出现） |
| `positioner` | `data-size` | props.size |
| `positioner` | `data-state` | 'open' \| 'closed' |
| `content` | `data-placement` | 定位引擎算出的实际落位 |
| `saturation-area` | `data-dragging` | ''（条件成立时才出现） |
| `area-thumb` | `data-dragging` | ''（条件成立时才出现） |
| `hue-slider` | `data-channel` | 'hue' |
| `alpha-slider` | `data-channel` | 'alpha' |
| `alpha-slider` | `data-disabled` | ''（条件成立时才出现） |
| `channel-input` | `data-channel` | channel |
| `channel-input` | `data-invalid` | ''（条件成立时才出现） |
| `eye-dropper-trigger` | `data-disabled` | ''（条件成立时才出现） |
| `eye-dropper-trigger` | `data-state` | 'picking' \| 'open' \| 'closed' |

<!-- xh-component-tokens:start -->
### CSS 变量

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
| `--xh-color-picker-alpha-slider-gap` | `alpha-slider` | `gap` | `default` | `--xh-stack-gap-md` | color-picker 的 alpha-slider 部件 gap 覆盖槽。 |
| `--xh-color-picker-content-backdrop` | `content` | `-webkit-backdrop-filter`<br>`backdrop-filter` | `default` | `--xh-material-frosted-backdrop` | color-picker 的 content 部件 -webkit-backdrop-filter、backdrop-filter 覆盖槽。 |
| `--xh-color-picker-content-bg` | `content` | `background` | `default` | `--xh-material-frosted-bg` | color-picker 的 content 部件 background 覆盖槽。 |
| `--xh-color-picker-content-border` | `content` | `border` | `default` | `--xh-material-frosted-border` | color-picker 的 content 部件 border 覆盖槽。 |
| `--xh-color-picker-content-fg` | `content` | `color` | `default` | `--xh-material-frosted-fg` | color-picker 的 content 部件 color 覆盖槽。 |
| `--xh-color-picker-content-gap` | `content` | `gap` | `default` | `--xh-space-3` | color-picker 的 content 部件 gap 覆盖槽。 |
| `--xh-color-picker-content-highlight` | `content` | `background` | `default` | `--xh-material-frosted-highlight` | color-picker 的 content 部件 background 覆盖槽。 |
| `--xh-color-picker-content-px` | `content` | `padding-inline` | `default` | `--xh-space-3` | color-picker 的 content 部件 padding-inline 覆盖槽。 |
| `--xh-color-picker-content-py` | `content` | `padding-block` | `default` | `--xh-space-3` | color-picker 的 content 部件 padding-block 覆盖槽。 |
| `--xh-color-picker-content-radius` | `content` | `border-radius` | `default` | `--xh-shape-overlay` | color-picker 的 content 部件 border-radius 覆盖槽。 |
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
| `--xh-color-picker-hue-slider-gap` | `hue-slider` | `gap` | `default` | `--xh-stack-gap-md` | color-picker 的 hue-slider 部件 gap 覆盖槽。 |
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
| `--xh-color-picker-slider-thumb-size` | `alpha-slider`<br>`hue-slider` | `--xh-_thumb-size` | `default` | `--xh-track-thumb-size` | color-picker 的 alpha-slider、hue-slider 部件 --xh-_thumb-size 覆盖槽。 |
| `--xh-color-picker-slider-track-thickness` | `alpha-slider`<br>`hue-slider` | `--xh-_track-thickness` | `default` | `--xh-space-3` | color-picker 的 alpha-slider、hue-slider 部件 --xh-_track-thickness 覆盖槽。 |
| `--xh-color-picker-swatch-border` | `swatch` | `--xh-swatch-border` | `default` | `--xh-border-default` | color-picker 的 swatch 部件 --xh-swatch-border 覆盖槽。 |
| `--xh-color-picker-swatch-cell` | `swatch-picker` | `--xh-_color-swatch-picker-cell` | `default` | `--xh-control-h-sm` | color-picker 的 swatch-picker 部件 --xh-_color-swatch-picker-cell 覆盖槽。 |
| `--xh-color-picker-swatch-gap` | `swatch-picker` | `gap` | `default` | `--xh-control-gap-sm` | color-picker 的 swatch-picker 部件 gap 覆盖槽。 |
| `--xh-color-picker-swatch-icon-size` | `swatch-picker` | `--xh-icon-size` | `default` | `--xh-_color-swatch-picker-mark` | color-picker 的 swatch-picker 部件 --xh-icon-size 覆盖槽。 |
| `--xh-color-picker-swatch-picker-gap` | `swatch-picker` | `gap` | `default` | `--xh-_color-swatch-picker-gap` | color-picker 的 swatch-picker 部件 gap 覆盖槽。 |
| `--xh-color-picker-swatch-radius` | `swatch` | `--xh-swatch-radius` | `default` | `--xh-shape-inset` | color-picker 的 swatch 部件 --xh-swatch-radius 覆盖槽。 |
| `--xh-color-picker-swatch-size` | `swatch` | `--xh-swatch-size` | `default` | `--xh-_swatch-size` | color-picker 的 swatch 部件 --xh-swatch-size 覆盖槽。 |
| `--xh-color-picker-thumb-border` | `area-thumb` | `border` | `default` | `--xh-color-neutral-0` | color-picker 的 area-thumb 部件 border 覆盖槽。 |
| `--xh-color-picker-thumb-radius` | `area-thumb` | `border-radius` | `default` | `--xh-shape-circle` | color-picker 的 area-thumb 部件 border-radius 覆盖槽。 |
| `--xh-color-picker-thumb-scale-dragging` | `area-thumb` | `scale` | `dragging` | `--xh-motion-scale-drag` | color-picker 的 area-thumb 部件 scale 覆盖槽。 |
| `--xh-color-picker-thumb-shadow` | `area-thumb` | `box-shadow` | `default` | `--xh-elevation-raised` | color-picker 的 area-thumb 部件 box-shadow 覆盖槽。 |
| `--xh-color-picker-thumb-size` | `area-thumb` | `block-size`<br>`inline-size`<br>`margin-block-start`<br>`margin-inline-start` | `default` | `14px` | color-picker 的 area-thumb 部件 block-size、inline-size、margin-block-start、margin-inline-start 覆盖槽。 |
| `--xh-color-picker-trigger-fg` | `trigger` | `color` | `default` | `--xh-fg-default` | color-picker 的 trigger 部件 color 覆盖槽。 |
| `--xh-color-picker-trigger-font-size` | `trigger` | `font-size` | `default` | `--xh-text-body-size` | color-picker 的 trigger 部件 font-size 覆盖槽。 |
| `--xh-color-picker-trigger-gap` | `trigger` | `gap` | `default` | `--xh-_color-picker-gap` | color-picker 的 trigger 部件 gap 覆盖槽。 |
| `--xh-color-picker-value-fg` | `value-text` | `color` | `default` | `--xh-fg-default` | color-picker 的 value-text 部件 color 覆盖槽。 |
| `--xh-color-picker-value-font-size` | `value-text` | `font-size` | `default` | `--xh-text-body-size` | color-picker 的 value-text 部件 font-size 覆盖槽。 |
<!-- xh-component-tokens:end -->

### 动效

关键帧 `xh-overlay-slide-in` · `xh-overlay-slide-out` 随皮肤自带，不引用别处文件里的名字；`background` · `border-color` · `scale` 走 `transition` 过渡。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

皮肤之外还有一段：退场由适配器的退场闸门把关，动画播完才真收起。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。

### 响应式

- 浮层的宽度与高度分别受可用空间约束，窄视口下面板不会超出屏幕，容纳不下时在面板内滚动。
- 粗指针下命中区是取色面、滑块整条与色板整格。

### RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像；另有按 `dir` 分支的规则。

- `dir="rtl"` 只对调横轴（取色面的饱和度、两条滑块）上左右方向键与指针的语义，上下方向键始终是屏幕向上为增大。
