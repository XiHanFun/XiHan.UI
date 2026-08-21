# 菜单栏 <Badge type="info" text="menubar" />

一排入口各带一张菜单，同时只展开一张——桌面应用顶部那条。

## 何时使用

- 功能密集的编辑器类界面，命令多到需要按"文件 / 编辑 / 视图"分门别类。

## 何时不用

- 站点导航：那是[导航菜单](./navigation-menu)或[侧栏导航](./side-nav)。
- 只有一个入口：直接用[菜单](./menu)。
- 移动端：这排入口在窄屏上放不下，且悬停切换无从谈起。

## 特性

- `value` 是当前展开的那一项，`null` 表示都收起。
- 一张菜单展开后，指针移到相邻入口即直接换张展开，不必先关再开。
- 禁用走 `aria-disabled` 而非原生 `disabled`：禁用的入口仍聚焦得上、仍是方向键的起点。
- `orientation` 竖排时上下键在入口之间走，左右键改为展开本项的菜单。

## 示例

### 基础用法

一排入口各带一张菜单，同时只展开一张；条目以 value 标识身份，禁用项方向键跳过也选不中

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

### 二级子菜单

XhMenubarSub 在菜单栏的一张菜单里再嵌一层：触发条目双重身份（菜单栏的方向键照常走、右方向键进子层），子层内用 XhMenu 系部件，选中带上所属菜单的身份汇到根并关掉整条菜单栏

<XhDemo src="menubar/10-submenu" />

## 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-menubar>` |
| Vue 组件 | `XhMenubarContent` `XhMenubarGroup` `XhMenubarGroupLabel` `XhMenubarItem` `XhMenubarItemIndicator` `XhMenubarItemText` `XhMenubarPositioner` `XhMenubarRoot` `XhMenubarSeparator` `XhMenubarSub` `XhMenubarSubTrigger` `XhMenubarTrigger` |
| 组合式函数 | `useMenubar` |
| 状态机 | `menubarMachine` |
| 皮肤 | `@xihan-ui/styles/menubar.css` |

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
| `tone` | `Tone` |  | 语气：brand / neutral / success / warning / danger / info，决定用哪族颜色。 |
| `size` | `Size` |  | 尺寸：sm / md / lg。 |
| `onValueChange` | `(details: MenubarValueChangeDetails) => void` |  | value 变化回调。 |
| `onSelect` | `(details: MenubarSelectDetails) => void` |  | 条目被选中；菜单随之收起。 |

## 事件

自定义元素派发这些事件，Vue 组件对应同名 emit；载荷都在 `detail` 上。可双向绑定的值另有 `update:xxx`，见 Props。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `value-change` | `MenubarValueChangeDetails` | 展开项变化；detail 为 `{ value: string \| null }` |
| `select` | `MenubarSelectDetails` | 条目被选中（菜单随之收起）；detail 为 `{ menu: string, value: string }` |

## 插槽

作者能拿到载荷的插槽。只转发内容、不带载荷的默认插槽不在此列——那类直接写子节点即可。

| Vue 组件 | 插槽 | 载荷 | 说明 |
| --- | --- | --- | --- |
| `XhMenubarRoot` | `default` | `MenubarRootSlotProps` |  |
| `XhMenubarRoot` | `item` | `MenubarNodeMeta` |  |
| `XhMenubarSub` | `default` | `MenubarSubSlotProps` |  |

## 状态

对外可见的状态落在 `data-state` 上，写样式与断言都读它：

| 部件 | 取值 |
| --- | --- |
| `root` | 'open' \| 'closed' |
| `trigger` | 'open' \| 'closed' |
| `positioner` | 'open' \| 'closed' |
| `content` | 'open' \| 'closed' |

状态机内部转移，写样式与业务都用不到；要监听变化请看上面的「事件」。

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

## 无障碍

下面这些由 `connect` 铺到部件上，作者不必自己写；重复写反而会覆盖掉正确值。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `aria-disabled` | 'true' \| 'false' |
| `root` | `aria-orientation` | props.orientation |
| `root` | `role` | 'menubar' |
| `trigger` | `aria-controls` | `content` 部件的 id |
| `trigger` | `aria-disabled` | 'true' \| 'false' |
| `trigger` | `aria-expanded` | 'true' \| 'false' |
| `trigger` | `aria-haspopup` | 'menu' |
| `trigger` | `role` | 'menuitem' |
| `content` | `aria-labelledby` | `trigger` 部件的 id |
| `content` | `role` | 'menu' |
| `item` | `aria-disabled` | 'true' \| 'false' |
| `item` | `role` | 'menuitem' |
| `item-indicator` | `aria-hidden` | 'true' |
| `separator` | `aria-orientation` | 'horizontal' |
| `separator` | `role` | 'separator' |
| `group` | `aria-labelledby` | `group-label` 部件的 id |
| `group` | `role` | 'group' |

## 样式

默认皮肤 `@xihan-ui/styles/menubar.css` 按部件选择：`[data-scope="menubar"][data-part="root"]`。它落在 `xihan.components` 与 `xihan.motion` 层；业务样式不写进 `@layer` 即高于全部库层，要按层压过来就写进 `xihan.overrides`。

## 数据属性

由 `connect` 产出并铺到部件上，皮肤与测试都据此选择；`data-disabled` 这类无值属性在条件不成立时整个不出现。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-disabled` | ''（条件成立时才出现） |
| `root` | `data-orientation` | props.orientation |
| `root` | `data-size` | props.size |
| `root` | `data-state` | 'open' \| 'closed' |
| `root` | `data-tone` | props.tone |
| `trigger` | `data-disabled` | ''（条件成立时才出现） |
| `trigger` | `data-state` | 'open' \| 'closed' |
| `positioner` | `data-hidden` | ''（条件成立时才出现） |
| `positioner` | `data-placement` | 定位引擎算出的实际落位 \| undefined |
| `positioner` | `data-size` | props.size |
| `positioner` | `data-state` | 'open' \| 'closed' |
| `positioner` | `data-tone` | props.tone |
| `content` | `data-instant` | ''（条件成立时才出现） |
| `content` | `data-placement` | 定位引擎算出的实际落位 \| undefined |
| `content` | `data-state` | 'open' \| 'closed' |

## CSS 变量

本组件皮肤读的组件级令牌，写在组件自身或任意祖先上都生效。缺省值来自[设计令牌](../guide/theme)，不设即按缺省走。

`--xh-menubar-bg` · `--xh-menubar-fg` · `--xh-menubar-gap` · `--xh-menubar-group-label-fg` · `--xh-menubar-group-label-font-size` · `--xh-menubar-group-label-font-weight` · `--xh-menubar-group-label-px` · `--xh-menubar-group-label-py` · `--xh-menubar-item-bg-hover` · `--xh-menubar-item-fg` · `--xh-menubar-item-font-size` · `--xh-menubar-item-gap` · `--xh-menubar-item-indicator-fg` · `--xh-menubar-item-indicator-size` · `--xh-menubar-item-leading` · `--xh-menubar-item-px` · `--xh-menubar-item-py` · `--xh-menubar-item-radius` · `--xh-menubar-menu-bg` · `--xh-menubar-menu-border` · `--xh-menubar-menu-fg` · `--xh-menubar-menu-max-h` · `--xh-menubar-menu-max-w` · `--xh-menubar-menu-min-w` · `--xh-menubar-menu-px` · `--xh-menubar-menu-py` · `--xh-menubar-menu-radius` · `--xh-menubar-menu-shadow` · `--xh-menubar-px` · `--xh-menubar-py` · `--xh-menubar-radius` · `--xh-menubar-separator-color` · `--xh-menubar-separator-my` · `--xh-menubar-separator-thickness` · `--xh-menubar-trigger-bg-active` · `--xh-menubar-trigger-bg-hover` · `--xh-menubar-trigger-font-size` · `--xh-menubar-trigger-gap` · `--xh-menubar-trigger-px` · `--xh-menubar-trigger-py` · `--xh-menubar-trigger-radius`

## 动效

关键帧 `xh-pop-in` · `xh-pop-out` 随皮肤自带，不引用别处文件里的名字；状态切换走 `transition`。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。

## RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像。

## 组合

- 装不下时由宿主观测容器宽度，一次收起一个入口到"更多"里，收起的菜单在"更多"中各占一组。

## 最佳实践

- 入口名用单个名词，宽度尽量接近，避免展开时整排跳动。
- 常用命令在菜单里也标出快捷键，否则用户学不会绕开菜单栏。

## 反模式

- 入口超过七八个：找一条命令比翻文档还慢。
- 在菜单栏里放选项而不是命令。
