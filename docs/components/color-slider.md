# ColorSlider 颜色滑块 <Badge type="info" text="alpha" />

只调整颜色某一个通道的滑杆：色相、饱和度、明度、透明度，或红、绿、蓝。值是完整的颜色串，轨道显示该通道从最小值到最大值的颜色变化，拇指填充当前值对应的颜色。多条并排即可组成自定义的调色面板；[颜色选择器](./color-picker)浮层内的色相带与透明度带就是它。

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/color-slider" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/color-slider.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/color-slider" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/color-slider" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/color-slider.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## 用法

一条滑杆只推颜色的一路，默认是色相：值是整个颜色串，轨道画的是这一路从头走到尾的颜色

<XhDemo src="color-slider/01-basic" />

## 组件结构

加粗的是必需部件。

`data-scope="color-slider"`：`root` · `label` · **`control`** · **`track`** · **`thumb`** · `value-text` · `hidden-input`

## 示例

### 通道并排

几条共用同一个值、各推自己那一路；开 alpha 让推色相时透明度不丢，就拼出一个 HSV 调色面板

<XhDemo src="color-slider/02-channels" />

### 红绿蓝与写法

推 RGB 三路走 0-255；format 决定写回的写法，这里按 rgba() 输出

<XhDemo src="color-slider/03-rgb" />

### 竖直与状态

orientation 竖排时渐变自下而上；禁用整体压暗，只读留 Tab 位但推不动

<XhDemo src="color-slider/04-states" />

## 设计指引

### 何时使用

- 用户只需要调整颜色的一个分量：透明度、明暗、色相。
- 多条并排，按 HSV 或 RGB 组成内嵌的调色面板，不使用浮层。
- 需要在页面上常驻、随时可拖动的颜色调节。

### 何时不用

- 用户需要在色域中自由取色时，使用[颜色选择器](./color-picker)，它带二维取色区。
- 只从几个固定颜色中选一个时，使用[颜色色块选择器](./color-swatch-picker)。
- 调整的是普通数值时，使用[滑块](./slider)。

### 特性

- `channel` 七选一：`hue`（0-360）、`saturation` / `brightness` / `alpha`（0-100）、`red` / `green` / `blue`（0-255）；步长 1，PageUp / PageDown 走 10。
- 值始终是完整颜色串，`format` 决定写法（hex / rgba / hsla）；`alpha` 决定串中是否带透明度，默认调整透明度通道时带、其余不带。与透明度滑块并排时显式开启它，否则调整色相会把透明度归 1。
- 轨道渐变由连接层按当前颜色实时计算：其余分量不变，只让本通道从 min 走到 max；透明度通道从全透明走到实色，底部垫棋盘格。
- 灰度与纯黑处色相无定义，把明度调到 0 再拉回时色相由锚点保持，不塌为 0。
- 拖动、键盘、RTL 方向与竖直排布全部取自内嵌的[滑块](./slider)；`onValueChange` 在拖动中连续发出，`onValueChangeEnd` 在松手时只发一次。
- 拇指按未取整的工作色定位，比按整格计算更贴近当前颜色；`aria-valuetext` 带单位播报。
- 尺寸 sm / md / lg 改变拇指直径与颜色带厚度；禁用整体压暗，只读保留 Tab 位但不可调整，`invalid` 只改变拇指描边，保留当前颜色的面。

### 组合

- 放入[表单字段](./field)：标签、说明与错误由字段渲染并经 aria-describedby 关联到拇指，禁用 / 只读 / 无效三轴随字段下发。
- 与[颜色色块](./color-swatch)并排：色块显示完整颜色，滑块调整其中一个通道。

### 最佳实践

- 多条并排时共用同一个值，每条只改自己的通道；开启 `alpha` 让透明度在其他通道调整时不丢失。
- 提供 `label` 部件或 `translations.label`，渐变带本身无法说明调整的是什么。
- 需要持久化时监听 `onValueChangeEnd`，拖动过程中的连续回调只用于预览。

### 反模式

- 用它调整普通数值：渐变、单位与区间都按颜色通道固定。
- 传颜色关键字（`red`）：不在支持的写法内，会被视为无效值并保持不变。

## API 参考

### 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-color-slider>` |
| Vue 组件 | `XhColorSliderControl` `XhColorSliderHiddenInput` `XhColorSliderLabel` `XhColorSliderRoot` `XhColorSliderThumb` `XhColorSliderTrack` `XhColorSliderValueText` |
| 组合式函数 | `useColorSlider` |
| 状态机 | `colorSliderMachine` |
| 皮肤 | `@xihan-ui/styles/color-slider.css` |

### Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `value` | `string` |  | 颜色值串。给定即受控：cell 直读 prop，写只发 onValueChange 不落内部值。 |
| `defaultValue` | `string` |  |  |
| `channel` | `ColorChannel` |  | 推的是哪一路：色相 / 饱和度 / 明度 / 透明度 / 红 / 绿 / 蓝，默认 hue。 |
| `format` | `ColorFormat` |  | 值串的写法，默认 hex。改它只改对外的序列化，工作色恒是 HSVA。 |
| `hsva` | `ColorHsva` |  | 受控的工作色。给定时本通道以外的分量、灰度处的色相都以它为准，不再从值串反解： 取色器把同一份工作色交给几条并排的滑块，推色相那条时饱和度与明度不会被值串抹掉。 单独用一条滑块时不必给，滑块自己记着锚。 |
| `alpha` | `boolean` |  | 值串带不带透明度。默认跟着通道走：推透明度那一路时带，其余不带。 显式给 true 时别的通道也保留透明度（与一条透明度滑块并排时要开它，否则推色相会把透明度归 1）。 |
| `orientation` | `Orientation` |  |  |
| `dir` | `Direction` |  | 文字方向。只改写水平轨道上左右两键与指针的语义。 |
| `disabled` | `boolean` |  |  |
| `readOnly` | `boolean` |  |  |
| `invalid` | `boolean` |  |  |
| `size` | `Size` |  | 尺寸：sm / md / lg，决定拇指直径与轨道厚度。 |
| `name` | `string` |  | 表单字段名；给了表单影子才带 name 并参与提交。 |
| `translations` | `Partial<ColorSliderTranslations>` |  |  |
| `onValueChange` | `(details: ColorSliderValueChangeDetails) => void` |  | value 变化意图回调；受控时是唯一出口，非受控随内部写入一并通知。拖动过程中会连续发。 |
| `onValueChangeEnd` | `(details: ColorSliderValueChangeDetails) => void` |  | 只在一次操作结束时发一次，适合拿来发请求。 |

### 事件

自定义元素将载荷放在 `detail`；Vue 使用同名 emit。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `value-change` | `ColorSliderValueChangeDetails` | 颜色变化；detail 为 `{ value: string }`，拖动过程中会连续发 |
| `value-change-end` | `ColorSliderValueChangeDetails` | 一次推动结束；detail 为 `{ value: string }` |

### 插槽

仅列出带载荷的插槽。

| Vue 组件 | 插槽 | 载荷 | 说明 |
| --- | --- | --- | --- |
| `XhColorSliderRoot` | `default` | `ColorSliderRootSlotProps` |  |

### 状态

以下名称仅用于内部状态机。

**状态**：`idle`

**事件**：`VALUE.SET` · `CHANNEL.SET` · `CHANGE.END` · `FORM.RESET`

**判据**：`canInteract`

### connect API

`getXxxProps()` 返回对应部件的宿主属性。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `value` | `string` | 当前值串（与 onValueChange 送出的是同一个）。 |
| `channel` | `ColorChannel` |  |
| `channelValue` | `number` | 本通道此刻的对外数值（色相是角度，饱和度 / 明度 / 透明度是百分数，红绿蓝是 0-255）。 |
| `percent` | `number` | 值在轨道上的位置，0-1。按未取整的工作色算，比滑杆按整格算的那一份更贴当前颜色。 |
| `min` | `number` |  |
| `max` | `number` |  |
| `hsva` | `ColorHsva` |  |
| `rgba` | `ColorRgba` |  |
| `disabled` | `boolean` |  |
| `readOnly` | `boolean` |  |
| `dragging` | `boolean` | 指针正拖着拇指。 |
| `setValue` | `(next: string) => void` |  |
| `setChannelValue` | `(next: number) => void` | 直接把本通道推到某个对外数值。 |
| `getRootProps` | `() => T['element']` |  |
| `getLabelProps` | `() => T['label']` |  |
| `getControlProps` | `() => T['element']` |  |
| `getTrackProps` | `() => T['element']` | 轨道：渐变由连接层按当前颜色现算写成内联 background-image。 |
| `getThumbProps` | `() => T['element']` |  |
| `getValueTextProps` | `() => T['element']` |  |
| `getHiddenInputProps` | `() => T['input']` | 表单影子：值随表单提交。给了 name 才带 name，不给就不参与提交。 |

## 无障碍

### 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/slider/)

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `ArrowRight` / `ArrowUp` | focus in thumb, not disabled/readOnly | 本通道按 step 增大；RTL 与竖直排布下按屏幕方向对调，语义恒是"朝 max 走一格" |
| `ArrowLeft` / `ArrowDown` | focus in thumb, not disabled/readOnly | 本通道按 step 减小，同上对调规则 |
| `PageUp` | focus in thumb, not disabled/readOnly | 按 largeStep 增大（各通道均为 10 格） |
| `PageDown` | focus in thumb, not disabled/readOnly | 按 largeStep 减小 |
| `Home` | focus in thumb, not disabled/readOnly | 取本通道的 min |
| `End` | focus in thumb, not disabled/readOnly | 取本通道的 max |

### ARIA

以下属性由 `connect` 生成。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `thumb` | `aria-disabled` | 'true' \| 'false' |
| `thumb` | `aria-label` | label.label(channel) |
| `thumb` | `aria-labelledby` | `label` 部件的 id |
| `thumb` | `aria-orientation` | props.orientation |
| `thumb` | `aria-valuemax` | String(range.max) |
| `thumb` | `aria-valuemin` | String(range.min) |
| `thumb` | `aria-valuenow` | String(channelValue) |
| `thumb` | `aria-valuetext` | label.valueText(channel, channelValue) |
| `thumb` | `role` | 'slider' |
| `value-text` | `aria-hidden` | 'true' |

## 样式参考

### 皮肤

`@xihan-ui/styles/color-slider.css` 使用 `[data-scope="color-slider"][data-part="root"]` 部件选择器，位于 `xihan.components` 层。覆盖样式使用 `xihan.overrides`。

`forced-colors: active` 下另有一套规则：颜色交给系统，边框与状态标记改用系统色关键字。

### 数据属性

由 `connect` 生成；条件不成立时不输出无值属性。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-size` | props.size |
| `root` | `data-value` | context.get('value') |

<!-- xh-component-tokens:start -->
### CSS 变量

本组件公开覆盖槽由独立皮肤的实际消费位生成；缺省来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 缺省来源 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `--xh-color-slider-checker` | `track` | `background-image` | `channel=alpha` | `--xh-color-neutral-300` | color-slider 的 track 部件 background-image 覆盖槽。 |
| `--xh-color-slider-checker-base` | `track` | `background-color` | `channel=alpha` | `--xh-bg-surface` | color-slider 的 track 部件 background-color 覆盖槽。 |
| `--xh-color-slider-gap` | `root` | `gap` | `default` | `--xh-stack-gap-md` | color-slider 的 root 部件 gap 覆盖槽。 |
| `--xh-color-slider-label-fg` | `label` | `color` | `default` | `--xh-fg-muted` | color-slider 的 label 部件 color 覆盖槽。 |
| `--xh-color-slider-label-font-size` | `label` | `font-size` | `default` | `--xh-text-label-size` | color-slider 的 label 部件 font-size 覆盖槽。 |
| `--xh-color-slider-label-font-weight` | `label` | `font-weight` | `default` | `--xh-text-label-weight` | color-slider 的 label 部件 font-weight 覆盖槽。 |
| `--xh-color-slider-thumb-bg` | `thumb` | `background` | `default` | `--xh-_color-slider-thumb-color` | color-slider 的 thumb 部件 background 覆盖槽。 |
| `--xh-color-slider-thumb-border` | `thumb` | `border` | `default` | `--xh-bg-surface` | color-slider 的 thumb 部件 border 覆盖槽。 |
| `--xh-color-slider-thumb-border-invalid` | `thumb` | `border-color` | `invalid` | `--xh-border-invalid` | color-slider 的 thumb 部件 border-color 覆盖槽。 |
| `--xh-color-slider-thumb-radius` | `thumb` | `border-radius` | `default` | `--xh-shape-circle` | color-slider 的 thumb 部件 border-radius 覆盖槽。 |
| `--xh-color-slider-thumb-scale-dragging` | `thumb` | `scale` | `dragging` | `--xh-motion-scale-drag` | color-slider 的 thumb 部件 scale 覆盖槽。 |
| `--xh-color-slider-thumb-shadow` | `thumb` | `box-shadow` | `default` | `--xh-elevation-raised` | color-slider 的 thumb 部件 box-shadow 覆盖槽。 |
| `--xh-color-slider-thumb-shadow-dragging` | `thumb` | `box-shadow` | `dragging` | `--xh-elevation-lifted` | color-slider 的 thumb 部件 box-shadow 覆盖槽。 |
| `--xh-color-slider-thumb-size` | `control`<br>`root`<br>`thumb` | `block-size`<br>`inline-size`<br>`margin-block-end`<br>`margin-block-start`<br>`margin-inline-start` | `default`<br>`orientation=horizontal`<br>`orientation=vertical`<br>`size=lg`<br>`size=sm` | `--xh-space-3`<br>`--xh-space-6`<br>`--xh-track-thumb-size` | color-slider 的 control、root、thumb 部件 block-size、inline-size、margin-block-end、margin-block-start、margin-inline-start 覆盖槽。 |
| `--xh-color-slider-track-border` | `track` | `box-shadow` | `default` | `--xh-border-subtle` | color-slider 的 track 部件 box-shadow 覆盖槽。 |
| `--xh-color-slider-track-radius` | `track` | `border-radius` | `default` | `--xh-shape-pill` | color-slider 的 track 部件 border-radius 覆盖槽。 |
| `--xh-color-slider-track-thickness` | `control`<br>`root`<br>`track` | `block-size`<br>`inline-size` | `default`<br>`orientation=horizontal`<br>`orientation=vertical`<br>`size=lg`<br>`size=sm` | `--xh-space-2`<br>`--xh-space-3`<br>`--xh-space-4` | color-slider 的 control、root、track 部件 block-size、inline-size 覆盖槽。 |
| `--xh-color-slider-value-text-bg` | `value-text` | `background` | `default` | `--xh-bg-brand` | color-slider 的 value-text 部件 background 覆盖槽。 |
| `--xh-color-slider-value-text-fg` | `value-text` | `color` | `default` | `--xh-fg-on-brand` | color-slider 的 value-text 部件 color 覆盖槽。 |
| `--xh-color-slider-value-text-font-size` | `value-text` | `font-size` | `default` | `--xh-text-caption-size` | color-slider 的 value-text 部件 font-size 覆盖槽。 |
| `--xh-color-slider-value-text-offset` | `value-text` | `margin-block-end`<br>`margin-inline` | `default`<br>`orientation=vertical` | `--xh-space-2` | color-slider 的 value-text 部件 margin-block-end、margin-inline 覆盖槽。 |
| `--xh-color-slider-value-text-px` | `value-text` | `padding-inline` | `default` | `--xh-space-2` | color-slider 的 value-text 部件 padding-inline 覆盖槽。 |
| `--xh-color-slider-value-text-py` | `value-text` | `padding-block` | `default` | `--xh-space-0_5` | color-slider 的 value-text 部件 padding-block 覆盖槽。 |
| `--xh-color-slider-value-text-radius` | `value-text` | `border-radius` | `default` | `--xh-shape-control` | color-slider 的 value-text 部件 border-radius 覆盖槽。 |
| `--xh-color-slider-vertical-length` | `control` | `block-size` | `orientation=vertical` | `--xh-overlay-menu-min-w` | color-slider 的 control 部件 block-size 覆盖槽。 |
<!-- xh-component-tokens:end -->

### 动效

`box-shadow` · `opacity` · `scale` 走 `transition` 过渡。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

`prefers-reduced-motion: reduce` 下本组件另有降级规则。

### RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像。
