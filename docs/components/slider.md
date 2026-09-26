# Slider 滑块

在连续或离散的区间内拖出一个值或一段范围。

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/slider" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/slider.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/slider" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/slider" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/slider.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## 用法

值恒为数组，单滑块即长度 1；方向键移动一格 step，PageUp 与 PageDown 按 largeStep，Home 与 End 到达端点

<XhDemo src="slider/01-basic" />

## 组件结构

加粗的是必需部件。

`data-scope="slider"`：**`root`** · `label` · **`control`** · **`track`** · `range` · **`thumb`** · `value-text` · `tick-group` · `tick` · `tick-label` · `hidden-input`

## 示例

### 区间选择

两个拇指互为对方的边界、永不交叉，minStepsBetweenThumbs 再为它们之间留出格数；getValueText 把值转换为读屏可朗读的文本

<XhDemo src="slider/02-range" />

### 竖向

orientation 换为 vertical 后整条控件收为一块，键盘与拖动的方向随之翻转

<XhDemo src="slider/03-vertical" />

### 禁用与只读

禁用的拇指退出 Tab 序列、值也不再随表单提交；只读仍可聚焦与朗读，只是不可推动

<XhDemo src="slider/04-disabled" />

### 颜色

tone 决定已填轨道与滑块使用哪族颜色，不写时沿用品牌色

<XhDemo src="slider/05-tone" />

### 尺寸

size 改变轨道厚度与滑块直径，不写即默认中档

<XhDemo src="slider/06-size" />

### 文字方向

dir 换为 rtl 后轨道从右向左填充，左右两键的语义随之对调；上下键与 Home、End 不受影响

<XhDemo src="slider/07-direction" />

### 滑块中的内容

thumb 是一个普通容器，放置什么由作者决定；容纳空间依靠 --xh-slider-thumb-size 撑开直径

<XhDemo src="slider/08-thumb-content" />

### 轨道刻度

刻度分圆点与文案两层：圆点固定在轨道上、文案排在下方且点击跳转到该值，落入已选区间的刻度分段上色；snapToMarks 使拖动/点击/键盘只落在刻度上

<XhDemo src="slider/09-marks" />

### 拖动时的值气泡

value-text 挂在 thumb 中即随之移动；推动时由皮肤显示它，气泡中的文字取自作者的格式化函数

<XhDemo src="slider/10-value-bubble" />

### 离散档位

可选值不必是等距数值：让滑块在档位下标上移动，宿主再把下标映射回自己的取值表，键盘与拖动都只落在档位上

<XhDemo src="slider/11-discrete-steps" />

## 设计指引

### 何时使用

- 用户关心的是相对位置而不是精确数字（音量、透明度、价格区间）。
- 需要即时看到调整的效果。

### 何时不用

- 需要精确输入时，使用[数字字段](./number-field)，或两者并排。
- 档位只有三四个时，使用[单选组](./radio-group)或[切换按钮组](./toggle-group)。

### 特性

- 单值与区间共用一套结构，区间时 `minStepsBetweenThumbs` 防止两头交叉。
- `marks` 绘制刻度，`snapToMarks` 让值吸附到刻度。
- 两个回调：拖动途中连续发出，松手时发出一次；持久化使用后者。
- `getValueText` 决定读屏读出的内容，不只读数字。

### 组合

- 与[数字字段](./number-field)并排，两边同步一个值。

### 最佳实践

- 两端标出最小与最大值，用户才能知道当前位置。
- 拖动时用值气泡显示当前值，松手后收起。

### 反模式

- 区间很大却不提供数字输入，拖到精确值几乎不可能。
- 在移动端把滑块做得过细过短。

## API 参考

### 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-slider>` |
| Vue 组件 | `XhSliderControl` `XhSliderHiddenInput` `XhSliderLabel` `XhSliderRange` `XhSliderRoot` `XhSliderThumb` `XhSliderTickGroup` `XhSliderTrack` `XhSliderValueText` |
| 组合式函数 | `useSlider` |
| 状态机 | `sliderMachine` |
| 皮肤 | `@xihan-ui/styles/slider.css` |

### Props

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
| `tone` | `Tone` |  | 语气：brand / neutral / success / warning / danger / info，决定使用哪族颜色 |
| `size` | `Size` |  | 尺寸：sm / md / lg，决定拇指直径与轨道厚度 |
| `name` | `string` |  | 表单字段名；多滑块时逐个 append。 |
| `minStepsBetweenThumbs` | `number` |  | 相邻滑块至少相隔的格数，默认 0（可以贴在一起但不能交换顺序）。 |
| `marks` | `SliderMark[]` |  | 刻度表：轨道上的圆点与文案，点击文案即跳到该值。 |
| `snapToMarks` | `boolean` |  | 只接受刻度落点：拖动、点击与键盘都吸附到最近 / 下一档刻度。 |
| `getValueText` | `(details: SliderValueTextDetails) => string` |  | 把值转换为可读文字，产出写入拇指的 aria-valuetext。 未提供时不写该属性，读屏回退为朗读 aria-valuenow。 |
| `onValueChange` | `(details: SliderValueChangeDetails) => void` |  | 每次推动都发出；拖动过程中连续发出。 |
| `onValueChangeEnd` | `(details: SliderValueChangeEndDetails) => void` |  | 只在一次操作结束时发出一次，适合用于发起请求。 |

### SliderMark

`marks` 的元素。

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `value` | `number` | 是 |  |
| `label` | `string` |  |  |

### 事件

自定义元素将载荷放在 `detail`；Vue 使用同名 emit。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `value-change` | `SliderValueTextDetails` | 值变化（拖动途中连续发出）；detail 为 `{ value: number[] }` |
| `value-change-end` | `SliderValueChangeEndDetails` | 一次操作收尾时发出一次；detail 为 `{ value: number[], index: number }` |

### 插槽

仅列出带载荷的插槽。

| Vue 组件 | 插槽 | 载荷 | 说明 |
| --- | --- | --- | --- |
| `XhSliderRoot` | `default` | `SliderRootSlotProps` |  |
| `XhSliderTickGroup` | `tick` | `SliderTickGroupTickSlotProps` |  |

### React 适配器 props

只列各组件自己声明的那些：继承自 `ComponentPropsWithRef` 的 DOM 属性不在其中，根组件上与上面 Props 表同名的也不重复列。Vue 的对应物是上面的插槽表。

| React 组件 | 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- | --- |
| `XhSliderRoot` | `children` | `SlotChildren<SliderRootSlotProps>` |  |  |
| `XhSliderThumb` | `index` | `number \| string` |  | 第几个滑块，多滑块时必须逐个写明；兼收字符串。 |
| `XhSliderTickGroup` | `tick` | `SlotChildren<SliderTickSlotProps>` |  | 逐档刻度的文案接管口；未提供时填入刻度自带的 label。 |

### 状态

以下名称仅用于内部状态机。

**状态**：`idle` · `dragging`

**事件**：`VALUE.SET` · `THUMB.STEP` · `THUMB.TO_MIN` · `THUMB.TO_MAX` · `THUMB.SET` · `THUMB.FOCUS` · `DRAG.START` · `DRAG.MOVE` · `DRAG.END` · `FORM.RESET`

**判据**：`canDrag`

### connect API

`getXxxProps()` 返回对应部件的宿主属性。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `value` | `number[]` |  |
| `range` | `{ start: number, end: number }` | 已选区间在轨道上的起止，0-1。 |
| `thumbs` | `SliderThumbState[]` |  |
| `marks` | `SliderMarkMeta[]` | 刻度呈现数据：夹进区间、升序去重，带位置与分段上色标记。 |
| `dragging` | `boolean` |  |
| `disabled` | `boolean` |  |
| `readOnly` | `boolean` |  |
| `valueText` | `(index: number) => string` | 某个拇指的值文本：提供 getValueText 时是其产出，否则是值本身。 |
| `setValue` | `(next: number[]) => void` |  |
| `setThumbValue` | `(index: number, next: number) => void` |  |
| `getRootProps` | `() => T['element']` |  |
| `getLabelProps` | `() => T['label']` |  |
| `getControlProps` | `() => T['element']` |  |
| `getTrackProps` | `() => T['element']` |  |
| `getRangeProps` | `() => T['element']` |  |
| `getThumbProps` | `(index: number) => T['element']` |  |
| `getValueTextProps` | `(index: number) => T['element']` | 值气泡：挂在拇指中显示该拇指的当前值；aria-hidden，读屏使用拇指自身的 aria-valuetext。 |
| `getTickGroupProps` | `() => T['element']` | 刻度容器。 |
| `getTickProps` | `(props: SliderTickProps) => T['element']` | 刻度点：轨道上的圆点，纯装饰。 |
| `getTickLabelProps` | `(props: SliderTickProps) => T['element']` | 刻度文案：点击把最近的滑块跳到该档。 |
| `getHiddenInputProps` | `(index: number) => T['input']` |  |

## 无障碍

### 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/slider/#keyboardinteraction)

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `ArrowRight` / `ArrowUp` | focus in thumb, not disabled/readOnly | 按 step 增大；RTL 与竖直排布下按屏幕方向对调，语义恒是"朝 max 走一格" |
| `ArrowLeft` / `ArrowDown` | focus in thumb, not disabled/readOnly | 按 step 减小，同上对调规则 |
| `PageUp` | focus in thumb, not disabled/readOnly | 按 largeStep 增大（默认 10 倍 step） |
| `PageDown` | focus in thumb, not disabled/readOnly | 按 largeStep 减小 |
| `Home` | focus in thumb, not disabled/readOnly | 取 min；多滑块时取自己被邻居允许的下界 |
| `End` | focus in thumb, not disabled/readOnly | 取 max；多滑块时取自己被邻居允许的上界 |

### ARIA

以下属性由 `connect` 生成。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `thumb` | `aria-disabled` | 'true' \| 'false' |
| `thumb` | `aria-labelledby` | `label` 部件的 id |
| `thumb` | `aria-orientation` | props.orientation |
| `thumb` | `aria-valuemax` | String(thumb.max) |
| `thumb` | `aria-valuemin` | String(thumb.min) |
| `thumb` | `aria-valuenow` | String(thumb.value) |
| `thumb` | `aria-valuetext` | prop('getValueText')?.({ value: thumb.value, index: t… |
| `thumb` | `role` | 'slider' |
| `value-text` | `aria-hidden` | 'true' |
| `tick` | `aria-hidden` | 'true' |

## 样式参考

### 皮肤

`@xihan-ui/styles/slider.css` 使用 `[data-scope="slider"][data-part="root"]` 部件选择器，位于 `xihan.components` 层。覆盖样式使用 `xihan.overrides`。

### 数据属性

由 `connect` 生成；条件不成立时不输出无值属性。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-disabled` | ''（条件成立时才出现） |
| `root` | `data-dragging` | ''（条件成立时才出现） |
| `root` | `data-invalid` | ''（条件成立时才出现） |
| `root` | `data-orientation` | props.orientation |
| `root` | `data-readonly` | ''（条件成立时才出现） |
| `root` | `data-size` | props.size |
| `root` | `data-tone` | props.tone |
| `label` | `data-disabled` | ''（条件成立时才出现） |
| `label` | `data-dragging` | ''（条件成立时才出现） |
| `label` | `data-invalid` | ''（条件成立时才出现） |
| `label` | `data-orientation` | props.orientation |
| `label` | `data-readonly` | ''（条件成立时才出现） |
| `control` | `data-disabled` | ''（条件成立时才出现） |
| `control` | `data-dragging` | ''（条件成立时才出现） |
| `control` | `data-invalid` | ''（条件成立时才出现） |
| `control` | `data-orientation` | props.orientation |
| `control` | `data-readonly` | ''（条件成立时才出现） |
| `track` | `data-disabled` | ''（条件成立时才出现） |
| `track` | `data-dragging` | ''（条件成立时才出现） |
| `track` | `data-invalid` | ''（条件成立时才出现） |
| `track` | `data-orientation` | props.orientation |
| `track` | `data-readonly` | ''（条件成立时才出现） |
| `range` | `data-disabled` | ''（条件成立时才出现） |
| `range` | `data-dragging` | ''（条件成立时才出现） |
| `range` | `data-invalid` | ''（条件成立时才出现） |
| `range` | `data-orientation` | props.orientation |
| `range` | `data-readonly` | ''（条件成立时才出现） |
| `thumb` | `data-disabled` | ''（条件成立时才出现） |
| `thumb` | `data-dragging` | ''（条件成立时才出现） |
| `thumb` | `data-index` | String(thumb.index) |
| `thumb` | `data-invalid` | ''（条件成立时才出现） |
| `thumb` | `data-orientation` | props.orientation |
| `thumb` | `data-readonly` | ''（条件成立时才出现） |
| `value-text` | `data-disabled` | ''（条件成立时才出现） |
| `value-text` | `data-dragging` | ''（条件成立时才出现） |
| `value-text` | `data-index` | String(thumb.index) |
| `value-text` | `data-invalid` | ''（条件成立时才出现） |
| `value-text` | `data-orientation` | props.orientation |
| `value-text` | `data-readonly` | ''（条件成立时才出现） |
| `tick-group` | `data-disabled` | ''（条件成立时才出现） |
| `tick-group` | `data-dragging` | ''（条件成立时才出现） |
| `tick-group` | `data-invalid` | ''（条件成立时才出现） |
| `tick-group` | `data-orientation` | props.orientation |
| `tick-group` | `data-readonly` | ''（条件成立时才出现） |
| `tick` | `data-passed` | ''（条件成立时才出现） |
| `tick-label` | `data-passed` | ''（条件成立时才出现） |
| `hidden-input` | `data-index` | String(thumb.index) |

<!-- xh-component-tokens:start -->
### CSS 变量

本组件公开覆盖槽由独立皮肤的实际消费位生成；默认来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 默认来源 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `--xh-slider-control-gutter` | `control`<br>`root` | `margin-inline` | `has([data-part='tick-label'])`<br>`orientation=horizontal` | `--xh-space-6` | slider 的 control、root 部件 margin-inline 覆盖槽。 |
| `--xh-slider-gap` | `root` | `gap` | `default` | `--xh-space-1` | slider 的 root 部件 gap 覆盖槽。 |
| `--xh-slider-label-fg` | `label` | `color` | `default` | `--xh-fg-default` | slider 的 label 部件 color 覆盖槽。 |
| `--xh-slider-label-fg-disabled` | `label` | `color` | `disabled` | `--xh-fg-subtle` | slider 的 label 部件 color 覆盖槽。 |
| `--xh-slider-label-font-size` | `label` | `font-size` | `default` | `--xh-text-label-size` | slider 的 label 部件 font-size 覆盖槽。 |
| `--xh-slider-label-font-weight` | `label` | `font-weight` | `default` | `--xh-text-label-weight` | slider 的 label 部件 font-weight 覆盖槽。 |
| `--xh-slider-range-bg` | `range` | `background` | `default` | `--xh-_tone` | slider 的 range 部件 background 覆盖槽。 |
| `--xh-slider-range-bg-disabled` | `range` | `background` | `disabled` | `--xh-fg-disabled` | slider 的 range 部件 background 覆盖槽。 |
| `--xh-slider-range-bg-invalid` | `range` | `background` | `invalid` | `--xh-border-invalid` | slider 的 range 部件 background 覆盖槽。 |
| `--xh-slider-range-radius` | `range` | `border-radius` | `default` | `--xh-shape-pill` | slider 的 range 部件 border-radius 覆盖槽。 |
| `--xh-slider-thumb-bg` | `thumb` | `background` | `default` | `--xh-_tone` | slider 的 thumb 部件 background 覆盖槽。 |
| `--xh-slider-thumb-bg-disabled` | `thumb` | `background` | `disabled` | `--xh-bg-surface` | slider 的 thumb 部件 background 覆盖槽。 |
| `--xh-slider-thumb-bg-invalid` | `thumb` | `background` | `invalid` | `--xh-border-invalid` | slider 的 thumb 部件 background 覆盖槽。 |
| `--xh-slider-thumb-border` | `thumb` | `border` | `default` | `--xh-border-default-opaque` | slider 的 thumb 部件 border 覆盖槽。 |
| `--xh-slider-thumb-radius` | `thumb` | `border-radius` | `default` | `--xh-shape-circle` | slider 的 thumb 部件 border-radius 覆盖槽。 |
| `--xh-slider-thumb-scale-dragging` | `thumb` | `scale` | `dragging` | `--xh-motion-scale-drag` | slider 的 thumb 部件 scale 覆盖槽。 |
| `--xh-slider-thumb-shadow` | `thumb` | `box-shadow` | `default` | `--xh-elevation-raised` | slider 的 thumb 部件 box-shadow 覆盖槽。 |
| `--xh-slider-thumb-shadow-disabled` | `thumb` | `box-shadow` | `disabled` | `none` | slider 的 thumb 部件 box-shadow 覆盖槽。 |
| `--xh-slider-thumb-shadow-dragging` | `thumb` | `box-shadow` | `dragging` | `--xh-elevation-lifted` | slider 的 thumb 部件 box-shadow 覆盖槽。 |
| `--xh-slider-thumb-size` | `control`<br>`root`<br>`thumb` | `block-size`<br>`inline-size`<br>`margin-block-end`<br>`margin-block-start`<br>`margin-inline-start` | `default`<br>`orientation=horizontal`<br>`orientation=vertical`<br>`size=lg`<br>`size=sm` | `--xh-space-3`<br>`--xh-space-6`<br>`--xh-track-thumb-size` | slider 的 control、root、thumb 部件 block-size、inline-size、margin-block-end、margin-block-start、margin-inline-start 覆盖槽。 |
| `--xh-slider-tick-bg` | `tick` | `background` | `default` | `--xh-border-strong` | slider 的 tick 部件 background 覆盖槽。 |
| `--xh-slider-tick-bg-active` | `tick` | `background` | `passed` | `--xh-_tone` | slider 的 tick 部件 background 覆盖槽。 |
| `--xh-slider-tick-bg-active-disabled` | `tick`<br>`tick-group` | `background` | `disabled`<br>`passed` | `--xh-fg-disabled` | slider 的 tick、tick-group 部件 background 覆盖槽。 |
| `--xh-slider-tick-bg-disabled` | `tick`<br>`tick-group` | `background` | `disabled` | `--xh-border-default` | slider 的 tick、tick-group 部件 background 覆盖槽。 |
| `--xh-slider-tick-label-fg` | `tick-label` | `color` | `default` | `--xh-fg-subtle` | slider 的 tick-label 部件 color 覆盖槽。 |
| `--xh-slider-tick-label-fg-active` | `tick-label` | `color` | `passed` | `--xh-fg-default` | slider 的 tick-label 部件 color 覆盖槽。 |
| `--xh-slider-tick-label-fg-disabled` | `tick-group`<br>`tick-label` | `color` | `disabled` | `--xh-fg-disabled` | slider 的 tick-group、tick-label 部件 color 覆盖槽。 |
| `--xh-slider-tick-label-font-size` | `tick-label` | `font-size` | `default` | `--xh-text-caption-size` | slider 的 tick-label 部件 font-size 覆盖槽。 |
| `--xh-slider-tick-label-gap` | `root`<br>`tick-label` | `margin-block-start`<br>`margin-inline-start` | `default`<br>`orientation=vertical` | `--xh-space-1` | slider 的 root、tick-label 部件 margin-block-start、margin-inline-start 覆盖槽。 |
| `--xh-slider-tick-radius` | `tick` | `border-radius` | `default` | `--xh-shape-circle` | slider 的 tick 部件 border-radius 覆盖槽。 |
| `--xh-slider-tick-size` | `tick` | `block-size`<br>`inline-size` | `default` | `--xh-space-1` | slider 的 tick 部件 block-size、inline-size 覆盖槽。 |
| `--xh-slider-track-bg` | `track` | `background` | `default` | `--xh-bg-subtle-active` | slider 的 track 部件 background 覆盖槽。 |
| `--xh-slider-track-bg-disabled` | `track` | `background` | `disabled` | `--xh-bg-subtle` | slider 的 track 部件 background 覆盖槽。 |
| `--xh-slider-track-radius` | `track` | `border-radius` | `default` | `--xh-shape-pill` | slider 的 track 部件 border-radius 覆盖槽。 |
| `--xh-slider-track-thickness` | `root`<br>`track` | `block-size`<br>`inline-size` | `orientation=horizontal`<br>`orientation=vertical`<br>`size=lg`<br>`size=sm` | `--xh-space-1`<br>`--xh-space-2`<br>`--xh-track-thickness` | slider 的 root、track 部件 block-size、inline-size 覆盖槽。 |
| `--xh-slider-value-text-bg` | `value-text` | `background` | `default` | `--xh-_tone` | slider 的 value-text 部件 background 覆盖槽。 |
| `--xh-slider-value-text-fg` | `value-text` | `color` | `default` | `--xh-_tone-on` | slider 的 value-text 部件 color 覆盖槽。 |
| `--xh-slider-value-text-font-size` | `value-text` | `font-size` | `default` | `--xh-text-caption-size` | slider 的 value-text 部件 font-size 覆盖槽。 |
| `--xh-slider-value-text-offset` | `value-text` | `margin-block-end`<br>`margin-inline` | `default`<br>`orientation=vertical` | `--xh-space-2` | slider 的 value-text 部件 margin-block-end、margin-inline 覆盖槽。 |
| `--xh-slider-value-text-px` | `value-text` | `padding-inline` | `default` | `--xh-space-2` | slider 的 value-text 部件 padding-inline 覆盖槽。 |
| `--xh-slider-value-text-py` | `value-text` | `padding-block` | `default` | `--xh-space-0_5` | slider 的 value-text 部件 padding-block 覆盖槽。 |
| `--xh-slider-value-text-radius` | `value-text` | `border-radius` | `default` | `--xh-shape-control` | slider 的 value-text 部件 border-radius 覆盖槽。 |
| `--xh-slider-vertical-length` | `control` | `block-size` | `orientation=vertical` | `10rem` | slider 的 control 部件 block-size 覆盖槽。 |
<!-- xh-component-tokens:end -->

### 动效

`box-shadow` · `opacity` · `scale` 走 `transition` 过渡。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。

### RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像。
