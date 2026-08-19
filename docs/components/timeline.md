# 时间线 <Badge type="info" text="timeline" />

按时间顺序排开的一串事件，每条有标记、连接线与内容。

## 何时使用

- 展示已经发生的事件序列：审批记录、物流轨迹、变更历史。

## 何时不用

- 表达"还要走几步"：用[步骤条](./steps)——时间线是回顾，步骤条是前瞻。
- 事件之间没有时间关系：用[列表](./list)。

## 特性

- 逐条可以有自己的语气（成功 / 失败 / 进行中）。
- 内容可以固定在一侧，也可以左右交替。
- 支持横排。

## 示例

### 基础用法

一条竖向的事件流：每条一个圆点，圆点之间连一截线，末条的线自动收掉

<XhDemo src="timeline/01-basic" />

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

## 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-timeline>` |
| Vue 组件 | `XhTimelineConnector` `XhTimelineContent` `XhTimelineDescription` `XhTimelineIndicator` `XhTimelineItem` `XhTimelineRoot` `XhTimelineTime` `XhTimelineTitle` |
| 状态机 | 无，`connect` 直接由 props 算属性 |
| 皮肤 | `@xihan-ui/styles/timeline.css` |

## 解剖

部件名即 `data-part` 属性值，也是皮肤的选择器。加粗的是必备部件，不渲染它组件不工作（Web Components 适配器会在诊断通道上报 `wc.missing-part`）。

`data-scope="timeline"`：**`root`** · **`item`** · `indicator` · `connector` · `content` · `title` · `description` · `time`

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
| `indicator` | `data-tone` | item.tone |
| `connector` | `data-orientation` | props.orientation |

## CSS 变量

本组件皮肤读的组件级令牌，写在组件自身或任意祖先上都生效。缺省值来自[设计令牌](../guide/theme)，不设即按缺省走。

`--xh-timeline-connector-bg` · `--xh-timeline-connector-min-length` · `--xh-timeline-connector-thickness` · `--xh-timeline-description-fg` · `--xh-timeline-description-font-size` · `--xh-timeline-fg` · `--xh-timeline-gutter` · `--xh-timeline-indicator-bg` · `--xh-timeline-indicator-fg` · `--xh-timeline-indicator-font-size` · `--xh-timeline-indicator-size` · `--xh-timeline-item-gap` · `--xh-timeline-time-fg` · `--xh-timeline-time-font-size` · `--xh-timeline-title-fg` · `--xh-timeline-title-font-size` · `--xh-timeline-title-font-weight`

## RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像。

## 组合

- 时间位放[时间](./time)；内容里放[卡片](./card)或[描述列表](./descriptions)。

## 最佳实践

- 顺序保持一致：要么恒为最新在上，要么恒为最早在上，别混。
- 每条都写清楚时刻，只写"刚刚"在回溯时没有价值。

## 反模式

- 条数很多却不折叠：一条时间线拉出十屏。
- 用颜色区分事件类型却不给文字。
