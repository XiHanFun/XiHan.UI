# 菜单 <Badge type="info" text="menu" />

由一个触发器弹出的一列命令。选中一条即执行并收起。

## 何时使用

- 一组动作放不下、或不值得全部摆在界面上（更多操作、账户菜单）。
- 需要二级子菜单的命令树。

## 何时不用

- 要选一个值并保留选中态：那是[选择器](./select)——菜单的条目是命令，选完就关，不留选中。
- 只有一两个动作：直接摆[按钮](./button)。
- 是站点的主导航：用[导航菜单](./navigation-menu)，它的条目是链接。

## 特性

- 悬停触发有安全三角：指针斜穿赶往浮层不会误收；Portal 化的多级子菜单由 headless 逻辑树维护真实父子关系，在末级移动不会启动祖先关闭，叶项选择按叶到根收起并只由根上报一次。
- 条目以 `value` 标识身份，禁用项方向键跳过也选不中。
- `content` 里可以直接放任意节点；不是 `item` 就不进方向键行程，也选不中。
- 子菜单触发条目双重身份：父层方向键照常走、右方向键进子层、子层左方向键退回。
- 条目可按 `group` 分组，组标题写在 `group-label` 上，两者以 `aria-labelledby` 相认；分组不改变方向键行程。
- 浮层使用 M2 磨砂表面；展开项使用中性灰反馈，不加左侧条、不使用默认品牌蓝底，也不改变字重。
- 图标、正文和快捷键等作者节点按一行排列；长正文用 `item-text` 截断，`item-description` 才另起一行，子菜单箭头位于行尾。

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

普通菜单行与展开项保持中性灰；tone 作用于触发器反馈和显式标记，不给展开项铺品牌色

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
| Vue 组件 | `XhMenuArrow` `XhMenuContent` `XhMenuGroup` `XhMenuGroupLabel` `XhMenuItem` `XhMenuItemDescription` `XhMenuItemIndicator` `XhMenuItemText` `XhMenuPositioner` `XhMenuRoot` `XhMenuSeparator` `XhMenuSub` `XhMenuSubTrigger` `XhMenuTrigger` |
| 组合式函数 | `useMenu` |
| 状态机 | `menuMachine` |
| 皮肤 | `@xihan-ui/styles/menu.css` |

## 解剖

部件名即 `data-part` 属性值，也是皮肤的选择器。加粗的是必备部件，不渲染它组件不工作（Web Components 适配器会在诊断通道上报 `wc.missing-part`）。

`data-scope="menu"`：**`trigger`** · `positioner` · **`content`** · **`item`** · `item-text` · `item-indicator` · `item-description` · `separator` · `group` · `group-label` · `arrow`

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
| `typeahead` | `boolean` |  | 首字符连打检索，默认开。 |
| `disabled` | `boolean` |  | 整张菜单禁用：触发器不再展开，条目全转 aria-disabled。 |
| `translations` | `Partial<MenuTranslations>` |  |  |
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

## 状态

对外可见的状态落在 `data-state` 上，写样式与断言都读它：

| 部件 | 取值 |
| --- | --- |
| `trigger` | 'open' \| 'closed' |
| `positioner` | 'open' \| 'closed' |
| `content` | 'open' \| 'closed' |
| `submenu-trigger` | 'open' \| 'closed' |

状态机内部转移，写样式与业务都用不到；要监听变化请看上面的「事件」。

**状态**：`open` · `closed`

**事件**：`OPEN` · `TOGGLE` · `CLOSE` · `CONTROLLED.OPEN` · `CONTROLLED.CLOSE` · `ITEM.FOCUS` · `FOCUS.CLEAR` · `ITEM.LOST` · `ITEM.SELECT`

**判据**：`isOpenControlled`

## connect API

`useMenu` 产出的对象。`getXxxProps()` 铺到对应部件的宿主元素上，其余是可读状态与操作入口。

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

## 无障碍

下面这些由 `connect` 铺到部件上，作者不必自己写；重复写反而会覆盖掉正确值。

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

## 样式

默认皮肤 `@xihan-ui/styles/menu.css` 按部件选择：`[data-scope="menu"][data-part="trigger"]`。它落在 `xihan.components` 与 `xihan.motion` 层；业务样式不写进 `@layer` 即高于全部库层，要按层压过来就写进 `xihan.overrides`。

`forced-colors: active` 下另有一套规则：颜色交给系统，边框与状态标记改用系统色关键字。

## 数据属性

由 `connect` 产出并铺到部件上，皮肤与测试都据此选择；`data-disabled` 这类无值属性在条件不成立时整个不出现。

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
## CSS 变量

本组件公开覆盖槽由独立皮肤的实际消费位生成；缺省来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 缺省来源 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `--xh-menu-arrow-size` | `arrow` | `--xh-_overlay-arrow-size` | `default` | `--xh-overlay-arrow-size` | menu 的 arrow 部件 --xh-_overlay-arrow-size 覆盖槽。 |
| `--xh-menu-backdrop` | `content` | `-webkit-backdrop-filter`<br>`backdrop-filter` | `default` | `--xh-material-frosted-backdrop` | menu 的 content 部件 -webkit-backdrop-filter、backdrop-filter 覆盖槽。 |
| `--xh-menu-border` | `arrow`<br>`content` | `border` | `default` | `--xh-material-frosted-border` | menu 的 arrow、content 部件 border 覆盖槽。 |
| `--xh-menu-content-bg` | `arrow`<br>`content` | `background` | `default` | `--xh-material-frosted-bg` | menu 的 arrow、content 部件 background 覆盖槽。 |
| `--xh-menu-content-fg` | `content` | `color` | `default` | `--xh-material-frosted-fg` | menu 的 content 部件 color 覆盖槽。 |
| `--xh-menu-content-gap` | `content` | `gap` | `default` | `--xh-list-option-gap` | menu 的 content 部件 gap 覆盖槽。 |
| `--xh-menu-content-px` | `content` | `padding-inline` | `default` | `--xh-surface-pad-xs` | menu 的 content 部件 padding-inline 覆盖槽。 |
| `--xh-menu-content-py` | `content` | `padding-block` | `default` | `--xh-surface-pad-xs` | menu 的 content 部件 padding-block 覆盖槽。 |
| `--xh-menu-content-radius` | `content` | `border-radius` | `default` | `--xh-shape-surface` | menu 的 content 部件 border-radius 覆盖槽。 |
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

## 动效

关键帧 `xh-overlay-slide-in` · `xh-overlay-slide-out` 随皮肤自带，不引用别处文件里的名字；`background` · `color` 走 `transition` 过渡。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

皮肤之外还有一段：退场由适配器的退场闸门把关，动画播完才真收起。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。

## RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像；另有按 `dir` 分支的规则。

## 组合

- 触发器用[按钮](./button)；与[按钮组](./button-group)组合成分裂按钮；与[面包屑](./breadcrumb)组合做层级切换。

## 最佳实践

- 破坏性命令与其余条目之间隔一道[分隔线](./separator)，并放在最后。
- 悬停触发只在指针环境有意义，触摸与键盘恒靠点击那条路径。
- 快捷键提示可用作者节点并设置 `margin-inline-start: auto` 推到行尾，不必为了排版补造占位节点。

### 当前边界

- 当前尚无正式 checkbox item、radio group/item 与单条 danger tone，选择能力需要行为及可访问语义一起交付，不能只画一个勾来代替。
- 快捷键提示属于作者内容，不会自动注册键盘动作；正式 shortcut/trailing 部件仍待独立实现。

## 反模式

- 用菜单做单选：读屏用户听到的是"菜单项"，不是"选项"，选完也不知道当前值是什么。
- 条目文字写成一句话：菜单项应是动宾短语。
