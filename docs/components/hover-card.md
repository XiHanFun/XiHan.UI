# 悬浮卡片 <Badge type="info" text="hover-card" />

反馈与浮层组件。三层同源：无头内核给出解剖与状态机，Vue 组件与自定义元素只是它的两层外壳，行为完全一致。

## 示例

### 基础用法

与 Tooltip 的分界在于卡片本体可交互：指针停在卡片上不收起，里面的链接与按钮都点得到

<XhDemo src="hover-card/01-basic" />

### 延时

openDelay 默认 700ms，closeDelay 默认 300ms——那段收起等待正是留给指针从触发器走到卡片上的通行时间

<XhDemo src="hover-card/02-delay" />

### 受控

传了 open 就由宿主说了算；悬停与 Escape 都只发意图，最终写不写由外面这颗按钮同一份状态决定

<XhDemo src="hover-card/03-controlled" />

### 尺寸

三档换的是卡片的内边距与字号，不写 size 即缺省档；把指针停在触发器上看差别

<XhDemo src="hover-card/04-size" />

### 朝向与间距

placement 是请求值，空间不够时定位引擎会自动翻面；offset 调的是卡片与触发器的距离

<XhDemo src="hover-card/05-placement" />

### 禁用

disabled 只关掉卡片本身，触发器照样可点、可聚焦，也照样进不了展开等待

<XhDemo src="hover-card/06-disabled" />

## 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-hover-card>` |
| Vue 组件 | `XhHoverCardArrow` `XhHoverCardContent` `XhHoverCardPositioner` `XhHoverCardRoot` `XhHoverCardTrigger` |
| 组合式函数 | `useHoverCard` |
| 状态机 | `hoverCardMachine` |
| 皮肤 | `@xihan-ui/styles/hover-card.css` |

## 解剖

部件名即 `data-part` 属性值，也是皮肤的选择器。加粗的是必备部件，不渲染它组件不工作（Web Components 适配器会在诊断通道上报 `wc.missing-part`）。

`data-scope="hover-card"`：`root` · **`trigger`** · `positioner` · **`content`** · `arrow`

## Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `open` | `boolean` |  |  |
| `defaultOpen` | `boolean` |  |  |
| `placement` | `Placement` |  | 请求的浮层朝向，默认 bottom；空间不足时由定位引擎避让。 |
| `offset` | `number` |  | 浮层与锚点的间距（px）。 |
| `openDelay` | `number` |  | 悬停进入到展开的等待毫秒，默认 700。 |
| `closeDelay` | `number` |  | 指针离开 trigger 或 content 到收起的等待毫秒，默认 300。 |
| `dir` | `Direction` |  | 文字方向，仅在显式给出时写到根节点上。 |
| `disabled` | `boolean` |  | 只关掉卡片本身，不影响 trigger 元素自身的可用性。 |
| `size` | `Size` |  | 尺寸：sm / md / lg，决定卡片的内边距档位。 |
| `onOpenChange` | `(details: HoverCardOpenChangeDetails) => void` |  | open 变化意图回调。 |

## 状态机

**状态**：`closed` · `opening` · `visible` · `visible.open` · `visible.closing`

**事件**：`POINTER.ENTER` · `POINTER.LEAVE` · `FOCUS` · `BLUR` · `ESCAPE` · `OPEN` · `CLOSE` · `after.openDelay` · `after.closeDelay` · `CONTROLLED.OPEN` · `CONTROLLED.CLOSE`

**判据**：`isOpenControlled` · `isDisabled` · `isFocusHeld`

## connect API

`useHoverCard` 产出的对象。`getXxxProps()` 铺到对应部件的宿主元素上，其余是可读状态与操作入口。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `open` | `boolean` |  |
| `setOpen` | `(next: boolean) => void` |  |
| `getRootProps` | `() => T['element']` |  |
| `getTriggerProps` | `() => T['button']` |  |
| `getPositionerProps` | `() => T['element']` |  |
| `getContentProps` | `() => T['element']` |  |
| `getArrowProps` | `() => T['element']` |  |

## 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/#keyboardinteraction)

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `Tab` / `Shift+Tab` | not disabled | 焦点进入 trigger 立即展开、离开卡片即收起，都不走延时 |
| `Escape` | 浮层可见（含收起等待期） | 立即收起，不等 closeDelay |
