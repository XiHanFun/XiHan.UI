# Progress 进度条

表示一件事的完成程度，或一个量在已知区间里的位置。线形、环形与仪表盘三种形态；量加上分段、目标与刻度，就是仪表盘与子弹图。

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/progress" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/progress.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/progress" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/progress" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/progress.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## 用法

value 与 max 共同决定百分比

<XhDemo src="progress/01-basic" />

## 组件结构

加粗的是必需部件。

`data-scope="progress"`：**`root`** · `canvas` · `track` · `range` · `buffer` · `label` · `threshold` · `target` · `scale` · `scale-tick` · `scale-label` · `needle`

## 示例

### 配文字说明

进度条自身只绘制轨道与进度，百分比文字由使用者放置

<XhDemo src="progress/02-labelled" />

### 自定义量程

max 不是 100 时按 value/max 折算，用于「已完成 3/8 步」这类场景

<XhDemo src="progress/03-max" />

### 颜色

tone 决定进度段用哪族颜色，不写时沿用品牌色

<XhDemo src="progress/04-tone" />

### 尺寸

size 只改变轨道厚度，不写即默认中档

<XhDemo src="progress/05-size" />

### 自定义外观

轨道色、进度段色与轨道厚度各是一个组件令牌，纯色与渐变都可以使用

<XhDemo src="progress/06-custom-appearance" />

### 环形

variant="circle" 把同一份进度绘制为环，尺寸档改变的是直径

<XhDemo src="progress/07-circle" />

### 缺口

variant="dashboard" 在环上留一个缺口，gapDegree 与 gapPosition 决定缺口大小与朝向

<XhDemo src="progress/08-dashboard" />

### 环心文字

组件只负责把内容放置到环心，写什么由使用者决定

<XhDemo src="progress/09-circle-label" />

### 环的外观

直径、颜色与端点经令牌，线宽经 strokeWidth：它改变的是几何，半径随之向内收缩

<XhDemo src="progress/10-circle-appearance" />

### 仪表盘

量（semantics="meter"）的仪表盘：thresholds 画出分段色带，scale 画出量程刻度，indicator 选填充或指针

<XhDemo src="progress/11-gauge" />

### 子弹图

线形的量加上分段与目标：色带是好坏区间，中间一条是实际值，竖线是目标，下方是量程刻度

<XhDemo src="progress/12-bullet" />

### 分段

steps 把轨道切成等宽的格，填充按整格亮起；读屏报的仍是实际值

<XhDemo src="progress/13-steps" />

### 条纹

striped 在填充上铺一层斜纹，进行中沿行向流动，完成后静止；减弱动效下不流动

<XhDemo src="progress/14-striped" />

### 缓冲

buffer 在填充之后画第二段浅色填充，表示已经就绪、还没用到的那一截，如视频已缓冲到的位置

<XhDemo src="progress/15-buffer" />

## 设计指引

### 何时使用

- 上传、导出、批处理等有确定完成度的过程。
- 容量、配额等比例值。
- 一个量对照好坏区间或目标值：CPU 占用对照警戒线（仪表盘），本季销售额对照目标（子弹图）。

### 何时不用

- 完成度未知时，使用[加载指示器](./spinner)或[加载条](./loading-bar)的爬升模式。
- 表示步骤而不是比例时，使用[步骤条](./steps)。
- 要看一个量随时间怎么走：使用[迷你图](./sparkline)或[直角坐标图](./cartesian-chart)，仪表盘只报此刻。
- 比较多个量的大小：使用直角坐标图的横向条形图，一排仪表盘难以互相比较。

### 特性

- `variant` 三档：线形、环形、仪表盘；仪表盘的缺口角度与位置可调。
- `indeterminate` 表达进行中但剩余量未知。
- `valueText` 决定读屏读出的内容：“3 个文件中的第 2 个”比“66%”更有用。
- 环心可以放置文字，文字 12px、次级色。
- 线形轨道厚 sm / md / lg = 3 / 4 / 8px、两端全圆，底槽（线形与环形同）取中性淡底；已完成的那段取语气实色，成功 / 警告 / 危险写 `tone`。
- 线形另有三样外观，写在环形上会报 `progress.option-ignored` 并按没给处理：
  - `steps` 把轨道切成等宽的格，格间留一道间隙；填充按整格亮起，不足一格的部分不画，读屏报的仍是实际值。取不小于 2 的整数，取值不合法同样报错。
  - `striped` 在填充上铺一层斜纹：进行中沿行向流动，完成后静止；减弱动效下始终静止，强制色下退掉斜纹、只留高亮色填充。
  - `buffer` 在填充之后画第二段浅色填充，表示已经就绪、还没用到的那一截（视频已缓冲到的位置）。它只属于进度：`semantics="meter"` 下报错不画，进度未知时也不画；低于 `value` 的部分被填充盖住。缓冲段由 Vue 与 React 直接渲染，Web Components 侧由元素生成进 track、排在 range 之前。
- `semantics="meter"` 报告的是量而不是进度：根是 `role="meter"`，不接受 `indeterminate`。量另有四样刻画，在进度语义下写了会报 `chart.meter-only` 并按没给处理：
  - `thresholds` 分段：按上界升序排列，每段带语气与名字，画成轨道上同族淡色的色带；当前值所在的那一段决定填充色。第一段从 0 起、含 0，其余每段含上界、不含下界，超出最后一段上界的值不属于任何一段、填充取 `tone`。上界不升序、不是有限数或越出 `(0, max]` 时报 `chart.invalid-range`，整组不画。
  - `target` 目标值：线形是一道横穿轨道、上下各探出一点的竖线，环形是一道横穿弧的短线。不在 `[0, max]` 内时报错不画。
  - `scale` 量程刻度：`true` 取缺省（约 5 个刻度），也可以写 `{ ticks, format }` 指定刻度数量与数字格式；刻度从 0 到满值取好读的步长，刻度值按 `locale` 写。线形的刻度排在轨道下方，两端的刻度值贴着轨道两端对齐；环形的刻度画在弧的内侧。
  - `indicator="needle"` 只对仪表盘有效：用一根指针指出当前值，弧上的填充收起、只留色带，环心内容让到缺口那一侧；数值变化时指针转动。写在其他形态上会报一条警告并按 `fill` 处理。
- 线形加上分段时画成子弹图：轨道加厚一档，填充收窄成中间一条压在色带上，色带在填充两侧照样读得出。
- 色带、目标刻度、刻度与指针按数据生成：Vue 与 React 直接渲染，Web Components 侧由元素生成进作者写的外壳（线形在 track 与 root 里，环形在 canvas 与 root 里）；分段与刻度的配置只走 JS property。

### 组合

- 与[统计数值](./statistic)并排；文件上传的每一项配一条。
- 仪表盘的环心放当前值；读数旁写清量的名字与单位。

### 最佳实践

- 长任务给出剩余时间或剩余数量，只有百分比难以判断等待时长。
- 到 100% 后要有明确的完成态，不停留在满格。
- 分段写上名字（「正常」「警戒」）：读屏据此在数值后补上所在的分段，颜色不是唯一线索。
- 用 `steps` 表达「第几步」时同时给 `valueText`（「第 3 步，共 5 步」），读屏才念得出步数而不是百分比。
- 条纹只用来提示「仍在进行」，不拿它区分语气或类别。
- 分段的语气只表达好坏；没有好坏之分的区间用同一种语气，不要为了好看换颜色。

### 反模式

- 进度倒退。
- 用假进度条掩盖未知的等待。
- 一页铺满仪表盘：一个仪表盘只报一个此刻的量，多个量的比较交给条形图。
- 用进度语义画分段与目标：进度只有完成多少，没有警戒区。

## API 参考

### 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-progress>` |
| Vue 组件 | `XhProgress` |
| 状态机 | 无，`connect` 直接由 props 算属性 |
| 皮肤 | `@xihan-ui/styles/progress.css` |

### Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `buffer` | `number` |  | 缓冲值：在填充之后画第二段浅色填充，表示已经就绪、还没用到的那一截（如视频已缓冲到的位置）， 越界夹到 [0, max]，低于 value 的部分被填充盖住。只在进度语义的线形下生效；进度未知时不画。 |
| `gapDegree` | `number` |  | 缺口角度，默认 75。只对 dashboard 生效。 |
| `gapPosition` | `ProgressGapPosition` |  | 缺口朝向，默认 bottom。只对 dashboard 生效。 |
| `indeterminate` | `boolean` |  | 进度未知：进度条改为往复动画，读屏侧不报数。 置真时 aria-valuenow 整体不发出：ARIA 规定不确定进度以该属性缺席表达。 |
| `indicator` | `ProgressIndicator` |  | 仪表盘的指示方式，缺省 fill。只在 meter 语义下生效，只对 dashboard 形态有意义。 |
| `locale` | `string` |  | 刻度值与读屏文字的语言；未提供时按宿主语言。 |
| `max` | `number` |  | 满值上限，默认 100；非有限值或不为正时回退为 100。 |
| `scale` | `boolean \| ProgressScaleOptions` |  | 量程刻度与刻度值：true 取缺省，也可以给刻度数量与数字格式。只在 meter 语义下生效。 |
| `semantics` | `ProgressSemantics` |  | 报告的是进度还是量，默认 progress。meter 档发出 role="meter"，且 indeterminate 不再生效。 |
| `size` | `Size` |  | 尺寸：sm / md / lg。线形影响轨道厚度，环形影响直径 |
| `steps` | `number` |  | 分段显示：把线形轨道切成这么多等宽的格，格与格之间留一道间隙。填充按整格走，不足一格的部分不画； 读屏报的仍是实际值。取不小于 2 的整数，只对线形生效；取值不合法或写在环形上时报错、按没给处理。 |
| `striped` | `boolean` |  | 条纹：填充上铺一层斜纹，进行中沿行向流动，完成后静止；减弱动效下始终静止。只对线形生效。 |
| `strokeWidth` | `number` |  | 环的线宽，使用 viewBox 单位（整个环绘制在 100×100 中），默认 6。 只对 circle / dashboard 生效：它修改的是几何（半径随之向内收缩），因此是 prop 而不是令牌； 线形的厚度仍使用 --xh-progress-thickness。 |
| `target` | `number` |  | 目标值：画一道目标刻度。只在 meter 语义下生效；不在 [0, max] 内时报错、不画。 |
| `thresholds` | `readonly ProgressThreshold[]` |  | 分段：升序的上界，每段带语气与名字，画成轨道上的色带；当前值所在的那一段决定填充色。 只在 meter 语义下生效。上界不升序、不是有限数或落在 (0, max] 之外时报错，整组不画。 |
| `tone` | `Tone` |  | 语气：brand / neutral / success / warning / danger / info，决定使用哪族颜色 |
| `translations` | `Partial<ProgressTranslations>` |  |  |
| `value` | `number` |  | 当前进度值，越界会被夹到 [0, max]；非有限值按 0 处理。 |
| `valueText` | `string` |  | 读屏播报的文字，覆盖默认的数值播报（进度不是百分比时使用，如「第 3 步，共 8 步」）。 |
| `variant` | `ProgressVariant` |  | 形态，默认 line。circle 绘制整环，dashboard 在环上留出一个缺口。 |

### ProgressThreshold

`thresholds` 的元素。

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `value` | `number` | 是 | 这一段的上界，在 (0, max] 内。 |
| `tone` | `Tone` | 是 |  |
| `label` | `string` |  | 分段的名字（如「警戒」）：当前值落在这一段时并进读屏文字。 |

### 状态

公开状态写入 `data-state`。

| 部件 | 取值 |
| --- | --- |
| `root` | 'indeterminate' \| 'complete' \| 'loading' |
| `label` | 'complete' \| 'loading' |

### connect API

`getXxxProps()` 返回对应部件的宿主属性。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `variant` | `ProgressVariant` | 落定后的形态。 |
| `semantics` | `ProgressSemantics` | 落定后的语义。 |
| `ratio` | `number` | 进度比例，[0,1]。 |
| `percent` | `number` | 进度百分比，取整。 |
| `steps` | `number` | 落定后的分段数：没分段时为 0。 |
| `buffer` | `number \| null` | 缓冲值占满值的比例；没有缓冲值或不画缓冲时为 null。 |
| `getRootProps` | `() => T['element']` |  |
| `getCanvasProps` | `() => T['element']` | 承载环的 &lt;svg&gt;；线形不渲染它。 |
| `getTrackProps` | `() => T['element']` |  |
| `getRangeProps` | `() => T['element']` |  |
| `getBufferProps` | `() => T['element']` | 缓冲段：线形画在轨道里、填充之前；没有缓冲值时带 hidden。 |
| `getLabelProps` | `() => T['element']` | 环心区域：落位归皮肤，内容归作者。线形不使用。 |
| `bands` | `readonly ProgressBand[]` | 分段色带；不在 meter 语义下或没有分段时为空。 |
| `ticks` | `readonly ProgressTick[]` | 量程刻度；没开刻度时为空。 |
| `target` | `number \| null` | 目标值占满值的比例；没有目标时为 null。 |
| `indicator` | `ProgressIndicator` | 落定后的指示方式：只有 meter 语义下的 dashboard 才会是 needle。 |
| `getThresholdProps` | `(band: ProgressBand) => T['element']` | 线形画在轨道里、环形画在 canvas 里。 |
| `getTargetProps` | `() => T['element']` | 线形是轨道外的一道竖线，环形是横穿弧的一道短线。 |
| `getScaleProps` | `() => T['element']` | 刻度值的容器：线形排在轨道下方，环形叠在环上。 |
| `getScaleTickProps` | `(tick: ProgressTick) => T['element']` | 线形画在 scale 里，环形画在 canvas 里。 |
| `getScaleLabelProps` | `(tick: ProgressTick) => T['element']` |  |
| `getNeedleProps` | `() => T['element']` | 仪表盘的指针，画在 canvas 里。 |

## 无障碍

### 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/meter/)

无键盘交互（不接收焦点，或焦点行为完全由原生元素提供）。

### ARIA

以下属性由 `connect` 生成。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `aria-valuemax` | String(max) |
| `root` | `aria-valuemin` | '0' |
| `root` | `aria-valuenow` | undefined \| String(value) |
| `root` | `aria-valuetext` | props.valueText |
| `root` | `role` | 'meter' \| 'progressbar' |
| `canvas` | `aria-hidden` | 'true' |
| `scale` | `aria-hidden` | 'true' |

- 进度是 `role="progressbar"`，量是 `role="meter"`；`aria-valuenow`、`aria-valuemin`、`aria-valuemax` 由组件写出，名字由作者写在根上（`aria-label` 或 `aria-labelledby`）。
- 当前值落在带名字的分段里时，`aria-valuetext` 写成「百分数, 分段名」（模板是 `translations.segmentValueText`，缺省英文逗号，按语言改写）；作者给了 `valueText` 时只念作者那句。
- 色带、目标刻度、刻度与指针都是装饰：`role="meter"` 的子节点对读屏是表象，刻度值另在 `scale` 上 `aria-hidden`。
- 强制色下填充取系统高亮色；线形色带退成每段末端的一道分界线，环形色带退掉，分段名仍由读屏文字给出。

## 样式参考

### 皮肤

`@xihan-ui/styles/progress.css` 按 `[data-scope="progress"][data-part="root"]` 部件选择器书写，发布产物以挂载类 `.xh-scope-progress` 代替其中的 data-scope（特异性相同），位于 `xihan.components` 与 `xihan.motion` 层。覆盖样式使用 `xihan.overrides`，部件选择器照常可用。

`forced-colors: active` 下另有一套规则：颜色交给系统，边框与状态标记改用系统色关键字。

### 数据属性

由 `connect` 生成；条件不成立时不输出无值属性。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-banded` | ''（条件成立时才出现） |
| `root` | `data-indicator` | 'needle' \| undefined |
| `root` | `data-size` | props.size |
| `root` | `data-state` | 'indeterminate' \| 'complete' \| 'loading' |
| `root` | `data-tone` | props.tone |
| `root` | `data-variant` | props.variant |
| `canvas` | `data-variant` | props.variant |
| `track` | `data-stepped` | ''（条件成立时才出现） |
| `range` | `data-empty` | ''（条件成立时才出现） |
| `range` | `data-indicator` | 'needle' \| undefined |
| `range` | `data-striped` | ''（条件成立时才出现） |
| `range` | `data-tone` | active?.tone |
| `buffer` | `data-tone` | props.tone |
| `buffer` | `data-variant` | props.variant |
| `label` | `data-indicator` | 'needle' \| undefined |
| `label` | `data-state` | 'complete' \| 'loading' |
| `label` | `data-variant` | props.variant |
| `threshold` | `data-tone` | band.tone |
| `threshold` | `data-variant` | props.variant |
| `target` | `data-variant` | props.variant |
| `scale` | `data-variant` | props.variant |
| `scale-tick` | `data-variant` | props.variant |
| `scale-label` | `data-variant` | props.variant |

<!-- xh-component-tokens:start -->
### CSS 变量

本组件公开覆盖槽由独立皮肤的实际消费位生成；默认来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 默认来源 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `--xh-progress-buffer` | `buffer` | `background` | `default` | `--xh-_tone-subtle-active` | progress 的 buffer 部件 background 覆盖槽。 |
| `--xh-progress-buffer-radius` | `buffer` | `border-radius` | `default` | `--xh-progress-range-radius` | progress 的 buffer 部件 border-radius 覆盖槽。 |
| `--xh-progress-indeterminate-duration` | `range` | `animation` | `state=indeterminate` | `--xh-motion-loop-shimmer` | progress 的 range 部件 animation 覆盖槽。 |
| `--xh-progress-label-fg` | `label` | `color` | `default` | `--xh-fg-muted` | progress 的 label 部件 color 覆盖槽。 |
| `--xh-progress-label-font-size` | `label` | `font-size` | `default` | `--xh-text-caption-size` | progress 的 label 部件 font-size 覆盖槽。 |
| `--xh-progress-linecap` | `range` | `stroke-linecap` | `variant=circle`<br>`variant=dashboard` | `round` | progress 的 range 部件 stroke-linecap 覆盖槽。 |
| `--xh-progress-needle-color` | `needle` | `fill` | `default` | `--xh-fg-default` | progress 的 needle 部件 fill 覆盖槽。 |
| `--xh-progress-range` | `range` | `background`<br>`stroke` | `default`<br>`variant=circle`<br>`variant=dashboard` | `--xh-_tone` | progress 的 range 部件 background、stroke 覆盖槽。 |
| `--xh-progress-range-radius` | `buffer`<br>`range` | `border-radius` | `default` | `--xh-shape-pill` | progress 的 buffer、range 部件 border-radius 覆盖槽。 |
| `--xh-progress-size` | `root` | `block-size`<br>`inline-size` | `size=lg`<br>`size=sm`<br>`variant=circle`<br>`variant=dashboard` | `10rem`<br>`5rem`<br>`7.5rem` | progress 的 root 部件 block-size、inline-size 覆盖槽。 |
| `--xh-progress-step-gap` | `track` | `-webkit-mask-image`<br>`mask-image` | `stepped` | `--xh-space-0_5` | progress 的 track 部件 -webkit-mask-image、mask-image 覆盖槽。 |
| `--xh-progress-stripe-color` | `range` | `background-image` | `striped` | `--xh-_tone-active` | progress 的 range 部件 background-image 覆盖槽。 |
| `--xh-progress-stripe-duration` | `range` | `animation` | `state=loading`<br>`striped` | `--xh-motion-loop-shimmer` | progress 的 range 部件 animation 覆盖槽。 |
| `--xh-progress-stripe-size` | `range` | `background-position`<br>`background-size` | `@keyframes xh-progress-stripes`<br>`striped` | `--xh-space-4` | progress 的 range 部件 background-position、background-size 覆盖槽。 |
| `--xh-progress-target-color` | `target` | `background`<br>`stroke` | `variant=circle`<br>`variant=dashboard`<br>`variant=line` | `--xh-fg-default` | progress 的 target 部件 background、stroke 覆盖槽。 |
| `--xh-progress-target-radius` | `target` | `border-radius` | `variant=line` | `--xh-shape-pill` | progress 的 target 部件 border-radius 覆盖槽。 |
| `--xh-progress-thickness` | `root`<br>`target`<br>`track` | `block-size` | `banded`<br>`default`<br>`size=lg`<br>`size=sm`<br>`variant=line` | `--xh-space-1`<br>`--xh-space-2`<br>`--xh-space-3`<br>`--xh-space-4`<br>`--xh-stroke-strong` | progress 的 root、target、track 部件 block-size 覆盖槽。 |
| `--xh-progress-threshold-color` | `threshold` | `background`<br>`stroke` | `variant=circle`<br>`variant=dashboard`<br>`variant=line` | `--xh-_tone-subtle-active` | progress 的 threshold 部件 background、stroke 覆盖槽。 |
| `--xh-progress-track` | `track` | `background`<br>`stroke` | `default`<br>`variant=circle`<br>`variant=dashboard` | `--xh-bg-subtle-hover` | progress 的 track 部件 background、stroke 覆盖槽。 |
| `--xh-progress-track-radius` | `track` | `border-radius` | `default` | `--xh-shape-pill` | progress 的 track 部件 border-radius 覆盖槽。 |
<!-- xh-component-tokens:end -->

### 动效

动效角色：指示与换位 · 循环（见[动效规范](../design/motion#角色)）。

可覆盖的动效槽：`--xh-progress-indeterminate-duration` · `--xh-progress-stripe-duration`。

关键帧 `xh-progress-indeterminate` · `xh-progress-stripes` 随皮肤自带，不引用别处文件里的名字；`rotate` · `stroke-dashoffset` · `translate` 走 `transition` 过渡。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

`prefers-reduced-motion: reduce` 下本组件另有降级规则。

### RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像；只认物理方向的量乘 `--xh-direction-sign` 换向，按就近的 `dir` 走；另有按 `dir` 分支的规则。
