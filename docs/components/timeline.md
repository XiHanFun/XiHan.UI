# Timeline <Badge type="info" text="时间线" />

按时间顺序排开的一串事件，每条有标记、连接线与内容。

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/timeline" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/timeline.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/timeline" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/timeline" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/timeline.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## 用法

一条竖向的事件流：每条一个圆点，圆点之间连一截线，末条的线自动收掉

<XhDemo src="timeline/01-basic" />

## 示例

### 逐条语气

tone 写在条目上，只给这一条的圆点上色；不写 tone 的条目是中性圆点

<XhDemo src="timeline/02-tone" />

### 内容在哪一侧

placement 决定内容落在线的哪一侧；alternate 是逐条交替，线走中间

<XhDemo src="timeline/03-placement" />

### 横排

orientation="horizontal" 把事件从左往右摆，连线随之转成横的一条

<XhDemo src="timeline/04-horizontal" />

### 尺寸

size 换的是圆点直径、条目间距与字号，不传 size 即默认档

<XhDemo src="timeline/05-size" />

### 坐标列

label 与内容对置：逐条交替排布时时间戳仍停在同一侧，不跟着内容左右横跳

<XhDemo src="timeline/06-label" />

## 设计指引

### 何时使用

- 展示已经发生的事件序列：审批记录、物流轨迹、变更历史。

### 何时不用

- 表达"还要走几步"：用[步骤条](./steps)——时间线是回顾，步骤条是前瞻。
- 事件之间没有时间关系：用[列表](./list)。

### 特性

- 逐条可以有自己的语气（成功 / 失败 / 进行中）。
- 内容可以固定在一侧，也可以左右交替。
- 支持横排。
- `label` 是与内容对置的那一列，装这一条的坐标（日期、版本号）；逐条交替排布时时间戳因此不跟着内容左右横跳。

## 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-timeline>` |
| Vue 组件 | `XhTimelineConnector` `XhTimelineContent` `XhTimelineDescription` `XhTimelineIndicator` `XhTimelineItem` `XhTimelineLabel` `XhTimelineRoot` `XhTimelineTime` `XhTimelineTitle` |
| 状态机 | 无，`connect` 直接由 props 算属性 |
| 皮肤 | `@xihan-ui/styles/timeline.css` |

## 解剖

部件名即 `data-part` 属性值，也是皮肤的选择器。加粗的是必备部件，不渲染它组件不工作（Web Components 适配器会在诊断通道上报 `wc.missing-part`）。

`data-scope="timeline"`：**`root`** · **`item`** · `label` · `indicator` · `connector` · `content` · `title` · `description` · `time`

## Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `orientation` | `Orientation` |  | 事件排列方向：vertical 自上而下、horizontal 自起点向终点，缺省 vertical。 |
| `placement` | `TimelinePlacement` |  | 内容在线的哪一侧：start / end / alternate，不写则内容落在结束侧。 |
| `size` | `Size` |  | 尺寸：sm / md / lg，决定圆点直径、条目间距与字号。 |

## connect API

`connect` 产出的对象。`getXxxProps()` 铺到对应部件的宿主元素上，其余是可读状态与操作入口。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `getRootProps` | `() => T['element']` |  |
| `getItemProps` | `() => T['element']` |  |
| `getLabelProps` | `() => T['element']` | 与内容对置的那一列，装这一条的坐标；排布随整条线的方向与侧别走。 |
| `getIndicatorProps` | `(props: TimelineItemProps) => T['element']` | 圆点的语气取自它所属的条目。 |
| `getConnectorProps` | `() => T['element']` |  |
| `getContentProps` | `() => T['element']` |  |
| `getTitleProps` | `() => T['element']` |  |
| `getDescriptionProps` | `() => T['element']` |  |
| `getTimeProps` | `() => T['element']` |  |

## 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/)

无键盘交互（不接收焦点，或焦点行为完全由原生元素提供）。

## 无障碍

下面这些由 `connect` 铺到部件上，作者不必自己写；重复写反而会覆盖掉正确值。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `role` | 'list' |
| `item` | `role` | 'listitem' |
| `indicator` | `aria-hidden` | 'true' |
| `connector` | `aria-hidden` | 'true' |

## 样式

默认皮肤 `@xihan-ui/styles/timeline.css` 按部件选择：`[data-scope="timeline"][data-part="root"]`。它落在 `xihan.components` 层；业务样式不写进 `@layer` 即高于全部库层，要按层压过来就写进 `xihan.overrides`。

## 数据属性

由 `connect` 产出并铺到部件上，皮肤与测试都据此选择；`data-disabled` 这类无值属性在条件不成立时整个不出现。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-orientation` | props.orientation |
| `root` | `data-placement` | props.placement |
| `root` | `data-size` | props.size |
| `item` | `data-orientation` | props.orientation |
| `item` | `data-placement` | props.placement |
| `label` | `data-orientation` | props.orientation |
| `label` | `data-placement` | props.placement |
| `indicator` | `data-tone` | item.tone |
| `connector` | `data-orientation` | props.orientation |

<!-- xh-component-tokens:start -->
## CSS 变量

本组件公开覆盖槽由独立皮肤的实际消费位生成；缺省来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 缺省来源 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `--xh-timeline-connector-bg` | `connector` | `background` | `default` | `--xh-border-default` | timeline 的 connector 部件 background 覆盖槽。 |
| `--xh-timeline-connector-min-length` | `connector`<br>`item`<br>`label` | `min-block-size`<br>`min-inline-size` | `@media (min-width: 768px)`<br>`default`<br>`has(> [data-scope='timeline'][data-part='label'])`<br>`orientation=horizontal` | `--xh-space-4` | timeline 的 connector、item、label 部件 min-block-size、min-inline-size 覆盖槽。 |
| `--xh-timeline-connector-radius` | `connector` | `border-radius` | `default` | `--xh-shape-pill` | timeline 的 connector 部件 border-radius 覆盖槽。 |
| `--xh-timeline-connector-thickness` | `connector`<br>`item`<br>`label` | `block-size`<br>`inline-size` | `@media (min-width: 768px)`<br>`default`<br>`has(> [data-scope='timeline'][data-part='label'])`<br>`orientation=horizontal` | `--xh-stroke-thick` | timeline 的 connector、item、label 部件 block-size、inline-size 覆盖槽。 |
| `--xh-timeline-content-gap` | `content` | `gap` | `default` | `--xh-space-1` | timeline 的 content 部件 gap 覆盖槽。 |
| `--xh-timeline-content-pb` | `content`<br>`item` | `padding-block-end` | `@media (min-width: 768px)`<br>`nth-child(even)`<br>`orientation=horizontal`<br>`placement=alternate`<br>`placement=start` | `--xh-space-2` | timeline 的 content、item 部件 padding-block-end 覆盖槽。 |
| `--xh-timeline-content-pt` | `content`<br>`item`<br>`label` | `padding-block-start` | `@media (min-width: 768px)`<br>`has(> [data-scope='timeline'][data-part='label'])`<br>`orientation=horizontal` | `--xh-space-2` | timeline 的 content、item、label 部件 padding-block-start 覆盖槽。 |
| `--xh-timeline-description-fg` | `description` | `color` | `default` | `--xh-fg-muted` | timeline 的 description 部件 color 覆盖槽。 |
| `--xh-timeline-description-font-size` | `description` | `font-size` | `default` | `--xh-text-body-size` | timeline 的 description 部件 font-size 覆盖槽。 |
| `--xh-timeline-fg` | `root` | `color` | `default` | `--xh-fg-default` | timeline 的 root 部件 color 覆盖槽。 |
| `--xh-timeline-gutter` | `item` | `column-gap` | `default` | `--xh-_timeline-gutter` | timeline 的 item 部件 column-gap 覆盖槽。 |
| `--xh-timeline-indicator-bg` | `indicator` | `background` | `default` | `--xh-_tone-soft` | timeline 的 indicator 部件 background 覆盖槽。 |
| `--xh-timeline-indicator-fg` | `indicator` | `color` | `default` | `--xh-_tone-on` | timeline 的 indicator 部件 color 覆盖槽。 |
| `--xh-timeline-indicator-font-size` | `indicator` | `font-size` | `default` | `--xh-_timeline-caption-font-size` | timeline 的 indicator 部件 font-size 覆盖槽。 |
| `--xh-timeline-indicator-radius` | `indicator` | `border-radius` | `default` | `--xh-shape-pill` | timeline 的 indicator 部件 border-radius 覆盖槽。 |
| `--xh-timeline-indicator-size` | `indicator`<br>`item` | `block-size`<br>`inline-size`<br>`margin-block-start` | `default` | `--xh-_timeline-dot-size` | timeline 的 indicator、item 部件 block-size、inline-size、margin-block-start 覆盖槽。 |
| `--xh-timeline-item-gap` | `content`<br>`item`<br>`label` | `padding-block-end`<br>`padding-inline-end` | `@media (min-width: 768px)`<br>`default`<br>`has(> [data-scope='timeline'][data-part='label'])`<br>`orientation=horizontal` | `--xh-_timeline-item-gap` | timeline 的 content、item、label 部件 padding-block-end、padding-inline-end 覆盖槽。 |
| `--xh-timeline-label-fg` | `label` | `color` | `default` | `--xh-fg-subtle` | timeline 的 label 部件 color 覆盖槽。 |
| `--xh-timeline-label-font-size` | `label` | `font-size` | `default` | `--xh-_timeline-caption-font-size` | timeline 的 label 部件 font-size 覆盖槽。 |
| `--xh-timeline-time-fg` | `time` | `color` | `default` | `--xh-fg-subtle` | timeline 的 time 部件 color 覆盖槽。 |
| `--xh-timeline-time-font-size` | `time` | `font-size` | `default` | `--xh-_timeline-caption-font-size` | timeline 的 time 部件 font-size 覆盖槽。 |
| `--xh-timeline-title-fg` | `title` | `color` | `default` | `--xh-fg-default` | timeline 的 title 部件 color 覆盖槽。 |
| `--xh-timeline-title-font-size` | `indicator`<br>`item`<br>`root`<br>`title` | `font-size`<br>`margin-block-start` | `default` | `--xh-_timeline-title-font-size` | timeline 的 indicator、item、root、title 部件 font-size、margin-block-start 覆盖槽。 |
| `--xh-timeline-title-font-weight` | `title` | `font-weight` | `default` | `--xh-text-label-weight` | timeline 的 title 部件 font-weight 覆盖槽。 |
<!-- xh-component-tokens:end -->

## 动效

`background` · `color` 走 `transition` 过渡。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。

## 响应式

皮肤按视口分档：`min-width: 768px`。

## RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像。

## 组合

- 时间位放[时间戳](./timestamp)；内容里放[卡片](./card)或[描述列表](./descriptions)。

## 最佳实践

- 顺序保持一致：要么恒为最新在上，要么恒为最早在上，别混。
- 每条都写清楚时刻，只写"刚刚"在回溯时没有价值。

## 反模式

- 条数很多却不折叠：一条时间线拉出十屏。
- 用颜色区分事件类型却不给文字。
