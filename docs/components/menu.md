# 菜单 <Badge type="info" text="menu" />

导航组件。三层同源：无头内核给出解剖与状态机，Vue 组件与自定义元素只是它的两层外壳，行为完全一致。

## 示例

### 基础用法

条目以 value 标识身份，禁用项方向键跳过也选不中；删除前面隔着一道分隔线

<XhDemo src="menu/01-basic" />

### 受控

传了 open 就由宿主说了算，组件只发 open-change 不自己改展开态

<XhDemo src="menu/02-controlled" />

### 放置位与箭头

placement 只是首选位，空间不够时定位引擎会自动翻面；arrow 指回触发器

<XhDemo src="menu/03-placement" />

### 语气

tone 决定条目高亮用哪族颜色；静止态看不出来，展开后悬停条目、或用方向键把焦点移上去才显现

<XhDemo src="menu/04-tone" />

### 尺寸

size 换的是条目的内边距、间距与字号；三档各挂一个菜单，逐个展开对比

<XhDemo src="menu/05-size" />

### 条目里的图标与快捷键

条目内容归作者：前面挂图标、后面挂快捷键，皮肤把它们按 flex 排开

<XhDemo src="menu/06-icon" />

### 菜单里的非条目内容

content 里可以直接放任意节点；不是 item 就不进方向键行程，也选不中

<XhDemo src="menu/07-custom-content" />

### 条目自带的属性与事件

条目上的原生属性照常生效，自己挂的 click 与内部的选中处理并存

<XhDemo src="menu/08-item-attrs" />

### 悬停触发

open-on-hover 一个 prop：进触发器延时展开，离开后指针经安全三角赶往浮层不误收，走岔或停滞才收起；延时可调

<XhDemo src="menu/09-hover" />

### 分组与标记位

组标题与组内条目用 role="group" 加 aria-labelledby 对上；中间包一层不影响方向键行程，条目里标记位与文字各占一段

<XhDemo src="menu/10-group" />

### 二级子菜单

XhMenuSub 内嵌一台子菜单：触发条目双重身份（父层方向键照常走、右方向键进子层、子层左方向键退回），悬停经安全三角斜穿不误收，任意层级选中都发根的 select 并整链关闭

<XhDemo src="menu/10-submenu" />

## 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-menu>` |
| Vue 组件 | `XhMenuArrow` `XhMenuContent` `XhMenuItem` `XhMenuPositioner` `XhMenuRoot` `XhMenuSeparator` `XhMenuSub` `XhMenuSubTrigger` `XhMenuTrigger` |
| 组合式函数 | `useMenu` |
| 状态机 | `menuMachine` |
| 皮肤 | `@xihan-ui/styles/menu.css` |

## 解剖

部件名即 `data-part` 属性值，也是皮肤的选择器。加粗的是必备部件，不渲染它组件不工作（Web Components 适配器会在诊断通道上报 `wc.missing-part`）。

`data-scope="menu"`：**`trigger`** · `positioner` · **`content`** · **`item`** · `separator` · `arrow`

## Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `collection` | `MenuNode[]` |  | 条目数据，显示文本与禁用的事实源。给了它，条目部件只需报 value。 缺省即回到「文本与禁用都写在条目部件上」的老路。 |
| `open` | `boolean` |  | 展开态，给定即受控；受控下内部不自改，只发 onOpenChange。 |
| `defaultOpen` | `boolean` |  |  |
| `placement` | `Placement` |  |  |
| `offset` | `number` |  |  |
| `loop` | `boolean` |  | 方向键走到尽头是否回绕，默认 true。 |
| `dir` | `Direction` |  | 文字方向，默认 ltr。 |
| `tone` | `Tone` |  | 语气：brand / neutral / success / warning / danger / info，决定条目高亮用哪族颜色。 |
| `size` | `Size` |  | 尺寸：sm / md / lg，决定条目高度、内边距与字号档位。 |
| `submenu` | `boolean` |  | 本菜单是另一张菜单的子菜单：触发器渲染成父菜单的条目形态 （经 getSubmenuTriggerProps），缺省落位换到侧向，悬停触发缺省打开。 |
| `openOnHover` | `boolean` |  | 悬停触发：进触发器延时展开、经安全三角离开才收。子菜单缺省开，普通菜单缺省关。 |
| `hoverOpenDelay` | `number` |  | 悬停到展开的延时（ms），默认 100。 |
| `hoverCloseDelay` | `number` |  | 离开到收起的延时（ms），也是安全三角里的停滞上限，默认 300。 |
| `onOpenChange` | `(details: MenuOpenChangeDetails) => void` |  | open 变化回调。 |
| `onSelect` | `(details: MenuSelectDetails) => void` |  | 条目被选中；菜单随之关闭。 |

## 事件

自定义元素派发这些事件，Vue 组件对应同名 emit；载荷都在 `detail` 上。可双向绑定的值另有 `update:xxx`，见 Props。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `open-change` | `MenuOpenChangeDetails` | open 状态变化；detail 为 `{ open: boolean }` |
| `select` | `MenuSelectDetails` | 条目被选中（菜单随之关闭）；detail 为 `{ value: string }` |

## 插槽

作者能拿到载荷的插槽。只转发内容、不带载荷的默认插槽不在此列——那类直接写子节点即可。

| Vue 组件 | 插槽 | 载荷 | 说明 |
| --- | --- | --- | --- |
| `XhMenuRoot` | `default` | `MenuRootSlotProps` |  |
| `XhMenuRoot` | `trigger` | — |  |
| `XhMenuRoot` | `item` | `MenuNodeMeta` |  |
| `XhMenuSub` | `default` | `MenuSubSlotProps` |  |

## 状态机

内部转移，写样式与业务都用不到；要监听变化请看上面的「事件」。

**状态**：`open` · `closed`

**事件**：`OPEN` · `TOGGLE` · `CLOSE` · `CONTROLLED.OPEN` · `CONTROLLED.CLOSE` · `ITEM.FOCUS` · `FOCUS.CLEAR` · `ITEM.LOST` · `ITEM.SELECT`

**判据**：`isOpenControlled`

## connect API

`useMenu` 产出的对象。`getXxxProps()` 铺到对应部件的宿主元素上，其余是可读状态与操作入口。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `open` | `boolean` |  |
| `collection` | `readonly MenuNodeMeta[]` | collection 推出的条目元信息，按数据顺序排列；没给 collection 即空数组。 |
| `focusedValue` | `string \| null` | 焦点锚点；收起时为 null。 |
| `setOpen` | `(next: boolean) => void` |  |
| `getTriggerProps` | `() => T['button']` |  |
| `getPositionerProps` | `() => T['element']` |  |
| `getContentProps` | `() => T['element']` |  |
| `getItemProps` | `(props: MenuItemProps) => T['element']` |  |
| `getSubmenuTriggerProps` | `(props: MenuItemProps) => T['element']` | 子菜单触发条目（submenu 模式）：既是父菜单里的一条 item（value 是它在父菜单 里的身份，父层的方向键与高亮照常认它），又是本子菜单的触发器（aria-haspopup、 悬停/点按/右方向键展开）。父层的选中会跳过带 aria-haspopup 的条目。 |
| `getSeparatorProps` | `() => T['element']` |  |
| `getArrowProps` | `() => T['element']` |  |

## 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/menu-button/#keyboardinteraction)

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `Enter` / `Space` / `ArrowDown` | focus in trigger | 展开菜单并把焦点落到首个可用条目 |
| `ArrowUp` | focus in trigger | 展开菜单并把焦点落到末个可用条目 |
| `ArrowDown` | open, focus in content | 焦点移到下一个条目（禁用项跳过、尽头按 loop 回绕） |
| `ArrowUp` | open, focus in content | 焦点移到上一个条目（禁用项跳过、尽头按 loop 回绕） |
| `Home` | open, focus in content | 焦点移到首个可用条目 |
| `End` | open, focus in content | 焦点移到末个可用条目 |
| `Enter` / `Space` | focus in item, not disabled | 派发选中详情并关闭菜单，焦点归还 trigger |
| `Escape` | open | 关闭菜单并把焦点归还 trigger |
| `Tab` / `Shift+Tab` | open | 关闭菜单，焦点不归还 trigger，按 Tab 序列自然离开 |

## CSS 变量

本组件皮肤读的组件级令牌，写在组件自身或任意祖先上都生效。缺省值来自[设计令牌](../guide/theme)，不设即按缺省走。

`--xh-menu-arrow-size` · `--xh-menu-bg` · `--xh-menu-border` · `--xh-menu-fg` · `--xh-menu-item-active-font-weight` · `--xh-menu-item-bg-active` · `--xh-menu-item-bg-hover` · `--xh-menu-item-fg` · `--xh-menu-item-font-size` · `--xh-menu-item-gap` · `--xh-menu-item-leading` · `--xh-menu-item-px` · `--xh-menu-item-py` · `--xh-menu-item-radius` · `--xh-menu-max-h` · `--xh-menu-max-w` · `--xh-menu-min-w` · `--xh-menu-px` · `--xh-menu-py` · `--xh-menu-radius` · `--xh-menu-separator-color` · `--xh-menu-separator-my` · `--xh-menu-separator-thickness` · `--xh-menu-shadow`
