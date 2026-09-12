# Slider <Badge type="info" text="滑块" />

在一个连续或离散的区间里拖出一个值或一段范围。

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/slider" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/slider.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/slider" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/slider" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/slider.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## 用法

值恒是数组，单滑块即长度 1；方向键走一格 step，PageUp 与 PageDown 走 largeStep，Home 与 End 贴到端点

<XhDemo src="slider/01-basic" />

## 组件结构

加粗的是必需部件。

`data-scope="slider"`：**`root`** · `label` · **`control`** · **`track`** · `range` · **`thumb`** · `value-text` · `tick-group` · `tick` · `tick-label` · `hidden-input`

## 示例

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

value-text 挂在 thumb 里就跟着走位；推动那一刻由皮肤放它出面，气泡里的文字取自作者的格式化函数

<XhDemo src="slider/10-value-bubble" />

### 离散档位

可选值不必是等距数值：让滑块在档位下标上走，宿主再把下标映射回自己的取值表，键盘与拖动都只落在档位上

<XhDemo src="slider/11-discrete-steps" />

## 设计指引

### 何时使用

- 用户关心的是相对位置而不是精确数字（音量、透明度、价格区间）。
- 需要即时看到调整的效果。

### 何时不用

- 需要精确输入：用[数字输入](./number-field)，或两者并排。
- 档位只有三四个：用[单选组](./radio-group)或[切换按钮组](./toggle-group)。

### 特性

- 单值与区间共用一套结构，区间时 `minStepsBetweenThumbs` 防止两头交叉。
- `marks` 画刻度，`snapToMarks` 让值吸附到刻度上。
- 两个回调：拖动途中连着发，松手发一次——写存储用后者。
- `getValueText` 决定读屏念出的是什么，别让它只念数字。

### 组合

- 与[数字输入](./number-field)并排，两边同步一个值。

### 最佳实践

- 两端标出最小与最大值，用户才知道自己在哪。
- 拖动时用值气泡显示当前值，松手后收起。

### 反模式

- 区间很大却不给数字输入：拖到某个精确值几乎不可能。
- 在移动端把滑块做得又细又短。

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
| `tone` | `Tone` |  | 语气：brand / neutral / success / warning / danger / info，决定用哪族颜色 |
| `size` | `Size` |  | 尺寸：sm / md / lg，决定拇指直径与轨道厚度 |
| `name` | `string` |  | 表单字段名；多滑块时逐个 append。 |
| `minStepsBetweenThumbs` | `number` |  | 相邻滑块至少隔几格，默认 0（可以贴在一起但不能交换顺序）。 |
| `marks` | `SliderMark[]` |  | 刻度表：轨道上的圆点与文案，点文案即跳值。 |
| `snapToMarks` | `boolean` |  | 只认刻度落点：拖动、点按与键盘都吸到最近/下一档刻度。 |
| `getValueText` | `(details: SliderValueTextDetails) => string` |  | 把值翻成人话，产出写进拇指的 aria-valuetext。 不给就不写这个属性，读屏退回念 aria-valuenow。 |
| `onValueChange` | `(details: SliderValueChangeDetails) => void` |  | 每次推动都发；拖动过程中会连续发很多次。 |
| `onValueChangeEnd` | `(details: SliderValueChangeEndDetails) => void` |  | 只在一次操作结束时发一次，适合拿来发请求。 |

### 事件

自定义元素将载荷放在 `detail`；Vue 使用同名 emit。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `value-change` | `SliderValueTextDetails` | 值变化（拖动途中会连发）；detail 为 `{ value: number[] }` |
| `value-change-end` | `SliderValueChangeEndDetails` | 一次操作收尾发一次；detail 为 `{ value: number[], index: number }` |

### 插槽

仅列出带载荷的插槽。

| Vue 组件 | 插槽 | 载荷 | 说明 |
| --- | --- | --- | --- |
| `XhSliderRoot` | `default` | `SliderRootSlotProps` |  |
| `XhSliderTickGroup` | `tick` | `SliderTickGroupTickSlotProps` |  |

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
| `valueText` | `(index: number) => string` | 某个拇指的值文本：给了 getValueText 就是它的产出，否则是值本身。 |
| `setValue` | `(next: number[]) => void` |  |
| `setThumbValue` | `(index: number, next: number) => void` |  |
| `getRootProps` | `() => T['element']` |  |
| `getLabelProps` | `() => T['label']` |  |
| `getControlProps` | `() => T['element']` |  |
| `getTrackProps` | `() => T['element']` |  |
| `getRangeProps` | `() => T['element']` |  |
| `getThumbProps` | `(index: number) => T['element']` |  |
| `getValueTextProps` | `(index: number) => T['element']` | 值气泡：挂在拇指里显示这一个拇指的当前值；aria-hidden，读屏走拇指自己的 aria-valuetext。 |
| `getTickGroupProps` | `() => T['element']` | 刻度容器。 |
| `getTickProps` | `(props: SliderTickProps) => T['element']` | 刻度点：轨道上的圆点，纯装饰。 |
| `getTickLabelProps` | `(props: SliderTickProps) => T['element']` | 刻度文案：点按把最近的滑块跳到这一档。 |
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
| `root` | `data-size` | props.size |
| `root` | `data-tone` | props.tone |
| `thumb` | `data-dragging` | ''（条件成立时才出现） |
| `thumb` | `data-index` | String(thumb.index) |
| `value-text` | `data-dragging` | ''（条件成立时才出现） |
| `value-text` | `data-index` | String(thumb.index) |
| `tick` | `data-passed` | ''（条件成立时才出现） |
| `tick-label` | `data-passed` | ''（条件成立时才出现） |
| `hidden-input` | `data-index` | String(thumb.index) |

<!-- xh-component-tokens:start -->
### CSS 变量

本组件公开覆盖槽由独立皮肤的实际消费位生成；缺省来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 缺省来源 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `--xh-slider-control-gutter` | `control`<br>`root`<br>`tick-label` | `margin-inline` | `has([data-part='tick-label'])`<br>`orientation=horizontal` | `--xh-space-6` | slider 的 control、root、tick-label 部件 margin-inline 覆盖槽。 |
| `--xh-slider-gap` | `root` | `gap` | `default` | `--xh-stack-gap-md` | slider 的 root 部件 gap 覆盖槽。 |
| `--xh-slider-label-fg` | `label` | `color` | `default` | `--xh-fg-muted` | slider 的 label 部件 color 覆盖槽。 |
| `--xh-slider-label-font-size` | `label` | `font-size` | `default` | `--xh-text-label-size` | slider 的 label 部件 font-size 覆盖槽。 |
| `--xh-slider-label-font-weight` | `label` | `font-weight` | `default` | `--xh-text-label-weight` | slider 的 label 部件 font-weight 覆盖槽。 |
| `--xh-slider-range-bg` | `range` | `background` | `default` | `--xh-_tone` | slider 的 range 部件 background 覆盖槽。 |
| `--xh-slider-range-bg-invalid` | `range` | `background` | `invalid` | `--xh-border-invalid` | slider 的 range 部件 background 覆盖槽。 |
| `--xh-slider-range-radius` | `range` | `border-radius` | `default` | `--xh-shape-pill` | slider 的 range 部件 border-radius 覆盖槽。 |
| `--xh-slider-thumb-bg` | `thumb` | `background` | `default` | `--xh-_tone` | slider 的 thumb 部件 background 覆盖槽。 |
| `--xh-slider-thumb-bg-invalid` | `thumb` | `background` | `invalid` | `--xh-border-invalid` | slider 的 thumb 部件 background 覆盖槽。 |
| `--xh-slider-thumb-border` | `thumb` | `border` | `default` | `--xh-bg-surface` | slider 的 thumb 部件 border 覆盖槽。 |
| `--xh-slider-thumb-radius` | `thumb` | `border-radius` | `default` | `--xh-shape-pill` | slider 的 thumb 部件 border-radius 覆盖槽。 |
| `--xh-slider-thumb-scale-dragging` | `thumb` | `scale` | `dragging` | `--xh-motion-scale-drag` | slider 的 thumb 部件 scale 覆盖槽。 |
| `--xh-slider-thumb-shadow` | `thumb` | `box-shadow` | `default` | `--xh-elevation-raised` | slider 的 thumb 部件 box-shadow 覆盖槽。 |
| `--xh-slider-thumb-shadow-dragging` | `thumb` | `box-shadow` | `dragging` | `--xh-elevation-lifted` | slider 的 thumb 部件 box-shadow 覆盖槽。 |
| `--xh-slider-thumb-size` | `control`<br>`root`<br>`thumb` | `block-size`<br>`inline-size`<br>`margin-block-end`<br>`margin-block-start`<br>`margin-inline-start` | `default`<br>`orientation=horizontal`<br>`orientation=vertical`<br>`size=lg`<br>`size=sm` | `--xh-space-3`<br>`--xh-space-6`<br>`--xh-track-thumb-size` | slider 的 control、root、thumb 部件 block-size、inline-size、margin-block-end、margin-block-start、margin-inline-start 覆盖槽。 |
| `--xh-slider-tick-bg` | `tick` | `background` | `default` | `--xh-border-strong` | slider 的 tick 部件 background 覆盖槽。 |
| `--xh-slider-tick-bg-active` | `tick` | `background` | `passed` | `--xh-_tone` | slider 的 tick 部件 background 覆盖槽。 |
| `--xh-slider-tick-label-fg` | `tick-label` | `color` | `default` | `--xh-fg-subtle` | slider 的 tick-label 部件 color 覆盖槽。 |
| `--xh-slider-tick-label-fg-active` | `tick-label` | `color` | `passed` | `--xh-fg-default` | slider 的 tick-label 部件 color 覆盖槽。 |
| `--xh-slider-tick-label-font-size` | `tick-label` | `font-size` | `default` | `--xh-text-caption-size` | slider 的 tick-label 部件 font-size 覆盖槽。 |
| `--xh-slider-tick-label-gap` | `root`<br>`tick-label` | `margin-block-start`<br>`margin-inline-start` | `default`<br>`orientation=vertical` | `--xh-space-1` | slider 的 root、tick-label 部件 margin-block-start、margin-inline-start 覆盖槽。 |
| `--xh-slider-tick-radius` | `tick` | `border-radius` | `default` | `--xh-shape-pill` | slider 的 tick 部件 border-radius 覆盖槽。 |
| `--xh-slider-tick-size` | `tick` | `block-size`<br>`inline-size` | `default` | `--xh-space-1` | slider 的 tick 部件 block-size、inline-size 覆盖槽。 |
| `--xh-slider-track-bg` | `track` | `background` | `default` | `--xh-bg-subtle-active` | slider 的 track 部件 background 覆盖槽。 |
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
