# 右键菜单 <Badge type="info" text="context-menu" />

导航组件。三层同源：无头内核给出解剖与状态机，Vue 组件与自定义元素只是它的两层外壳，行为完全一致。

## 示例

### 基础用法

collection 是条目的事实源，结构由组件铺开；在触发区上右键（触摸端长按），菜单钉在按下去的那一点上

<XhDemo src="context-menu/01-basic" />

### 分组与标记位

group 用 value 跟自己的 group-label 配对，item-indicator 是纯装饰的勾选位

<XhDemo src="context-menu/02-group" />

### 受控与锚点

传了 open 就由宿主说了算；root 的插槽给出锚点坐标与 openAt，可以从任意位置弹出

<XhDemo src="context-menu/03-controlled" />

### 语气

tone 决定条目高亮与标记位用哪族颜色；高亮静止态看不出来，右键弹出后悬停条目、或用方向键把焦点移上去才显现

<XhDemo src="context-menu/04-tone" />

### 尺寸

size 换的是条目的内边距、间距与字号；三档各挂一块触发区，逐块右键对比

<XhDemo src="context-menu/05-size" />

### 放置位与箭头

placement 是相对光标那一点的首选位，offset 把浮层从光标推开；arrow 指回那一点

<XhDemo src="context-menu/06-placement" />

### 条目里的图标与快捷键

item-text 只是文字那一段，图标与快捷键提示作为兄弟节点排在它两侧

<XhDemo src="context-menu/07-icon" />

### 触发与连打

longPressDelay 是触摸端按住多久算触发；typeahead 决定展开后的可打印字符是拿去检索还是放行给页面

<XhDemo src="context-menu/08-trigger" />

### 二级子菜单

XhContextMenuSub 在右键菜单里嵌一台子菜单：触发条目双重身份（父层方向键照常走、右方向键进子层），子层内用 XhMenu 系部件，任意层级选中都发根的 select 并整链关闭

<XhDemo src="context-menu/09-submenu" />

## 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-context-menu>` |
| Vue 组件 | `XhContextMenuArrow` `XhContextMenuContent` `XhContextMenuGroup` `XhContextMenuGroupLabel` `XhContextMenuItem` `XhContextMenuItemIndicator` `XhContextMenuItemText` `XhContextMenuPositioner` `XhContextMenuRoot` `XhContextMenuSeparator` `XhContextMenuSub` `XhContextMenuSubTrigger` `XhContextMenuTrigger` |
| 组合式函数 | `useContextMenu` |
| 状态机 | `contextMenuMachine` |
| 皮肤 | `@xihan-ui/styles/context-menu.css` |

## 解剖

部件名即 `data-part` 属性值，也是皮肤的选择器。加粗的是必备部件，不渲染它组件不工作（Web Components 适配器会在诊断通道上报 `wc.missing-part`）。

`data-scope="context-menu"`：`root` · **`trigger`** · `positioner` · **`content`** · **`item`** · `item-text` · `item-indicator` · `separator` · `group` · `group-label` · `arrow`

## Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `collection` | `ContextMenuNode[]` |  | 条目数据，显示文本、禁用、标记位与分组的事实源。给了它，条目部件只需报 value。 缺省即回到「文本与禁用全写在条目部件上」的老路。 |
| `open` | `boolean` |  | 展开态。给定即受控：内部不再自改，只发 onOpenChange。 |
| `defaultOpen` | `boolean` |  |  |
| `placement` | `Placement` |  | 相对光标那一点的首选放置位，默认 bottom-start。 |
| `offset` | `number` |  | 浮层与光标的间距（px），默认 0——右键菜单要贴着光标。 |
| `loop` | `boolean` |  | 方向键走到尽头是否回绕，默认 true。 |
| `dir` | `Direction` |  | 文字方向，默认 ltr。 |
| `typeahead` | `boolean` |  | 连打检索，默认开。关掉后可打印字符一律放行给页面。 |
| `translations` | `Partial<ContextMenuTranslations>` |  | 读屏用的文案，默认英文。 |
| `longPressDelay` | `number` |  | 触摸端长按多久算触发（ms），默认 700。 |
| `tone` | `Tone` |  | 语气：brand / neutral / success / warning / danger / info，决定条目高亮与标记位用哪族颜色。 |
| `size` | `Size` |  | 尺寸：sm / md / lg，决定条目高度、内边距与字号档位。 |
| `onOpenChange` | `(details: ContextMenuOpenChangeDetails) => void` |  | open 变化意图回调；受控时是唯一出口，非受控时随内部转移一并通知。 |
| `onSelect` | `(details: ContextMenuSelectDetails) => void` |  | 条目被选中；菜单随之关闭。 |

## 状态机

**状态**：`closed` · `pressing` · `open`

**事件**：`CONTEXT.MENU` · `OPEN` · `CLOSE` · `PRESS.START` · `PRESS.MOVE` · `PRESS.END` · `after.longPressDelay` · `CONTROLLED.OPEN` · `CONTROLLED.CLOSE` · `ITEM.FOCUS` · `FOCUS.CLEAR` · `ITEM.LOST` · `ITEM.SELECT`

**判据**：`isOpenControlled` · `movedBeyondTolerance`

## connect API

`useContextMenu` 产出的对象。`getXxxProps()` 铺到对应部件的宿主元素上，其余是可读状态与操作入口。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `open` | `boolean` |  |
| `collection` | `readonly ContextMenuNodeMeta[]` | collection 推出的条目元信息，按数据顺序排列；没给 collection 即空数组。 |
| `pressing` | `boolean` | 长按计时进行中；触发区据此给按压反馈。 |
| `point` | `ContextMenuPoint \| null` | 当前锚点坐标；一次都没打开过时为 null。 |
| `focusedValue` | `string \| null` | 焦点锚点；收起时为 null。 |
| `setOpen` | `(next: boolean) => void` | 收起走 CLOSE；展开落在最近一次锚点坐标上（从未打开过则是原点）。 |
| `openAt` | `(x: number, y: number) => void` | 命令式展开到指定视口坐标。 |
| `getRootProps` | `() => T['element']` |  |
| `getTriggerProps` | `() => T['element']` |  |
| `getPositionerProps` | `() => T['element']` |  |
| `getContentProps` | `() => T['element']` |  |
| `getItemProps` | `(props: ContextMenuItemProps) => T['element']` |  |
| `getItemTextProps` | `(props: ContextMenuItemProps) => T['element']` |  |
| `getItemIndicatorProps` | `(props: ContextMenuItemProps) => T['element']` |  |
| `getSeparatorProps` | `() => T['element']` |  |
| `getGroupProps` | `(props: ContextMenuGroupProps) => T['element']` |  |
| `getGroupLabelProps` | `(props: ContextMenuGroupProps) => T['element']` |  |
| `getArrowProps` | `() => T['element']` |  |

## 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/menu/#keyboardinteraction)

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `ContextMenu` / `Shift+F10` | focus in trigger | 在触发区起始角展开菜单并把焦点落到首个可用条目 |
| `ArrowDown` | open, focus in content | 焦点移到下一个条目（禁用项跳过、尽头按 loop 回绕） |
| `ArrowUp` | open, focus in content | 焦点移到上一个条目（禁用项跳过、尽头按 loop 回绕） |
| `Home` | open, focus in content | 焦点移到首个可用条目 |
| `End` | open, focus in content | 焦点移到末个可用条目 |
| `单个可打印字符` | open, typeahead 未关 | 连打检索把焦点移到首字母匹配的条目，不选中它 |
| `Enter` / `Space` | focus in item, not disabled | 派发选中详情并关闭菜单，焦点归还触发区 |
| `Escape` | open | 关闭菜单并把焦点归还触发区 |
| `Tab` / `Shift+Tab` | open | 关闭菜单，焦点不归还触发区，按 Tab 序列自然离开 |
