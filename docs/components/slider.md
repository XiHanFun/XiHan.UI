# 滑块 <Badge type="info" text="slider" />

数据录入组件。三层同源：无头内核给出解剖与状态机，Vue 组件与自定义元素只是它的两层外壳，行为完全一致。

## 示例

### 基础用法

值恒是数组，单滑块即长度 1；方向键走一格 step，PageUp 与 PageDown 走 largeStep，Home 与 End 贴到端点

<XhDemo src="slider/01-basic" />

### 区间选择

两个拇指互为对方的边界、永不交叉，minStepsBetweenThumbs 再给它们之间留出格数；getValueText 把值翻成读屏念得出的话

<XhDemo src="slider/02-range" />

### 竖向

orientation 换成 vertical 后整条控件收成一块，键盘与拖动的方向跟着一起翻

<XhDemo src="slider/03-vertical" />

### 禁用与只读

禁用的拇指退出 Tab 序列、值也不再随表单提交；只读仍可聚焦与朗读，只是推不动

<XhDemo src="slider/04-disabled" />

### 语气

tone 决定已填轨道与滑块用哪族颜色，不写时沿用品牌色

<XhDemo src="slider/05-tone" />

### 尺寸

size 改轨道厚度与滑块直径，不写即缺省中档

<XhDemo src="slider/06-size" />

### 文字方向

dir 换成 rtl 后轨道从右往左填，左右两键的语义跟着对调；上下键与 Home、End 不受影响

<XhDemo src="slider/07-direction" />

### 滑块里的内容

thumb 是个普通容器，往里放什么都由作者说了算；放得下靠 --xh-slider-thumb-size 把直径撑开

<XhDemo src="slider/08-thumb-content" />

### 轨道刻度

刻度分圆点与文案两层：圆点钉在轨道上、文案排在下方且点按跳值，落进已选区间的刻度分段上色；snapToMarks 让拖动/点按/键盘只认刻度落点

<XhDemo src="slider/09-marks" />

### 拖动时的值气泡

thumb 自己是定位上下文，气泡挂在它上方就跟着走位；dragging 决定露不露面，气泡里的文字由作者的格式化函数产出

<XhDemo src="slider/10-value-bubble" />

### 离散档位

可选值不必是等距数值：让滑块在档位下标上走，宿主再把下标映射回自己的取值表，键盘与拖动都只落在档位上

<XhDemo src="slider/11-discrete-steps" />

## 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-slider>` |
| Vue 组件 | `XhSliderControl` `XhSliderHiddenInput` `XhSliderLabel` `XhSliderMarks` `XhSliderRange` `XhSliderRoot` `XhSliderThumb` `XhSliderTrack` |
| 组合式函数 | `useSlider` |
| 状态机 | `sliderMachine` |
| 皮肤 | `@xihan-ui/styles/slider.css` |

## 解剖

部件名即 `data-part` 属性值，也是皮肤的选择器。加粗的是必备部件，不渲染它组件不工作（Web Components 适配器会在诊断通道上报 `wc.missing-part`）。

`data-scope="slider"`：**`root`** · `label` · **`control`** · **`track`** · `range` · **`thumb`** · `marks` · `mark` · `mark-label` · `hidden-input`

## Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `value` | `number[]` |  |  |
| `defaultValue` | `number[]` |  |  |
| `min` | `number` |  |  |
| `max` | `number` |  |  |
| `step` | `number` |  |  |
| `largeStep` | `number` |  | PageUp / PageDown 的步长，默认 10 倍 step。 |
| `orientation` | `Orientation` |  |  |
| `dir` | `Direction` |  |  |
| `disabled` | `boolean` |  |  |
| `readOnly` | `boolean` |  |  |
| `invalid` | `boolean` |  |  |
| `tone` | `Tone` |  | 语气：brand / neutral / success / warning / danger / info，决定用哪族颜色 |
| `size` | `Size` |  | 尺寸：sm / md / lg，决定拇指直径与轨道厚度 |
| `name` | `string` |  | 表单字段名；多滑块时逐个 append。 |
| `minStepsBetweenThumbs` | `number` |  | 相邻滑块至少隔几格，默认 0（可以贴在一起但不能交换顺序）。 |
| `marks` | `SliderMark[]` |  | 刻度表：轨道上的圆点与文案，点文案即跳值。 |
| `snapToMarks` | `boolean` |  | 只认刻度落点：拖动、点按与键盘都吸到最近/下一档刻度。 |
| `getValueText` | `(details: SliderValueTextDetails) => string` |  | 把值翻成人话，产出写进拇指的 aria-valuetext。 不给就不写这个属性，读屏退回念 aria-valuenow。 |
| `onValueChange` | `(details: SliderValueChangeDetails) => void` |  | 每次推动都发；拖动过程中会连续发很多次。 |
| `onValueChangeEnd` | `(details: SliderValueChangeEndDetails) => void` |  | 只在一次操作结束时发一次，适合拿来发请求。 |

## 事件

自定义元素派发这些事件，Vue 组件对应同名 emit；载荷都在 `detail` 上。可双向绑定的值另有 `update:xxx`，见 Props。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `value-change` | `SliderValueTextDetails` | 值变化（拖动途中会连发）；detail 为 `{ value: number[] }` |
| `value-change-end` | `SliderValueChangeEndDetails` | 一次操作收尾发一次；detail 为 `{ value: number[], index: number }` |

## 插槽

作者能拿到载荷的插槽。只转发内容、不带载荷的默认插槽不在此列——那类直接写子节点即可。

| Vue 组件 | 插槽 | 载荷 | 说明 |
| --- | --- | --- | --- |
| `XhSliderMarks` | `mark` | `SliderMarksMarkSlotProps` |  |
| `XhSliderRoot` | `default` | `SliderRootSlotProps` |  |

## 状态机

内部转移，写样式与业务都用不到；要监听变化请看上面的「事件」。

**状态**：`idle` · `dragging`

**事件**：`VALUE.SET` · `THUMB.STEP` · `THUMB.TO_MIN` · `THUMB.TO_MAX` · `THUMB.SET` · `THUMB.FOCUS` · `DRAG.START` · `DRAG.MOVE` · `DRAG.END` · `FORM.RESET`

**判据**：`canDrag`

## connect API

`useSlider` 产出的对象。`getXxxProps()` 铺到对应部件的宿主元素上，其余是可读状态与操作入口。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `value` | `number[]` |  |
| `range` | `{ start: number, end: number }` | 已选区间在轨道上的起止，0-1。 |
| `thumbs` | `SliderThumbState[]` |  |
| `marks` | `SliderMarkMeta[]` | 刻度呈现数据：夹进区间、升序去重，带位置与分段上色标记。 |
| `dragging` | `boolean` |  |
| `disabled` | `boolean` |  |
| `readOnly` | `boolean` |  |
| `setValue` | `(next: number[]) => void` |  |
| `setThumbValue` | `(index: number, next: number) => void` |  |
| `getRootProps` | `() => T['element']` |  |
| `getLabelProps` | `() => T['label']` |  |
| `getControlProps` | `() => T['element']` |  |
| `getTrackProps` | `() => T['element']` |  |
| `getRangeProps` | `() => T['element']` |  |
| `getThumbProps` | `(index: number) => T['element']` |  |
| `getMarksProps` | `() => T['element']` | 刻度容器。 |
| `getMarkProps` | `(props: SliderMarkProps) => T['element']` | 刻度点：轨道上的圆点，纯装饰。 |
| `getMarkLabelProps` | `(props: SliderMarkProps) => T['element']` | 刻度文案：点按把最近的滑块跳到这一档。 |
| `getHiddenInputProps` | `(index: number) => T['input']` |  |

## 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/slider/#keyboardinteraction)

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `ArrowRight` / `ArrowUp` | focus in thumb, not disabled/readOnly | 按 step 增大；RTL 与竖直排布下按屏幕方向对调，语义恒是"朝 max 走一格" |
| `ArrowLeft` / `ArrowDown` | focus in thumb, not disabled/readOnly | 按 step 减小，同上对调规则 |
| `PageUp` | focus in thumb, not disabled/readOnly | 按 largeStep 增大（默认 10 倍 step） |
| `PageDown` | focus in thumb, not disabled/readOnly | 按 largeStep 减小 |
| `Home` | focus in thumb, not disabled/readOnly | 取 min；多滑块时取自己被邻居允许的下界 |
| `End` | focus in thumb, not disabled/readOnly | 取 max；多滑块时取自己被邻居允许的上界 |

## CSS 变量

本组件皮肤读的组件级令牌，写在组件自身或任意祖先上都生效。缺省值来自[设计令牌](../guide/theme)，不设即按缺省走。

`--xh-slider-gap` · `--xh-slider-label-fg` · `--xh-slider-label-font-size` · `--xh-slider-label-font-weight` · `--xh-slider-mark-bg` · `--xh-slider-mark-bg-active` · `--xh-slider-mark-label-fg` · `--xh-slider-mark-label-fg-active` · `--xh-slider-mark-label-font-size` · `--xh-slider-mark-label-gap` · `--xh-slider-mark-size` · `--xh-slider-range-bg` · `--xh-slider-range-bg-invalid` · `--xh-slider-range-radius` · `--xh-slider-thumb-bg` · `--xh-slider-thumb-bg-invalid` · `--xh-slider-thumb-border` · `--xh-slider-thumb-radius` · `--xh-slider-thumb-scale-dragging` · `--xh-slider-thumb-shadow` · `--xh-slider-thumb-shadow-dragging` · `--xh-slider-thumb-size` · `--xh-slider-track-bg` · `--xh-slider-track-radius` · `--xh-slider-track-thickness` · `--xh-slider-vertical-length`
