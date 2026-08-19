# 时间线 <Badge type="info" text="timeline" />

数据展示组件。三层同源：无头内核给出解剖与状态机，Vue 组件与自定义元素只是它的两层外壳，行为完全一致。

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

## CSS 变量

本组件皮肤读的组件级令牌，写在组件自身或任意祖先上都生效。缺省值来自[设计令牌](../guide/theme)，不设即按缺省走。

`--xh-timeline-connector-bg` · `--xh-timeline-connector-min-length` · `--xh-timeline-connector-thickness` · `--xh-timeline-description-fg` · `--xh-timeline-description-font-size` · `--xh-timeline-fg` · `--xh-timeline-gutter` · `--xh-timeline-indicator-bg` · `--xh-timeline-indicator-fg` · `--xh-timeline-indicator-font-size` · `--xh-timeline-indicator-size` · `--xh-timeline-item-gap` · `--xh-timeline-time-fg` · `--xh-timeline-time-font-size` · `--xh-timeline-title-fg` · `--xh-timeline-title-font-size` · `--xh-timeline-title-font-weight`
