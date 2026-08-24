# 进度条 <Badge type="info" text="progress" />

表示一件事完成了多少。线形、环形与仪表盘三种画法。

## 何时使用

- 上传、导出、批处理这类有确定完成度的过程。
- 用容量、配额这类比例值。

## 何时不用

- 完成度未知：用[加载指示器](./spinner)或[加载条](./loading-bar)的爬升模式。
- 表示的是步骤而不是比例：用[步骤条](./steps)。

## 特性

- `variant` 三档：线形、环形、仪表盘；仪表盘的缺口角度与位置可调。
- `indeterminate` 表达"进行中但不知道还剩多少"。
- `valueText` 决定读屏念出的是什么——"3 个文件中的第 2 个"比"66%"有用得多。
- 环心可以放文字。

## 示例

### 基础用法

value 与 max 共同决定百分比

<XhDemo src="progress/01-basic" />

### 配文字说明

进度条自身只画轨道与进度，百分比文字由使用者摆

<XhDemo src="progress/02-labelled" />

### 自定义量程

max 不是 100 时按 value/max 折算，用于「已完成 3/8 步」这类场景

<XhDemo src="progress/03-max" />

### 语气

tone 决定进度段用哪族颜色，不写时沿用品牌色

<XhDemo src="progress/04-tone" />

### 尺寸

size 只改轨道厚度，不写即缺省中档

<XhDemo src="progress/05-size" />

### 自定义外观

轨道色、进度段色与轨道厚度各是一个组件令牌，纯色与渐变都塞得进去

<XhDemo src="progress/06-custom-appearance" />

### 环形

variant="circle" 把同一份进度画成环，尺寸档改的是直径

<XhDemo src="progress/07-circle" />

### 仪表盘

variant="dashboard" 在环上留一个缺口，gapDegree 与 gapPosition 决定它多大、朝哪

<XhDemo src="progress/08-dashboard" />

### 环心文字

组件只负责把内容摆到环心，写什么由使用者决定

<XhDemo src="progress/09-circle-label" />

### 环的外观

直径、颜色与端点走令牌，线宽走 strokeWidth：它改的是几何，半径跟着往里收

<XhDemo src="progress/10-circle-appearance" />

## 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-progress>` |
| Vue 组件 | `XhProgress` |
| 状态机 | 无，`connect` 直接由 props 算属性 |
| 皮肤 | `@xihan-ui/styles/progress.css` |

## 解剖

部件名即 `data-part` 属性值，也是皮肤的选择器。加粗的是必备部件，不渲染它组件不工作（Web Components 适配器会在诊断通道上报 `wc.missing-part`）。

`data-scope="progress"`：**`root`** · `canvas` · `track` · `range` · `label`

## Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `gapDegree` | `number` |  | 缺口角度，默认 75。只对 dashboard 生效。 |
| `gapPosition` | `ProgressGapPosition` |  | 缺口朝向，默认 bottom。只对 dashboard 生效。 |
| `indeterminate` | `boolean` |  | 进度未知：条子改为往复动画，读屏那侧不报数。 置真时 aria-valuenow 整个不发——ARIA 规定不确定进度以该属性缺席表达。 |
| `max` | `number` |  | 满值上限，默认 100；非有限值或不为正时回落 100。 |
| `size` | `Size` |  | 尺寸：sm / md / lg。线形改轨道厚度，环形改直径 |
| `strokeWidth` | `number` |  | 环的线宽，走 viewBox 单位（整个环画在 100×100 里），默认 6。 只对 circle / dashboard 生效——它改的是几何（半径跟着往里收），所以是 prop 不是令牌； 线形的厚度仍走 --xh-progress-thickness。 |
| `tone` | `Tone` |  | 语气：brand / neutral / success / warning / danger / info，决定用哪族颜色 |
| `value` | `number` |  | 当前进度值，越界会被夹到 [0, max]；非有限值按 0 处理。 |
| `valueText` | `string` |  | 读屏播报的文字，覆盖默认的数值播报（进度不是百分比时用，如「第 3 步，共 8 步」）。 |
| `variant` | `ProgressVariant` |  | 形态，默认 line。circle 画整环，dashboard 在环上留一个缺口。 |

## 状态

对外可见的状态落在 `data-state` 上，写样式与断言都读它：

| 部件 | 取值 |
| --- | --- |
| `root` | 'indeterminate' \| 'complete' \| 'loading' |
| `label` | 'complete' \| 'loading' |

## connect API

`connect` 产出的对象。`getXxxProps()` 铺到对应部件的宿主元素上，其余是可读状态与操作入口。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `variant` | `ProgressVariant` | 落定后的形态。 |
| `ratio` | `number` | 进度比例，[0,1]。 |
| `percent` | `number` | 进度百分比，取整。 |
| `getRootProps` | `() => T['element']` |  |
| `getCanvasProps` | `() => T['element']` | 承载环的 &lt;svg&gt;；线形不渲染它。 |
| `getTrackProps` | `() => T['element']` |  |
| `getRangeProps` | `() => T['element']` |  |
| `getLabelProps` | `() => T['element']` | 环心那一块：落位归皮肤，写什么归作者。线形用不到。 |

## 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/meter/)

无键盘交互（不接收焦点，或焦点行为完全由原生元素提供）。

## 无障碍

下面这些由 `connect` 铺到部件上，作者不必自己写；重复写反而会覆盖掉正确值。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `aria-valuemax` | String(max) |
| `root` | `aria-valuemin` | '0' |
| `root` | `aria-valuenow` | undefined \| String(value) |
| `root` | `aria-valuetext` | props.valueText |
| `root` | `role` | 'progressbar' |
| `canvas` | `aria-hidden` | 'true' |

## 样式

默认皮肤 `@xihan-ui/styles/progress.css` 按部件选择：`[data-scope="progress"][data-part="root"]`。它落在 `xihan.components` 与 `xihan.motion` 层；业务样式不写进 `@layer` 即高于全部库层，要按层压过来就写进 `xihan.overrides`。

## 数据属性

由 `connect` 产出并铺到部件上，皮肤与测试都据此选择；`data-disabled` 这类无值属性在条件不成立时整个不出现。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-size` | props.size |
| `root` | `data-state` | 'indeterminate' \| 'complete' \| 'loading' |
| `root` | `data-tone` | props.tone |
| `root` | `data-variant` | props.variant |
| `canvas` | `data-variant` | props.variant |
| `range` | `data-empty` | ''（条件成立时才出现） |
| `label` | `data-state` | 'complete' \| 'loading' |
| `label` | `data-variant` | props.variant |

## CSS 变量

本组件皮肤读的组件级令牌，写在组件自身或任意祖先上都生效。缺省值来自[设计令牌](../guide/theme)，不设即按缺省走。

`--xh-progress-indeterminate-duration` · `--xh-progress-label-fg` · `--xh-progress-label-font-size` · `--xh-progress-linecap` · `--xh-progress-range` · `--xh-progress-range-radius` · `--xh-progress-size` · `--xh-progress-thickness` · `--xh-progress-track` · `--xh-progress-track-radius`

## 动效

关键帧 `xh-progress-indeterminate` 随皮肤自带，不引用别处文件里的名字；状态切换走 `transition`。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

`prefers-reduced-motion: reduce` 下本组件另有降级规则。

## RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像。

## 组合

- 与[统计数值](./statistic)并排；文件上传的每一项配一条。

## 最佳实践

- 长任务给出剩余时间或剩余数量，光有百分比很难判断还要等多久。
- 到 100% 后要有明确的完成态，别停在满格不动。

## 反模式

- 进度会倒退。
- 用假进度条掩盖未知的等待。
