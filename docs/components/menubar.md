# Menubar 菜单栏

一排入口各带一张菜单，同时只展开一张——桌面应用顶部那条。

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/menubar" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/menubar.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/menubar" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/menubar" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/menubar.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## 用法

一排入口各带一张菜单，同时只展开一张；条目以 value 标识身份，禁用项方向键跳过也选不中

<XhDemo src="menubar/01-basic" />

## 组件结构

加粗的是必需部件。

`data-scope="menubar"`：**`root`** · **`trigger`** · `positioner` · **`content`** · **`item`** · `item-text` · `item-indicator` · `item-description` · `separator` · `group` · `group-label` · `arrow`

## 示例

### 受控

value 是当前展开的那一项，null 表示都收起；给了它就由宿主说了算

<XhDemo src="menubar/02-controlled" />

### 分组与标记位

group 用 value 跟自己的 group-label 配对，item-indicator 是纯装饰的勾选位

<XhDemo src="menubar/03-group" />

### 语气

普通菜单行与展开项保持中性灰；tone 作用于触发器反馈和显式标记，不给展开项铺品牌色

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

## 设计指引

### 何时使用

- 功能密集的编辑器类界面，命令多到需要按"文件 / 编辑 / 视图"分门别类。

### 何时不用

- 站点导航：那是[导航菜单](./navigation-menu)或[侧栏导航](./side-nav)。
- 只有一个入口：直接用[菜单](./menu)。
- 移动端：这排入口在窄屏上放不下，且悬停切换无从谈起。

### 特性

- `value` 是当前展开的那一项，`null` 表示都收起。
- 一张菜单展开后，指针移到相邻入口即直接换张展开，不必先关再开。
- 禁用走 `aria-disabled` 而非原生 `disabled`：禁用的入口仍聚焦得上、仍是方向键的起点。
- `orientation` 竖排时上下键在入口之间走，左右键改为展开本项的菜单。
- 顶层控制条保持轻量导航表面；每张弹出菜单使用 M2 磨砂材质，箭头与面板同色同边界且不重复模糊。
- 菜单条目的悬停/键盘锚点与打开路径使用同一中性淡底，按下加深一档；打开二级菜单不加色条、
  不改字重，也不使用品牌蓝底。顶层当前菜单的 trigger 仍保留自己的导航选中反馈。
- 条目使用 flex 主行并保留作者的实际插槽顺序：图标、`item-text`、任意快捷键节点和子菜单箭头
  可以同排；`item-text` 占剩余空间并截断，只有 `item-description` 独占第二行。
- 首次展开与最终收起沿实际 placement 短移淡变，不缩放整张面；在顶层入口之间换张仍保持瞬时交接，
  避免两张菜单交叉动画造成闪烁。

### 组合

- 装不下时由宿主观测容器宽度，一次收起一个入口到"更多"里，收起的菜单在"更多"中各占一组。

### 最佳实践

- 入口名用单个名词，宽度尽量接近，避免展开时整排跳动。
- 图标与快捷键按实际需要写入对应条目，不必为了别的条目有 indicator 而给整层补空占位。

### 当前边界

- 当前没有正式 shortcut、trailing、checkbox/radio item 或单条 danger tone 部件。快捷键提示使用作者放入的 [KbdGroup](./kbd-group)，
  但不会自动注册键盘动作；选择类菜单项还需要完整的行为与可访问语义。

### 反模式

- 入口超过七八个：找一条命令比翻文档还慢。
- 在菜单栏里放选项而不是命令。

## API 参考

### 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-menubar>` |
| Vue 组件 | `XhMenubarArrow` `XhMenubarContent` `XhMenubarGroup` `XhMenubarGroupLabel` `XhMenubarItem` `XhMenubarItemDescription` `XhMenubarItemIndicator` `XhMenubarItemText` `XhMenubarPositioner` `XhMenubarRoot` `XhMenubarSeparator` `XhMenubarSub` `XhMenubarSubTrigger` `XhMenubarTrigger` |
| 组合式函数 | `useMenubar` |
| 状态机 | `menubarMachine` |
| 皮肤 | `@xihan-ui/styles/menubar.css` |

### Props

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
| `translations` | `Partial<MenubarTranslations>` |  |  |
| `onValueChange` | `(details: MenubarValueChangeDetails) => void` |  | value 变化回调。 |
| `onSelect` | `(details: MenubarSelectDetails) => void` |  | 条目被选中；菜单随之收起。 |

### 事件

自定义元素将载荷放在 `detail`；Vue 使用同名 emit。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `value-change` | `MenubarValueChangeDetails` | 展开项变化；detail 为 `{ value: string \| null }` |
| `select` | `MenubarSelectDetails` | 条目被选中（菜单随之收起）；detail 为 `{ menu: string, value: string }` |

### 插槽

仅列出带载荷的插槽。

| Vue 组件 | 插槽 | 载荷 | 说明 |
| --- | --- | --- | --- |
| `XhMenubarRoot` | `default` | `MenubarRootSlotProps` |  |
| `XhMenubarRoot` | `item` | `MenubarNodeMeta` |  |
| `XhMenubarSub` | `default` | `MenubarSubSlotProps` |  |

### 状态

公开状态写入 `data-state`。

| 部件 | 取值 |
| --- | --- |
| `root` | 'open' \| 'closed' |
| `trigger` | 'open' \| 'closed' |
| `positioner` | 'open' \| 'closed' |
| `content` | 'open' \| 'closed' |

以下名称仅用于内部状态机。

**状态**：`idle` · `open`

**事件**：`TRIGGER.TOGGLE` · `TRIGGER.OPEN` · `TRIGGER.POINTER` · `TRIGGER.FOCUS` · `CLOSE` · `MENUBAR.BLUR` · `VALUE.SET` · `PRESENCE.SET` · `ITEM.FOCUS` · `ITEM.LOST` · `ITEM.SELECT` · `SYNC.OPEN` · `SYNC.CLOSE`

**判据**：`hasValue` · `isCurrent` · `shouldAbsorbToggle` · `shouldSwitch`

### connect API

`getXxxProps()` 返回对应部件的宿主属性。

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
| `getItemDescriptionProps` | `(props: MenubarItemProps) => T['element']` |  |
| `getSeparatorProps` | `() => T['element']` |  |
| `getGroupProps` | `(props: MenubarGroupProps) => T['element']` |  |
| `getGroupLabelProps` | `(props: MenubarGroupProps) => T['element']` |  |
| `getArrowProps` | `(props: MenubarContentProps) => T['element']` |  |

## 无障碍

### 键盘

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

### ARIA

以下属性由 `connect` 生成。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `aria-disabled` | 'true' \| 'false' |
| `root` | `aria-label` | props.translations.root |
| `root` | `aria-orientation` | props.orientation |
| `root` | `role` | 'menubar' |
| `trigger` | `aria-controls` | `content` 部件的 id |
| `trigger` | `aria-disabled` | 'true' \| 'false' |
| `trigger` | `aria-expanded` | 'true' \| 'false' |
| `trigger` | `aria-haspopup` | 'menu' |
| `trigger` | `role` | 'menuitem' |
| `content` | `aria-hidden` | !isOpen \|\| undefined |
| `content` | `aria-labelledby` | `trigger` 部件的 id |
| `content` | `role` | 'menu' |
| `item` | `aria-disabled` | 'true' \| 'false' |
| `item` | `role` | 'menuitem' |
| `item-indicator` | `aria-hidden` | 'true' |
| `separator` | `aria-orientation` | 'horizontal' |
| `separator` | `role` | 'separator' |
| `group` | `aria-labelledby` | `group-label` 部件的 id |
| `group` | `role` | 'group' |
| `arrow` | `aria-hidden` | 'true' |

## 样式参考

### 皮肤

`@xihan-ui/styles/menubar.css` 使用 `[data-scope="menubar"][data-part="root"]` 部件选择器，位于 `xihan.components` 与 `xihan.motion` 层。覆盖样式使用 `xihan.overrides`。

`forced-colors: active` 下另有一套规则：颜色交给系统，边框与状态标记改用系统色关键字。

### 数据属性

由 `connect` 生成；条件不成立时不输出无值属性。

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
| `positioner` | `data-positioned` | ''（条件成立时才出现） |
| `positioner` | `data-size` | props.size |
| `positioner` | `data-state` | 'open' \| 'closed' |
| `positioner` | `data-tone` | props.tone |
| `content` | `data-instant` | ''（条件成立时才出现） |
| `content` | `data-placement` | 定位引擎算出的实际落位 \| undefined |
| `content` | `data-state` | 'open' \| 'closed' |
| `arrow` | `data-placement` | 定位引擎算出的实际落位 |

<!-- xh-component-tokens:start -->
### CSS 变量

本组件公开覆盖槽由独立皮肤的实际消费位生成；缺省来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 缺省来源 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `--xh-menubar-arrow-size` | `arrow` | `--xh-_overlay-arrow-size` | `default` | `--xh-overlay-arrow-size` | menubar 的 arrow 部件 --xh-_overlay-arrow-size 覆盖槽。 |
| `--xh-menubar-backdrop` | `content` | `-webkit-backdrop-filter`<br>`backdrop-filter` | `default` | `--xh-material-frosted-backdrop` | menubar 的 content 部件 -webkit-backdrop-filter、backdrop-filter 覆盖槽。 |
| `--xh-menubar-bg` | `root` | `background` | `default` | `transparent` | menubar 的 root 部件 background 覆盖槽。 |
| `--xh-menubar-border` | `arrow`<br>`content` | `border` | `default` | `--xh-material-frosted-border` | menubar 的 arrow、content 部件 border 覆盖槽。 |
| `--xh-menubar-content-bg` | `arrow`<br>`content` | `background` | `default` | `--xh-material-frosted-bg` | menubar 的 arrow、content 部件 background 覆盖槽。 |
| `--xh-menubar-content-fg` | `content` | `color` | `default` | `--xh-material-frosted-fg` | menubar 的 content 部件 color 覆盖槽。 |
| `--xh-menubar-content-gap` | `content` | `gap` | `default` | `--xh-list-option-gap` | menubar 的 content 部件 gap 覆盖槽。 |
| `--xh-menubar-content-px` | `content` | `padding-inline` | `default` | `--xh-surface-pad-xs` | menubar 的 content 部件 padding-inline 覆盖槽。 |
| `--xh-menubar-content-py` | `content` | `padding-block` | `default` | `--xh-surface-pad-xs` | menubar 的 content 部件 padding-block 覆盖槽。 |
| `--xh-menubar-content-radius` | `content` | `border-radius` | `default` | `--xh-shape-surface` | menubar 的 content 部件 border-radius 覆盖槽。 |
| `--xh-menubar-content-shadow` | `content` | `box-shadow` | `default` | `--xh-material-frosted-shadow` | menubar 的 content 部件 box-shadow 覆盖槽。 |
| `--xh-menubar-fg` | `root` | `color` | `default` | `--xh-fg-default` | menubar 的 root 部件 color 覆盖槽。 |
| `--xh-menubar-gap` | `root` | `gap` | `default` | `--xh-space-1` | menubar 的 root 部件 gap 覆盖槽。 |
| `--xh-menubar-group-gap` | `group` | `gap` | `default` | `--xh-list-option-gap` | menubar 的 group 部件 gap 覆盖槽。 |
| `--xh-menubar-group-label-fg` | `group-label` | `color` | `default` | `--xh-material-frosted-fg-muted` | menubar 的 group-label 部件 color 覆盖槽。 |
| `--xh-menubar-group-label-font-size` | `group-label` | `font-size` | `default` | `--xh-text-caption-size` | menubar 的 group-label 部件 font-size 覆盖槽。 |
| `--xh-menubar-group-label-font-weight` | `group-label` | `font-weight` | `default` | `--xh-font-weight-medium` | menubar 的 group-label 部件 font-weight 覆盖槽。 |
| `--xh-menubar-group-label-px` | `group-label` | `padding-inline` | `default` | `--xh-_menubar-item-px` | menubar 的 group-label 部件 padding-inline 覆盖槽。 |
| `--xh-menubar-group-label-py` | `group-label` | `padding-block` | `default` | `--xh-space-1` | menubar 的 group-label 部件 padding-block 覆盖槽。 |
| `--xh-menubar-highlight` | `content` | `background` | `default` | `--xh-material-frosted-highlight` | menubar 的 content 部件 background 覆盖槽。 |
| `--xh-menubar-icon-size` | `content`<br>`root` | `--xh-icon-size` | `default` | `--xh-glyph-size-text` | menubar 的 content、root 部件 --xh-icon-size 覆盖槽。 |
| `--xh-menubar-item-bg-active` | `item` | `background` | `disabled`<br>`not([data-disabled])`<br>`state=open` | `--xh-bg-subtle` | menubar 的 item 部件 background 覆盖槽。 |
| `--xh-menubar-item-bg-hover` | `item` | `background` | `disabled`<br>`highlighted`<br>`is(:hover, [data-highlighted])`<br>`not([data-disabled])` | `--xh-bg-subtle` | menubar 的 item 部件 background 覆盖槽。 |
| `--xh-menubar-item-bg-pressed` | `item` | `background` | `active`<br>`disabled`<br>`not([data-disabled])` | `--xh-bg-subtle-active` | menubar 的 item 部件 background 覆盖槽。 |
| `--xh-menubar-item-description-fg` | `item-description` | `color` | `default` | `--xh-material-frosted-fg-muted` | menubar 的 item-description 部件 color 覆盖槽。 |
| `--xh-menubar-item-description-font-size` | `item-description` | `font-size` | `default` | `--xh-text-caption-size` | menubar 的 item-description 部件 font-size 覆盖槽。 |
| `--xh-menubar-item-fg` | `item` | `color` | `default` | `--xh-material-frosted-fg` | menubar 的 item 部件 color 覆盖槽。 |
| `--xh-menubar-item-font-size` | `item` | `font-size` | `default` | `--xh-_menubar-font-size` | menubar 的 item 部件 font-size 覆盖槽。 |
| `--xh-menubar-item-gap` | `item` | `gap` | `default` | `--xh-_menubar-item-gap` | menubar 的 item 部件 gap 覆盖槽。 |
| `--xh-menubar-item-indicator-fg` | `item-indicator` | `color` | `default` | `--xh-_tone` | menubar 的 item-indicator 部件 color 覆盖槽。 |
| `--xh-menubar-item-indicator-size` | `item-indicator` | `block-size`<br>`inline-size` | `default` | `--xh-control-indicator-size` | menubar 的 item-indicator 部件 block-size、inline-size 覆盖槽。 |
| `--xh-menubar-item-leading` | `item` | `line-height` | `default` | `--xh-leading-normal` | menubar 的 item 部件 line-height 覆盖槽。 |
| `--xh-menubar-item-px` | `item` | `padding-inline` | `default` | `--xh-_menubar-item-px` | menubar 的 item 部件 padding-inline 覆盖槽。 |
| `--xh-menubar-item-py` | `item` | `padding-block` | `default` | `--xh-_menubar-item-py` | menubar 的 item 部件 padding-block 覆盖槽。 |
| `--xh-menubar-item-radius` | `item` | `border-radius` | `default` | `--xh-shape-control` | menubar 的 item 部件 border-radius 覆盖槽。 |
| `--xh-menubar-layer` | `positioner` | `z-index` | `default` | `--xh-_layer` | menubar 的 positioner 部件 z-index 覆盖槽。 |
| `--xh-menubar-max-h` | `content` | `max-block-size` | `default` | `--xh-overlay-menu-max-h` | menubar 的 content 部件 max-block-size 覆盖槽。 |
| `--xh-menubar-max-w` | `content` | `max-inline-size` | `default` | `--xh-overlay-max-w` | menubar 的 content 部件 max-inline-size 覆盖槽。 |
| `--xh-menubar-min-w` | `content` | `min-inline-size` | `default` | `--xh-overlay-menu-min-w` | menubar 的 content 部件 min-inline-size 覆盖槽。 |
| `--xh-menubar-px` | `root` | `padding-inline` | `default` | `--xh-space-1` | menubar 的 root 部件 padding-inline 覆盖槽。 |
| `--xh-menubar-py` | `root` | `padding-block` | `default` | `--xh-space-1` | menubar 的 root 部件 padding-block 覆盖槽。 |
| `--xh-menubar-radius` | `root` | `border-radius` | `default` | `--xh-shape-control` | menubar 的 root 部件 border-radius 覆盖槽。 |
| `--xh-menubar-separator-color` | `separator` | `background` | `default` | `--xh-material-frosted-separator` | menubar 的 separator 部件 background 覆盖槽。 |
| `--xh-menubar-separator-my` | `separator` | `margin-block` | `default` | `--xh-space-0_5` | menubar 的 separator 部件 margin-block 覆盖槽。 |
| `--xh-menubar-separator-radius` | `separator` | `border-radius` | `default` | `--xh-shape-pill` | menubar 的 separator 部件 border-radius 覆盖槽。 |
| `--xh-menubar-separator-thickness` | `separator` | `block-size` | `default` | `--xh-stroke-thin` | menubar 的 separator 部件 block-size 覆盖槽。 |
| `--xh-menubar-submenu-indicator-fg` | `item` | `background-color` | `default` | `--xh-material-frosted-fg-muted` | menubar 的 item 部件 background-color 覆盖槽。 |
| `--xh-menubar-trigger-bg-active` | `trigger` | `background` | `disabled`<br>`not([data-disabled])`<br>`state=open` | `--xh-_menubar-active-bg` | menubar 的 trigger 部件 background 覆盖槽。 |
| `--xh-menubar-trigger-bg-hover` | `trigger` | `background` | `disabled`<br>`hover`<br>`not([data-disabled])` | `--xh-bg-subtle` | menubar 的 trigger 部件 background 覆盖槽。 |
| `--xh-menubar-trigger-font-size` | `trigger` | `font-size` | `default` | `--xh-_menubar-font-size` | menubar 的 trigger 部件 font-size 覆盖槽。 |
| `--xh-menubar-trigger-gap` | `trigger` | `gap` | `default` | `--xh-control-gap-sm` | menubar 的 trigger 部件 gap 覆盖槽。 |
| `--xh-menubar-trigger-px` | `trigger` | `padding-inline` | `default` | `--xh-_menubar-trigger-px` | menubar 的 trigger 部件 padding-inline 覆盖槽。 |
| `--xh-menubar-trigger-py` | `trigger` | `padding-block` | `default` | `--xh-_menubar-trigger-py` | menubar 的 trigger 部件 padding-block 覆盖槽。 |
| `--xh-menubar-trigger-radius` | `trigger` | `border-radius` | `default` | `--xh-shape-control` | menubar 的 trigger 部件 border-radius 覆盖槽。 |
<!-- xh-component-tokens:end -->

### 动效

关键帧 `xh-overlay-slide-in` · `xh-overlay-slide-out` 随皮肤自带，不引用别处文件里的名字；`background` · `color` · `scale` 走 `transition` 过渡。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

皮肤之外还有一段：退场由适配器的退场闸门把关，动画播完才真收起。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。

### RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像；另有按 `dir` 分支的规则。
