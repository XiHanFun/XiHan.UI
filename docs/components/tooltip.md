# 文字提示 <Badge type="info" text="tooltip" />

反馈与浮层组件。三层同源：无头内核给出解剖与状态机，Vue 组件与自定义元素只是它的两层外壳，行为完全一致。

## 示例

### 基础用法

悬停或聚焦触发器即出；指针停在提示上也不收起

<XhDemo src="tooltip/01-basic" />

### 朝向

placement 是请求值，空间不够时由定位引擎避让；箭头跟着最终落定的那一面走

<XhDemo src="tooltip/02-placement" />

### 延时

openDelay 默认 700ms 用来防误触，closeDelay 默认 300ms 留出指针走位的余地；聚焦不走这两段等待

<XhDemo src="tooltip/03-delay" />

### 禁用

disabled 只关掉提示本身，被包裹的触发器照样可点、可聚焦

<XhDemo src="tooltip/04-disabled" />

### 语气

六种语气换的是浮层实心底与其上的文字色，箭头一并跟着走；把指针停在触发器上（或用 Tab 聚焦）看差别

<XhDemo src="tooltip/05-tone" />

### 尺寸

三档换的是浮层的内边距与字号，不写 size 即缺省档；把指针停在触发器上（或用 Tab 聚焦）看差别

<XhDemo src="tooltip/06-size" />

### 受控

传了 open 就由宿主说了算；悬停、聚焦、Escape 都只发意图，最终写不写由外面这份状态决定

<XhDemo src="tooltip/07-controlled" />

### 长文案

提示到了宽度上限就换行，不会拉成一条横线；上限是 content 上的 --xh-tooltip-max-w 槽位

<XhDemo src="tooltip/08-long-text" />

## 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-tooltip>` |
| Vue 组件 | `XhTooltipArrow` `XhTooltipContent` `XhTooltipPositioner` `XhTooltipRoot` `XhTooltipTrigger` |
| 组合式函数 | `useTooltip` |
| 状态机 | `tooltipMachine` |
| 皮肤 | `@xihan-ui/styles/tooltip.css` |

## 解剖

部件名即 `data-part` 属性值，也是皮肤的选择器。加粗的是必备部件，不渲染它组件不工作（Web Components 适配器会在诊断通道上报 `wc.missing-part`）。

`data-scope="tooltip"`：**`trigger`** · `positioner` · **`content`** · `arrow`

## Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `open` | `boolean` |  |  |
| `defaultOpen` | `boolean` |  |  |
| `placement` | `Placement` |  | 请求的浮层朝向，默认 bottom；空间不足时由定位引擎避让。 |
| `offset` | `number` |  | 浮层与锚点的间距（px）。 |
| `openDelay` | `number` |  | 悬停进入到展开的等待毫秒，默认 700。 |
| `closeDelay` | `number` |  | 悬停移出到收起的等待毫秒，默认 300。 |
| `disabled` | `boolean` |  | 只关闭提示本身，不影响被包裹控件的可用性。 |
| `tone` | `string` |  | 语气：brand / neutral / success / warning / danger / info，决定提示的底色与其上的文字色。 |
| `size` | `string` |  | 尺寸：sm / md / lg，决定内边距与字号档位。 |
| `onOpenChange` | `(details: TooltipOpenChangeDetails) => void` |  | open 变化意图回调；受控时是唯一出口，非受控随内部转移一并通知。 |

## 状态机

**状态**：`closed` · `opening` · `open` · `closing`

**事件**：`POINTER.ENTER` · `POINTER.LEAVE` · `POINTER.DOWN` · `FOCUS` · `BLUR` · `ESCAPE` · `OPEN` · `CLOSE` · `after.openDelay` · `after.closeDelay` · `CONTROLLED.OPEN` · `CONTROLLED.CLOSE`

**判据**：`isOpenControlled` · `isDisabled` · `isFocusOpened`

## connect API

`useTooltip` 产出的对象。`getXxxProps()` 铺到对应部件的宿主元素上，其余是可读状态与操作入口。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `open` | `boolean` |  |
| `setOpen` | `(next: boolean) => void` |  |
| `getTriggerProps` | `() => T['button']` |  |
| `getPositionerProps` | `() => T['element']` |  |
| `getContentProps` | `() => T['element']` |  |
| `getArrowProps` | `() => T['element']` |  |

## 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/tooltip/#keyboardinteraction)

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `Tab` / `Shift+Tab` | not disabled | 焦点进入 trigger 立即展开、离开立即收起，都不走延时 |
| `Escape` | focus in trigger, 展开或等待展开中 | 立即收起，不等 closeDelay |
