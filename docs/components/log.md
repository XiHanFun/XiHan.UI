# 日志 <Badge type="info" text="log" />

数据展示组件。三层同源：无头内核给出解剖与状态机，Vue 组件与自定义元素只是它的两层外壳，行为完全一致。

## 示例

### 基础用法

root / viewport / content / line 四层；一行写什么由作者定，组件只给身份与等宽排版

<XhDemo src="log/01-basic" />

### 按行数定高

rows 定的是「看得见几行」，一行有多高归皮肤，改 --xh-log-line-height 两边一起变

<XhDemo src="log/02-rows" />

### 自动跟到底部

新行进来时视口自己跟着走；往上滚一段就停住跟随，组件报出的 atBottom 与 scrollToBottom 够自己画一条回到最新

<XhDemo src="log/03-follow" />

### 取行中

loading 让日志区报 aria-busy 并把指针换成忙碌态；「正在拉取」那一行是作者自己渲的

<XhDemo src="log/04-loading" />

### 行的样子归作者

line 只发身份与等宽排版，级别配色、时间戳、行内标记这些都写在行里

<XhDemo src="log/05-levels" />

## 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-log>` |
| Vue 组件 | `XhLogContent` `XhLogLine` `XhLogRoot` `XhLogViewport` |
| 组合式函数 | `useLog` |
| 状态机 | 无，`connect` 直接由 props 算属性 |
| 皮肤 | `@xihan-ui/styles/log.css` |

## 解剖

部件名即 `data-part` 属性值，也是皮肤的选择器。加粗的是必备部件，不渲染它组件不工作（Web Components 适配器会在诊断通道上报 `wc.missing-part`）。

`data-scope="log"`：**`root`** · **`viewport`** · **`content`** · `line`

## Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `loading` | `boolean` |  | 行还在路上：日志区报 aria-busy，根落 data-loading。 |
| `rows` | `number` |  | 视口按多少行定高；缺省时高度由皮肤给。 |
| `translations` | `Partial<LogTranslations>` |  |  |

## 事件

自定义元素派发这些事件，Vue 组件对应同名 emit；载荷都在 `detail` 上。可双向绑定的值另有 `update:xxx`，见 Props。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `stick-change` | `ThreadStickChangeDetails` | 粘底状态变化；detail 为 `{ atBottom: boolean, sticking: boolean }` |

## 插槽

作者能拿到载荷的插槽。只转发内容、不带载荷的默认插槽不在此列——那类直接写子节点即可。

| Vue 组件 | 插槽 | 载荷 | 说明 |
| --- | --- | --- | --- |
| `XhLogRoot` | `default` | `LogRootSlotProps` |  |

## connect API

`useLog` 产出的对象。`getXxxProps()` 铺到对应部件的宿主元素上，其余是可读状态与操作入口。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `rows` | `number \| undefined` | 取整后的行数；rows 缺席或不是正数时为 undefined。 |
| `loading` | `boolean` |  |
| `atBottom` | `boolean` | 当前滚动位置是否落在底部阈值内。 |
| `sticking` | `boolean` | 新行进来时是否自动跟到底。 |
| `scrollToBottom` | `() => void` | 滚到底部并恢复粘附。 |
| `getRootProps` | `() => T['element']` |  |
| `getViewportProps` | `() => T['element']` |  |
| `getContentProps` | `() => T['element']` |  |
| `getLineProps` | `() => T['element']` |  |

## 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/practices/structural-roles/)

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `Tab` | 焦点进入日志区 | 日志区自身可聚焦，方向键/PageUp/PageDown/Home/End 交给浏览器滚动，组件不接管 |

## CSS 变量

本组件皮肤读的组件级令牌，写在组件自身或任意祖先上都生效。缺省值来自[设计令牌](../guide/theme)，不设即按缺省走。

`--xh-log-bg` · `--xh-log-border` · `--xh-log-content-px` · `--xh-log-fg` · `--xh-log-font` · `--xh-log-font-size` · `--xh-log-line-height` · `--xh-log-radius` · `--xh-log-rows` · `--xh-log-tab-size`
