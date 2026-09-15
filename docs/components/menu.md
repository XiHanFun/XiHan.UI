# Menu 菜单 <Badge type="info" text="alpha" />

从触发器打开一组操作命令。

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/menu" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/menu.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/menu" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/menu" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/menu.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## 用法

从按钮打开一组操作

<XhDemo src="menu/01-basic" />

## 组件结构

加粗的是必需部件。

`data-scope="menu"`：**`trigger`** · `positioner` · **`content`** · **`item`** · `item-text` · `item-indicator` · `item-description` · `separator` · `group` · `group-label` · `arrow`

## 示例

### 图标与快捷键

为常用命令补充识别信息

<XhDemo src="menu/02-icon" />

### 分组

使用标题与分隔线组织命令

<XhDemo src="menu/03-group" />

### 子菜单

将相关操作收进下一层

<XhDemo src="menu/04-submenu" />

## 设计指引

### 何时使用

- 收纳次要操作、账户命令或多级命令。

### 何时不用

- 选择并保留一个值时使用[选择器](./select)。
- 一两个主要操作直接使用[按钮](./button)。
- 站点主导航使用[导航菜单](./navigation-menu)。

### 特性

- `collection` 可直接生成条目、分组、标记位和分隔线。
- 支持方向键、首字符检索、禁用条目和多级子菜单。
- 子菜单使用安全三角避免指针斜向移动时误关闭。
- 条目可组合图标、文字、说明和快捷键提示。
- 选中命令后发出根级 `select` 并关闭菜单链。

### 组合

- 触发器通常使用中性按钮，避免与页面主操作争夺层级。

### 最佳实践

- 破坏性命令放在末尾，并与普通命令分隔。
- 条目使用简短的动宾短语。
- 仅为已注册的快捷键显示提示。

### 反模式

- 不要用命令菜单代替持久选择控件。
- 不要在菜单中放置长段说明或复杂表单。

## API 参考

### 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-menu>` |
| Vue 组件 | `XhMenuArrow` `XhMenuContent` `XhMenuGroup` `XhMenuGroupLabel` `XhMenuItem` `XhMenuItemDescription` `XhMenuItemIndicator` `XhMenuItemText` `XhMenuPositioner` `XhMenuRoot` `XhMenuSeparator` `XhMenuSub` `XhMenuSubTrigger` `XhMenuTrigger` |
| 组合式函数 | `useMenu` |
| 状态机 | `menuMachine` |
| 皮肤 | `@xihan-ui/styles/menu.css` |

### Props

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
| `typeahead` | `boolean` |  | 首字符连打检索，默认开。 |
| `disabled` | `boolean` |  | 整张菜单禁用：触发器不再展开，条目全转 aria-disabled。 |
| `translations` | `Partial<MenuTranslations>` |  |  |
| `submenu` | `boolean` |  | 本菜单是另一张菜单的子菜单：触发器渲染成父菜单的条目形态 （经 getSubmenuTriggerProps），缺省落位换到侧向，悬停触发缺省打开。 |
| `openOnHover` | `boolean` |  | 悬停触发：进触发器延时展开、经安全三角离开才收。子菜单缺省开，普通菜单缺省关。 |
| `hoverOpenDelay` | `number` |  | 悬停到展开的延时（ms），默认 100。 |
| `hoverCloseDelay` | `number` |  | 离开到收起的延时（ms），也是安全三角里的停滞上限，默认 300。 |
| `onOpenChange` | `(details: MenuOpenChangeDetails) => void` |  | open 变化回调。 |
| `onSelect` | `(details: MenuSelectDetails) => void` |  | 条目被选中；菜单随之关闭。 |

### 事件

自定义元素将载荷放在 `detail`；Vue 使用同名 emit。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `open-change` | `MenuOpenChangeDetails` | open 状态变化；detail 为 `{ open: boolean }` |
| `select` | `MenuSelectDetails` | 条目被选中（菜单随之关闭）；detail 为 `{ value: string }` |

### 插槽

仅列出带载荷的插槽。

| Vue 组件 | 插槽 | 载荷 | 说明 |
| --- | --- | --- | --- |
| `XhMenuRoot` | `default` | `MenuRootSlotProps` |  |
| `XhMenuRoot` | `trigger` | — |  |
| `XhMenuRoot` | `item` | `MenuNodeMeta` |  |
| `XhMenuSub` | `default` | `MenuSubSlotProps` |  |

### 状态

公开状态写入 `data-state`。

| 部件 | 取值 |
| --- | --- |
| `trigger` | 'open' \| 'closed' |
| `positioner` | 'open' \| 'closed' |
| `content` | 'open' \| 'closed' |
| `submenu-trigger` | 'open' \| 'closed' |

以下名称仅用于内部状态机。

**状态**：`open` · `closed`

**事件**：`OPEN` · `TOGGLE` · `CLOSE` · `CONTROLLED.OPEN` · `CONTROLLED.CLOSE` · `ITEM.FOCUS` · `FOCUS.CLEAR` · `ITEM.LOST` · `ITEM.SELECT`

**判据**：`isOpenControlled`

### connect API

`getXxxProps()` 返回对应部件的宿主属性。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `open` | `boolean` |  |
| `disabled` | `boolean` | 整张菜单是否禁用。 |
| `collection` | `readonly MenuNodeMeta[]` | collection 推出的条目元信息，按数据顺序排列；没给 collection 即空数组。 |
| `focusedValue` | `string \| null` | 焦点锚点；收起时为 null。 |
| `setOpen` | `(next: boolean) => void` |  |
| `getTriggerProps` | `() => T['button']` |  |
| `getPositionerProps` | `() => T['element']` |  |
| `getContentProps` | `() => T['element']` |  |
| `getItemProps` | `(props: MenuItemProps) => T['element']` |  |
| `getItemTextProps` | `(props: MenuItemProps) => T['element']` |  |
| `getItemIndicatorProps` | `(props: MenuItemProps) => T['element']` |  |
| `getItemDescriptionProps` | `(props: MenuItemProps) => T['element']` |  |
| `getSubmenuTriggerProps` | `(props: MenuItemProps) => T['element']` | 子菜单触发条目（submenu 模式）：既是父菜单里的一条 item（value 是它在父菜单 里的身份，父层的方向键与高亮照常认它），又是本子菜单的触发器（aria-haspopup、 悬停/点按/右方向键展开）。父层的选中会跳过带 aria-haspopup 的条目。 |
| `getSeparatorProps` | `() => T['element']` |  |
| `getGroupProps` | `(props: MenuGroupProps) => T['element']` |  |
| `getGroupLabelProps` | `(props: MenuGroupProps) => T['element']` |  |
| `getArrowProps` | `() => T['element']` |  |

## 无障碍

### 键盘

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

### ARIA

以下属性由 `connect` 生成。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `trigger` | `aria-controls` | `content` 部件的 id |
| `trigger` | `aria-expanded` | 'true' \| 'false' |
| `trigger` | `aria-haspopup` | 'menu' |
| `content` | `aria-hidden` | !open \|\| undefined |
| `content` | `aria-label` | props.translations.content |
| `content` | `aria-labelledby` | `trigger` 部件的 id \| undefined |
| `content` | `role` | 'menu' |
| `item` | `aria-disabled` | 'true' \| 'false' |
| `item` | `role` | 'menuitem' |
| `item-indicator` | `aria-hidden` | 'true' |
| `separator` | `aria-orientation` | 'horizontal' |
| `separator` | `role` | 'separator' |
| `group` | `aria-labelledby` | `group-label` 部件的 id |
| `group` | `role` | 'group' |
| `arrow` | `aria-hidden` | 'true' |
| `submenu-trigger` | `aria-controls` | `content` 部件的 id |
| `submenu-trigger` | `aria-disabled` | 'true' \| 'false' |
| `submenu-trigger` | `aria-expanded` | 'true' \| 'false' |
| `submenu-trigger` | `aria-haspopup` | 'menu' |
| `submenu-trigger` | `role` | 'menuitem' |

## 样式参考

### 皮肤

`@xihan-ui/styles/menu.css` 使用 `[data-scope="menu"][data-part="trigger"]` 部件选择器，位于 `xihan.components` 与 `xihan.motion` 层。覆盖样式使用 `xihan.overrides`。

`forced-colors: active` 下另有一套规则：颜色交给系统，边框与状态标记改用系统色关键字。

### 数据属性

由 `connect` 生成；条件不成立时不输出无值属性。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `trigger` | `data-disabled` | ''（条件成立时才出现） |
| `trigger` | `data-state` | 'open' \| 'closed' |
| `positioner` | `data-hidden` | ''（条件成立时才出现） |
| `positioner` | `data-placement` | 定位引擎算出的实际落位 |
| `positioner` | `data-positioned` | ''（条件成立时才出现） |
| `positioner` | `data-state` | 'open' \| 'closed' |
| `content` | `data-placement` | 定位引擎算出的实际落位 |
| `content` | `data-size` | props.size |
| `content` | `data-state` | 'open' \| 'closed' |
| `content` | `data-tone` | props.tone |
| `item` | `data-disabled` | ''（条件成立时才出现） |
| `item` | `data-highlighted` | ''（条件成立时才出现） |
| `arrow` | `data-placement` | 定位引擎算出的实际落位 |
| `submenu-trigger` | `data-disabled` | ''（条件成立时才出现） |
| `submenu-trigger` | `data-state` | 'open' \| 'closed' |

<!-- xh-component-tokens:start -->
### CSS 变量

本组件公开覆盖槽由独立皮肤的实际消费位生成；默认来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 默认来源 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `--xh-menu-arrow-size` | `arrow` | `--xh-_overlay-arrow-size` | `default` | `--xh-overlay-arrow-size` | menu 的 arrow 部件 --xh-_overlay-arrow-size 覆盖槽。 |
| `--xh-menu-backdrop` | `content` | `-webkit-backdrop-filter`<br>`backdrop-filter` | `default` | `--xh-material-frosted-backdrop` | menu 的 content 部件 -webkit-backdrop-filter、backdrop-filter 覆盖槽。 |
| `--xh-menu-border` | `arrow`<br>`content` | `border` | `default` | `--xh-material-frosted-border` | menu 的 arrow、content 部件 border 覆盖槽。 |
| `--xh-menu-content-bg` | `arrow`<br>`content` | `background` | `default` | `--xh-material-frosted-bg` | menu 的 arrow、content 部件 background 覆盖槽。 |
| `--xh-menu-content-fg` | `content` | `color` | `default` | `--xh-material-frosted-fg` | menu 的 content 部件 color 覆盖槽。 |
| `--xh-menu-content-gap` | `content` | `gap` | `default` | `--xh-list-option-gap` | menu 的 content 部件 gap 覆盖槽。 |
| `--xh-menu-content-px` | `content` | `padding-inline` | `default` | `--xh-surface-pad-xs` | menu 的 content 部件 padding-inline 覆盖槽。 |
| `--xh-menu-content-py` | `content` | `padding-block` | `default` | `--xh-surface-pad-xs` | menu 的 content 部件 padding-block 覆盖槽。 |
| `--xh-menu-content-radius` | `content` | `border-radius` | `default` | `--xh-shape-overlay` | menu 的 content 部件 border-radius 覆盖槽。 |
| `--xh-menu-content-shadow` | `content` | `box-shadow` | `default` | `--xh-material-frosted-shadow` | menu 的 content 部件 box-shadow 覆盖槽。 |
| `--xh-menu-group-gap` | `group` | `gap` | `default` | `--xh-list-option-gap` | menu 的 group 部件 gap 覆盖槽。 |
| `--xh-menu-group-label-fg` | `group-label` | `color` | `default` | `--xh-material-frosted-fg-muted` | menu 的 group-label 部件 color 覆盖槽。 |
| `--xh-menu-group-label-font-size` | `group-label` | `font-size` | `default` | `--xh-text-caption-size` | menu 的 group-label 部件 font-size 覆盖槽。 |
| `--xh-menu-group-label-font-weight` | `group-label` | `font-weight` | `default` | `--xh-font-weight-medium` | menu 的 group-label 部件 font-weight 覆盖槽。 |
| `--xh-menu-group-label-px` | `group-label` | `padding-inline` | `default` | `--xh-_menu-item-px` | menu 的 group-label 部件 padding-inline 覆盖槽。 |
| `--xh-menu-group-label-py` | `group-label` | `padding-block` | `default` | `--xh-space-1` | menu 的 group-label 部件 padding-block 覆盖槽。 |
| `--xh-menu-highlight` | `content` | `background` | `default` | `--xh-material-frosted-highlight` | menu 的 content 部件 background 覆盖槽。 |
| `--xh-menu-icon-size` | `content` | `--xh-icon-size` | `default` | `--xh-glyph-size-text` | menu 的 content 部件 --xh-icon-size 覆盖槽。 |
| `--xh-menu-item-bg-active` | `item` | `background` | `disabled`<br>`not([data-disabled])`<br>`state=open` | `--xh-bg-subtle` | menu 的 item 部件 background 覆盖槽。 |
| `--xh-menu-item-bg-hover` | `item` | `background` | `disabled`<br>`highlighted`<br>`is(:hover, [data-highlighted])`<br>`not([data-disabled])` | `--xh-bg-subtle` | menu 的 item 部件 background 覆盖槽。 |
| `--xh-menu-item-bg-pressed` | `item` | `background` | `active`<br>`disabled`<br>`not([data-disabled])` | `--xh-bg-subtle-active` | menu 的 item 部件 background 覆盖槽。 |
| `--xh-menu-item-description-fg` | `item-description` | `color` | `default` | `--xh-material-frosted-fg-muted` | menu 的 item-description 部件 color 覆盖槽。 |
| `--xh-menu-item-description-font-size` | `item-description` | `font-size` | `default` | `--xh-text-caption-size` | menu 的 item-description 部件 font-size 覆盖槽。 |
| `--xh-menu-item-fg` | `item` | `color` | `default` | `--xh-material-frosted-fg` | menu 的 item 部件 color 覆盖槽。 |
| `--xh-menu-item-font-size` | `item` | `font-size` | `default` | `--xh-_menu-font-size` | menu 的 item 部件 font-size 覆盖槽。 |
| `--xh-menu-item-gap` | `item` | `gap` | `default` | `--xh-_menu-item-gap` | menu 的 item 部件 gap 覆盖槽。 |
| `--xh-menu-item-indicator-fg` | `item-indicator` | `color` | `default` | `--xh-_tone` | menu 的 item-indicator 部件 color 覆盖槽。 |
| `--xh-menu-item-indicator-size` | `item-indicator` | `block-size`<br>`inline-size` | `default` | `--xh-control-indicator-size` | menu 的 item-indicator 部件 block-size、inline-size 覆盖槽。 |
| `--xh-menu-item-leading` | `item` | `line-height` | `default` | `--xh-leading-normal` | menu 的 item 部件 line-height 覆盖槽。 |
| `--xh-menu-item-px` | `item` | `padding-inline` | `default` | `--xh-_menu-item-px` | menu 的 item 部件 padding-inline 覆盖槽。 |
| `--xh-menu-item-py` | `item` | `padding-block` | `default` | `--xh-_menu-item-py` | menu 的 item 部件 padding-block 覆盖槽。 |
| `--xh-menu-item-radius` | `item` | `border-radius` | `default` | `--xh-shape-control` | menu 的 item 部件 border-radius 覆盖槽。 |
| `--xh-menu-layer` | `positioner` | `z-index` | `default` | `--xh-_layer` | menu 的 positioner 部件 z-index 覆盖槽。 |
| `--xh-menu-max-h` | `content` | `max-block-size` | `default` | `--xh-overlay-menu-max-h` | menu 的 content 部件 max-block-size 覆盖槽。 |
| `--xh-menu-max-w` | `content` | `max-inline-size` | `default` | `--xh-overlay-max-w` | menu 的 content 部件 max-inline-size 覆盖槽。 |
| `--xh-menu-min-w` | `content` | `min-inline-size` | `default` | `--xh-overlay-menu-min-w` | menu 的 content 部件 min-inline-size 覆盖槽。 |
| `--xh-menu-separator-color` | `separator` | `background` | `default` | `--xh-material-frosted-separator` | menu 的 separator 部件 background 覆盖槽。 |
| `--xh-menu-separator-my` | `separator` | `margin-block` | `default` | `--xh-space-0_5` | menu 的 separator 部件 margin-block 覆盖槽。 |
| `--xh-menu-separator-radius` | `separator` | `border-radius` | `default` | `--xh-shape-pill` | menu 的 separator 部件 border-radius 覆盖槽。 |
| `--xh-menu-separator-thickness` | `separator` | `block-size` | `default` | `--xh-stroke-thin` | menu 的 separator 部件 block-size 覆盖槽。 |
| `--xh-menu-submenu-indicator-fg` | `item` | `background-color` | `default` | `--xh-material-frosted-fg-muted` | menu 的 item 部件 background-color 覆盖槽。 |
| `--xh-menu-trigger-bg-active` | `trigger` | `background` | `disabled`<br>`not([data-disabled])`<br>`state=open` | `--xh-_menu-active-bg` | menu 的 trigger 部件 background 覆盖槽。 |
<!-- xh-component-tokens:end -->

### 动效

关键帧 `xh-overlay-slide-in` · `xh-overlay-slide-out` 随皮肤自带，不引用别处文件里的名字；`background` · `color` 走 `transition` 过渡。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

皮肤之外还有一段：退场由适配器的退场闸门把关，动画播完才真收起。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。

### RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像；另有按 `dir` 分支的规则。
