# 菜单栏 <Badge type="info" text="menubar" />

导航组件。三层同源：无头内核给出解剖与状态机，Vue 组件与自定义元素只是它的两层外壳，行为完全一致。

## 示例

### 基础用法

collection 是入口与条目的事实源：顶层节点铺成一排入口，它的 items 铺成那张菜单里的条目

<XhDemo src="menubar/01-basic" />

### 受控

value 是当前展开的那一项，null 表示都收起；给了它就由宿主说了算

<XhDemo src="menubar/02-controlled" />

### 分组与标记位

group 用 value 跟自己的 group-label 配对，item-indicator 是纯装饰的勾选位

<XhDemo src="menubar/03-group" />

### 语气

tone 换的是高亮底色，静止态一样：悬停到 trigger 上、或展开菜单后把焦点移到条目上才显现

<XhDemo src="menubar/04-tone" />

### 尺寸

size 一档换掉 trigger 与菜单条目的字号与内边距，写在 root 上、浮层里的条目一并跟着变

<XhDemo src="menubar/05-size" />

### 竖排菜单栏

orientation 决定主轴：竖排时上下键在入口之间走，左右键改为展开本项的菜单

<XhDemo src="menubar/06-vertical" />

### 入口与条目的图标

图标是插槽里的普通节点：入口里排在文字前，条目里排在 item-text 前，逐项自己写

<XhDemo src="menubar/07-icon" />

### 禁用

禁用走 aria-disabled 而非原生 disabled：禁用的入口仍聚焦得上、仍是方向键的起点，只是展不开菜单

<XhDemo src="menubar/08-disabled" />

### 装不下就收进「更多」

宿主自己观测容器宽度，一次收起一个入口直到这排不再溢出；收起来的那几张菜单在「更多」里各占一组

<XhDemo src="menubar/09-overflow" />

## 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-menubar>` |
| Vue 组件 | `XhMenubarContent` `XhMenubarGroup` `XhMenubarGroupLabel` `XhMenubarItem` `XhMenubarItemIndicator` `XhMenubarItemText` `XhMenubarPositioner` `XhMenubarRoot` `XhMenubarSeparator` `XhMenubarTrigger` |
| 组合式函数 | `useMenubar` |
| 状态机 | `menubarMachine` |
| 皮肤 | `@xihan-ui/styled/menubar.css` |

## 解剖

部件名即 `data-part` 属性值，也是皮肤的选择器。加粗的是必备部件，不渲染它组件不工作（Web Components 适配器会在诊断通道上报 `wc.missing-part`）。

`data-scope="menubar"`：**`root`** · **`trigger`** · `positioner` · **`content`** · **`item`** · `item-text` · `item-indicator` · `separator` · `group` · `group-label`

## Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `collection` | `MenubarNode[]` |  | 菜单栏数据，显示文本与禁用的事实源。给了它，入口与条目部件只需报 value。 缺省即回到「文本与禁用逐个写在部件上」的老路。 |
| `value` | `string \| null` |  | 当前展开项，给定即受控；null 表示都收起。 |
| `defaultValue` | `string \| null` |  |  |
| `orientation` | `Orientation` |  | 菜单栏排布轴，默认 horizontal。 |
| `loop` | `boolean` |  | 方向键走到尽头是否回绕，默认 true。 |
| `dir` | `Direction` |  | 文字方向，默认 ltr。 |
| `disabled` | `boolean` |  | 整条菜单栏禁用，展开与选中都不发生。 |
| `typeahead` | `boolean` |  | 菜单内的连打检索，默认开。 |
| `placement` | `Placement` |  |  |
| `offset` | `number` |  |  |
| `tone` | `string` |  | 语气：brand / neutral / success / warning / danger / info，决定用哪族颜色。 |
| `size` | `string` |  | 尺寸：sm / md / lg。 |
| `onValueChange` | `(details: MenubarValueChangeDetails) => void` |  | value 变化回调。 |
| `onSelect` | `(details: MenubarSelectDetails) => void` |  | 条目被选中；菜单随之收起。 |

## 状态机

**状态**：`idle` · `open`

**事件**：`TRIGGER.TOGGLE` · `TRIGGER.OPEN` · `TRIGGER.POINTER` · `TRIGGER.FOCUS` · `CLOSE` · `MENUBAR.BLUR` · `VALUE.SET` · `ITEM.FOCUS` · `ITEM.LOST` · `ITEM.SELECT` · `SYNC.OPEN` · `SYNC.CLOSE`

**判据**：`hasValue` · `isCurrent` · `shouldAbsorbToggle` · `shouldSwitch`

## connect API

`useMenubar` 产出的对象。`getXxxProps()` 铺到对应部件的宿主元素上，其余是可读状态与操作入口。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `value` | `string \| null` | 当前展开的那一项；都收起时为 null。 |
| `collection` | `readonly MenubarNodeMeta[]` | collection 推出的入口元信息（各自带着它那张菜单的条目），按数据顺序排列；没给 collection 即空数组。 |
| `open` | `boolean` | 有没有菜单展开着。 |
| `focusedValue` | `string \| null` | trigger 的 roving 锚点；焦点不在菜单栏内时为 null。 |
| `focusedItem` | `string \| null` | 展开菜单内持有焦点的条目；无锚点时为 null。 |
| `orientation` | `Orientation` |  |
| `disabled` | `boolean` |  |
| `isOpen` | `(value: string) => boolean` |  |
| `setValue` | `(next: string \| null) => void` |  |
| `getRootProps` | `() => T['element']` |  |
| `getTriggerProps` | `(props: MenubarTriggerProps) => T['button']` |  |
| `getPositionerProps` | `(props: MenubarContentProps) => T['element']` |  |
| `getContentProps` | `(props: MenubarContentProps) => T['element']` |  |
| `getItemProps` | `(props: MenubarItemProps) => T['element']` |  |
| `getItemTextProps` | `(props: MenubarItemProps) => T['element']` |  |
| `getItemIndicatorProps` | `(props: MenubarItemProps) => T['element']` |  |
| `getSeparatorProps` | `() => T['element']` |  |
| `getGroupProps` | `(props: MenubarGroupProps) => T['element']` |  |
| `getGroupLabelProps` | `(props: MenubarGroupProps) => T['element']` |  |

## 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/menubar/#keyboardinteraction)

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `ArrowRight` | focus in trigger, horizontal | 焦点移到下一个 trigger（禁用项跳过、尽头按 loop 回绕）；已有菜单展开着则展开项跟着切过去 |
| `ArrowLeft` | focus in trigger, horizontal | 焦点移到上一个 trigger（禁用项跳过、尽头按 loop 回绕）；已有菜单展开着则展开项跟着切过去 |
| `Home` | focus in trigger | 焦点移到首个可用 trigger |
| `End` | focus in trigger | 焦点移到末个可用 trigger |
| `ArrowDown` / `Enter` / `Space` | focus in trigger, horizontal | 展开本项的菜单；方向键入口把焦点落到首个可用条目，Enter/Space 让焦点留在 trigger 上 |
| `ArrowUp` | focus in trigger, horizontal | 展开本项的菜单并把焦点落到末个可用条目 |
| `ArrowDown` | open, focus in content | 焦点移到下一个条目（禁用项跳过、尽头按 loop 回绕） |
| `ArrowUp` | open, focus in content | 焦点移到上一个条目（禁用项跳过、尽头按 loop 回绕） |
| `Home` | open, focus in content | 焦点移到本张菜单的首个可用条目 |
| `End` | open, focus in content | 焦点移到本张菜单的末个可用条目 |
| `ArrowRight` / `ArrowLeft` | open, focus in content | 切到相邻菜单并保持展开，焦点落到那一项的 trigger 上 |
| `a-z` / `0-9` | open, focus in content | 连打检索：焦点跳到首字母匹配的条目（同字符连打则在候选间轮换） |
| `Enter` / `Space` | focus in item, not disabled | 派发选中详情并收起菜单，焦点归还 trigger |
| `Escape` | open | 收起菜单并把焦点留在 trigger 上 |
| `Tab` / `Shift+Tab` | open | 收起菜单，焦点不被抢回 trigger，按 Tab 序列自然离开 |
