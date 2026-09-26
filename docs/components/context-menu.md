# ContextMenu 右键菜单

通过右键或长按在指针位置打开命令菜单。

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/context-menu" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/context-menu.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/context-menu" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/context-menu" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/context-menu.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## 用法

在目标区域右键打开命令菜单

<XhDemo src="context-menu/01-basic" />

## 组件结构

加粗的是必需部件。

`data-scope="context-menu"`：`root` · **`trigger`** · `positioner` · **`content`** · **`item`** · `item-text` · `item-indicator` · `item-description` · `item-shortcut` · `item-suffix` · `separator` · `group` · `group-label` · `arrow`

## 示例

### 分组

使用标题与分隔线组织命令

<XhDemo src="context-menu/02-group" />

### 图标与快捷键

在命令两侧补充识别信息

<XhDemo src="context-menu/03-icon" />

### 子菜单

将相关命令收进下一层

<XhDemo src="context-menu/04-submenu" />

## 设计指引

### 何时使用

- 为文件、表格行或画布对象提供快捷操作。

### 何时不用

- 主要操作应保留可见入口。
- 以触摸操作为主的界面不应只依赖长按。
- 选择值时使用[选择器](./select)。

### 特性

- 菜单默认贴近指针位置。
- 支持分组、分隔线、标记位和子菜单。
- 条目可逐条声明语气，删除一类命令自带该族字色与高亮底。
- 说明与快捷键提示都可写进 `collection`；快捷键贴行尾，与说明同档同色。
- `typeahead` 控制首字符检索，`longPressDelay` 设置长按时间。
- 条目可组合图标、文字、说明和快捷键提示。
- 选中任意层级的命令后发出根级 `select` 并关闭菜单链。

### 组合

- 使用 `XhContextMenuSub` 创建子菜单。

### 最佳实践

- 右键菜单只作为快捷入口，不替代页面上的主要操作。
- 条目较多时按功能分组。
- 仅为有意义的命令添加图标或快捷键提示。

### 反模式

- 不要在整页范围覆盖浏览器原生右键菜单。
- 不要移除复制、打开链接等原生能力而不提供等价入口。

## API 参考

### 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-context-menu>` |
| Vue 组件 | `XhContextMenuArrow` `XhContextMenuContent` `XhContextMenuGroup` `XhContextMenuGroupLabel` `XhContextMenuItem` `XhContextMenuItemDescription` `XhContextMenuItemIndicator` `XhContextMenuItemShortcut` `XhContextMenuItemSuffix` `XhContextMenuItemText` `XhContextMenuPositioner` `XhContextMenuRoot` `XhContextMenuSeparator` `XhContextMenuSub` `XhContextMenuSubTrigger` `XhContextMenuTrigger` |
| 组合式函数 | `useContextMenu` |
| 状态机 | `contextMenuMachine` |
| 皮肤 | `@xihan-ui/styles/context-menu.css` |

### Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `collection` | `ContextMenuNode[]` |  | 条目数据，显示文本、禁用、标记位与分组的事实源。提供后条目部件只需声明 value。 未提供时回到文本与禁用全部写在条目部件上的方式。 |
| `open` | `boolean` |  | 展开态。提供即受控：内部不再自行修改，只发 onOpenChange。 |
| `defaultOpen` | `boolean` |  |  |
| `placement` | `Placement` |  | 相对光标位置的首选放置位，默认 bottom-start。 |
| `offset` | `number` |  | 浮层与光标的间距（px），默认 0：右键菜单需要贴近光标。 |
| `loop` | `boolean` |  | 方向键到达末尾是否回绕，默认 true。 |
| `dir` | `Direction` |  | 文字方向，默认 ltr。 |
| `typeahead` | `boolean` |  | 连打检索，默认开启。关闭后可打印字符一律放行给页面。 |
| `translations` | `Partial<ContextMenuTranslations>` |  | 读屏文案，默认英文。 |
| `longPressDelay` | `number` |  | 触摸端长按多久视为触发（ms），默认 700。 |
| `tone` | `Tone` |  | 整张菜单的语气：brand / neutral / success / warning / danger / info。 只为浮层与作者放进来的内容备好该族颜色，不下发给条目——条目保持中性档， 逐条的语气写在 collection 的 `tone` 上（见 ContextMenuNode）。 |
| `size` | `Size` |  | 尺寸：sm / md / lg，决定条目高度、内边距与字号档位。 |
| `onOpenChange` | `(details: ContextMenuOpenChangeDetails) => void` |  | open 变化意图回调；受控时是唯一出口，非受控时随内部转移一并通知。 |
| `onSelect` | `(details: ContextMenuSelectDetails) => void` |  | 条目被选中；菜单随之关闭。 |

### ContextMenuNode

`collection` 的元素。

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `value` | `string` | 是 |  |
| `label` | `string` |  | 展示文本，也是连打检索的取字来源；默认回退为 value。 |
| `disabled` | `boolean` |  | 条目禁用：方向键跳过它，但它仍可聚焦、仍是导航起点。 |
| `tone` | `Tone` |  | 该条命令自身动作的性质：删除写 danger、停用写 warning。不写即与其余条目同档。 只换字色与悬停 / 按下的面，不改字重与缩进，也不表达选中或校验；禁用压过它。 红字不是唯一通道，破坏性命令仍要配图标。整张菜单的 tone 不下发给条目。 |
| `indicator` | `string` |  | 标记位文字（勾选符号等装饰）；未提供时本条不铺 item-indicator。 |
| `description` | `string` |  | 副文本，写入 item-description 部件；未提供时本条不铺该部件。 |
| `shortcut` | `string` |  | 快捷键提示，写入 item-shortcut 部件；未提供时本条不铺该部件。 纯装饰：读屏从条目文字取意，不念它；只为真正注册了的组合写提示。 |
| `group` | `string` |  | 归属分组的身份值；相邻同值的条目收进同一个 group 部件。未提供时本条直接落在 content 上。 |
| `groupLabel` | `string` |  | 分组标题文字，取本组首个提供它的条目；本组无人提供时不铺 group-label。 |
| `separatorBefore` | `boolean` |  | 本条之前绘制一条分隔线；写在首条上不产出分隔线。本条领头一个分组时，分隔线绘制在分组外。 |

### 事件

自定义元素将载荷放在 `detail`；Vue 使用同名 emit。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `open-change` | `ContextMenuOpenChangeDetails` | open 状态变化；detail 为 `{ open: boolean }` |
| `select` | `ContextMenuSelectDetails` | 条目被选中（菜单随之关闭）；detail 为 `{ value: string }` |

### 插槽

仅列出带载荷的插槽。

| Vue 组件 | 插槽 | 载荷 | 说明 |
| --- | --- | --- | --- |
| `XhContextMenuRoot` | `default` | `ContextMenuRootSlotProps` |  |
| `XhContextMenuRoot` | `trigger` | — |  |
| `XhContextMenuRoot` | `item` | `ContextMenuNodeMeta` | 只填条目的文字槽，标记位、副文本与快捷键照旧由数据铺 |
| `XhContextMenuRoot` | `item-prefix` | `ContextMenuNodeMeta` | 只接管行首那一格，其余槽照旧由数据铺 |
| `XhContextMenuRoot` | `item-suffix` | `ContextMenuNodeMeta` | 只接管行尾那一格（计数、徽标、次级图标），其余槽照旧由数据铺 |
| `XhContextMenuSub` | `default` | `ContextMenuSubSlotProps` |  |

### React 适配器 props

只列各组件自己声明的那些：继承自 `ComponentPropsWithRef` 的 DOM 属性不在其中，根组件上与上面 Props 表同名的也不重复列。Vue 的对应物是上面的插槽表。

| React 组件 | 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- | --- |
| `XhContextMenuGroup` | `value` | `string` | 是 |  |
| `XhContextMenuItem` | `value` | `string` | 是 |  |
| `XhContextMenuItem` | `disabled` | `boolean` |  | 默认交给 connect 查询 collection，写死 false 会覆盖数据中的禁用。 |
| `XhContextMenuPositioner` | `container` | `() => Element \| null` |  | 浮层挂载的容器；未提供时按全局配置，再未提供时挂载到 body。 |
| `XhContextMenuRoot` | `trigger` | `ReactNode` |  | 触发区中放置的内容；只提供 collection 时由它承载。 |
| `XhContextMenuRoot` | `renderItem` | `(node: ContextMenuNodeMeta) => ReactNode` |  | 每个条目的自定义内容；未提供时使用 collection 中的 label。 |
| `XhContextMenuRoot` | `renderItemPrefix` | `(node: ContextMenuNodeMeta) => ReactNode` |  | 只接管条目行首那一格；其余槽仍由数据铺。 |
| `XhContextMenuRoot` | `renderItemSuffix` | `(node: ContextMenuNodeMeta) => ReactNode` |  | 只接管条目行尾那一格（计数、徽标、次级图标）；其余槽仍由数据铺。 |
| `XhContextMenuRoot` | `children` | `SlotChildren<ContextMenuRootSlotProps>` |  |  |
| `XhContextMenuSub` | `value` | `string` | 是 | 它在父右键菜单中的条目身份。 |
| `XhContextMenuSub` | `disabled` | `boolean` |  |  |
| `XhContextMenuSub` | `collection` | `MenuNode[]` |  |  |
| `XhContextMenuSub` | `placement` | `Placement` |  |  |
| `XhContextMenuSub` | `offset` | `number` |  |  |
| `XhContextMenuSub` | `loop` | `boolean` |  |  |
| `XhContextMenuSub` | `openOnHover` | `boolean` |  |  |
| `XhContextMenuSub` | `hoverOpenDelay` | `number` |  |  |
| `XhContextMenuSub` | `hoverCloseDelay` | `number` |  |  |
| `XhContextMenuSub` | `dir` | `Direction` |  | 文字方向；默认继承父层。子层被迁移到浮层落点，无法继承父层的方向。 |
| `XhContextMenuSub` | `tone` | `Tone` |  | 语气；默认继承父层。子层是浮层落点下的同级节点，CSS 私有槽无法继承。 |
| `XhContextMenuSub` | `size` | `Size` |  | 尺寸；默认继承父层，理由同 tone。 |
| `XhContextMenuSub` | `children` | `SlotChildren<ContextMenuSubSlotProps>` |  |  |

### 状态

公开状态写入 `data-state`。

| 部件 | 取值 |
| --- | --- |
| `root` | 'open' \| 'closed' |
| `trigger` | 'open' \| 'closed' |
| `positioner` | 'open' \| 'closed' |
| `content` | 'open' \| 'closed' |

以下名称仅用于内部状态机。

**状态**：`closed` · `pressing` · `open`

**事件**：`CONTEXT.MENU` · `OPEN` · `CLOSE` · `PRESS.START` · `PRESS.MOVE` · `PRESS.END` · `after.longPressDelay` · `ITEM.PRESS.START` · `ITEM.PRESS.END` · `CONTROLLED.OPEN` · `CONTROLLED.CLOSE` · `ITEM.FOCUS` · `FOCUS.CLEAR` · `ITEM.LOST` · `ITEM.SELECT`

**判据**：`isOpenControlled` · `movedBeyondTolerance` · `canPressItem`

### connect API

`getXxxProps()` 返回对应部件的宿主属性。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `open` | `boolean` |  |
| `collection` | `readonly ContextMenuNodeMeta[]` | 由 collection 推导的条目元信息，按数据顺序排列；未提供 collection 时为空数组。 |
| `pressing` | `boolean` | 长按计时进行中；触发区据此提供按压反馈。 |
| `point` | `ContextMenuPoint \| null` | 当前锚点坐标；从未打开过时为 null。 |
| `focusedValue` | `string \| null` | 焦点锚点；收起时为 null。 |
| `setOpen` | `(next: boolean) => void` | 收起经 CLOSE；展开沿用最近一次锚点坐标，从未有过坐标时锚定在触发区的起始角。 |
| `openAt` | `(x: number, y: number) => void` | 命令式展开到指定视口坐标。 |
| `getRootProps` | `() => T['element']` |  |
| `getTriggerProps` | `() => T['element']` |  |
| `getPositionerProps` | `() => T['element']` |  |
| `getContentProps` | `() => T['element']` |  |
| `getItemProps` | `(props: ContextMenuItemProps) => T['element']` |  |
| `getItemTextProps` | `(props: ContextMenuItemProps) => T['element']` |  |
| `getItemIndicatorProps` | `(props: ContextMenuItemProps) => T['element']` |  |
| `getItemDescriptionProps` | `(props: ContextMenuItemProps) => T['element']` |  |
| `getItemShortcutProps` | `(props: ContextMenuItemProps) => T['element']` |  |
| `getItemSuffixProps` | `(props: ContextMenuItemProps) => T['element']` |  |
| `getSeparatorProps` | `() => T['element']` |  |
| `getGroupProps` | `(props: ContextMenuGroupProps) => T['element']` |  |
| `getGroupLabelProps` | `(props: ContextMenuGroupProps) => T['element']` |  |
| `getArrowProps` | `() => T['element']` |  |

## 无障碍

### 键盘

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
| `Enter` / `Space` | held in item, not disabled | 按住期间该条目投影 data-pressed，与指针 :active 同一副按压面；抬起、失焦或菜单收起撤下 |
| `Escape` | open | 关闭菜单并把焦点归还触发区 |
| `Tab` / `Shift+Tab` | open | 关闭菜单，焦点不归还触发区，按 Tab 序列自然离开 |

### ARIA

以下属性由 `connect` 生成。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `trigger` | `aria-controls` | `content` 部件的 id |
| `trigger` | `aria-haspopup` | 'menu' |
| `trigger` | `aria-keyshortcuts` | 'Shift+F10' |
| `content` | `aria-hidden` | !open \|\| undefined |
| `content` | `aria-label` | props.translations.content |
| `content` | `role` | 'menu' |
| `item` | `aria-disabled` | 'true' \| 'false' |
| `item` | `role` | 'menuitem' |
| `item-indicator` | `aria-hidden` | 'true' |
| `item-shortcut` | `aria-hidden` | 'true' |
| `separator` | `aria-orientation` | 'horizontal' |
| `separator` | `role` | 'separator' |
| `group` | `aria-labelledby` | `group-label` 部件的 id |
| `group` | `role` | 'group' |
| `arrow` | `aria-hidden` | 'true' |

## 样式参考

### 皮肤

`@xihan-ui/styles/context-menu.css` 使用 `[data-scope="context-menu"][data-part="root"]` 部件选择器，位于 `xihan.components` 与 `xihan.motion` 层。覆盖样式使用 `xihan.overrides`。

`forced-colors: active` 下另有一套规则：颜色交给系统，边框与状态标记改用系统色关键字。

### 数据属性

由 `connect` 生成；条件不成立时不输出无值属性。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-size` | props.size |
| `root` | `data-state` | 'open' \| 'closed' |
| `root` | `data-tone` | props.tone |
| `trigger` | `data-pressing` | ''（条件成立时才出现） |
| `trigger` | `data-state` | 'open' \| 'closed' |
| `positioner` | `data-hidden` | ''（条件成立时才出现） |
| `positioner` | `data-placement` | 定位引擎算出的实际落位 |
| `positioner` | `data-positioned` | ''（条件成立时才出现） |
| `positioner` | `data-size` | props.size |
| `positioner` | `data-state` | 'open' \| 'closed' |
| `positioner` | `data-tone` | props.tone |
| `content` | `data-placement` | 定位引擎算出的实际落位 |
| `content` | `data-state` | 'open' \| 'closed' |
| `content` | `data-xh-material` | 'frosted' |
| `item` | `data-disabled` | ''（条件成立时才出现） |
| `item` | `data-highlighted` | ''（条件成立时才出现） |
| `item` | `data-pressed` | ''（条件成立时才出现） |
| `item` | `data-tone` | metaOf.get(item.value)?.tone |
| `item` | `data-xh-collection-context` | 'overlay' |
| `item` | `data-xh-collection-item` | '' |
| `item` | `data-xh-collection-size` | props.size |
| `item-text` | `data-disabled` | ''（条件成立时才出现） |
| `item-text` | `data-highlighted` | ''（条件成立时才出现） |
| `item-text` | `data-xh-collection-slot` | 'text' |
| `item-indicator` | `data-disabled` | ''（条件成立时才出现） |
| `item-indicator` | `data-highlighted` | ''（条件成立时才出现） |
| `item-indicator` | `data-xh-collection-slot` | 'prefix' |
| `item-description` | `data-disabled` | ''（条件成立时才出现） |
| `item-description` | `data-highlighted` | ''（条件成立时才出现） |
| `item-description` | `data-xh-collection-slot` | 'description' |
| `item-shortcut` | `data-disabled` | ''（条件成立时才出现） |
| `item-shortcut` | `data-highlighted` | ''（条件成立时才出现） |
| `item-shortcut` | `data-xh-collection-slot` | 'shortcut' |
| `item-suffix` | `data-disabled` | ''（条件成立时才出现） |
| `item-suffix` | `data-highlighted` | ''（条件成立时才出现） |
| `item-suffix` | `data-xh-collection-slot` | 'suffix' |
| `separator` | `data-xh-collection-separator` | '' |
| `arrow` | `data-placement` | 定位引擎算出的实际落位 |

<!-- xh-component-tokens:start -->
### CSS 变量

本组件公开覆盖槽由独立皮肤的实际消费位生成；默认来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 默认来源 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `--xh-context-menu-arrow-size` | `arrow` | `--xh-_overlay-arrow-size` | `default` | `--xh-overlay-arrow-size` | context-menu 的 arrow 部件 --xh-_overlay-arrow-size 覆盖槽。 |
| `--xh-context-menu-backdrop` | `content` | `-webkit-backdrop-filter`<br>`backdrop-filter` | `xh-material=frosted` | `--xh-_material-backdrop` | context-menu 的 content 部件 -webkit-backdrop-filter、backdrop-filter 覆盖槽。 |
| `--xh-context-menu-border` | `arrow`<br>`content` | `border` | `default`<br>`not([data-xh-action-control])`<br>`xh-material=frosted` | `--xh-_material-border`<br>`--xh-material-frosted-border` | context-menu 的 arrow、content 部件 border 覆盖槽。 |
| `--xh-context-menu-content-bg` | `arrow`<br>`content` | `background` | `default`<br>`not([data-xh-action-control])`<br>`xh-material=frosted` | `--xh-_material-bg`<br>`--xh-material-frosted-bg` | context-menu 的 arrow、content 部件 background 覆盖槽。 |
| `--xh-context-menu-content-fg` | `content` | `color` | `not([data-xh-action-control])`<br>`xh-material=frosted` | `--xh-_material-fg` | context-menu 的 content 部件 color 覆盖槽。 |
| `--xh-context-menu-content-gap` | `content` | `gap` | `default` | `--xh-list-option-gap` | context-menu 的 content 部件 gap 覆盖槽。 |
| `--xh-context-menu-content-px` | `content` | `padding-inline` | `default` | `--xh-surface-pad-xs` | context-menu 的 content 部件 padding-inline 覆盖槽。 |
| `--xh-context-menu-content-py` | `content` | `padding-block` | `default` | `--xh-surface-pad-xs` | context-menu 的 content 部件 padding-block 覆盖槽。 |
| `--xh-context-menu-content-radius` | `content` | `border-radius` | `default` | `--xh-shape-overlay` | context-menu 的 content 部件 border-radius 覆盖槽。 |
| `--xh-context-menu-content-shadow` | `content` | `box-shadow` | `not([data-xh-action-control])`<br>`xh-material=frosted` | `--xh-_material-shadow` | context-menu 的 content 部件 box-shadow 覆盖槽。 |
| `--xh-context-menu-group-gap` | `group` | `gap` | `default` | `--xh-list-option-gap` | context-menu 的 group 部件 gap 覆盖槽。 |
| `--xh-context-menu-group-label-fg` | `group-label` | `color` | `default` | `--xh-material-frosted-fg-muted` | context-menu 的 group-label 部件 color 覆盖槽。 |
| `--xh-context-menu-group-label-font-size` | `group-label` | `font-size` | `default` | `--xh-text-caption-size` | context-menu 的 group-label 部件 font-size 覆盖槽。 |
| `--xh-context-menu-group-label-font-weight` | `group-label` | `font-weight` | `default` | `--xh-font-weight-medium` | context-menu 的 group-label 部件 font-weight 覆盖槽。 |
| `--xh-context-menu-group-label-px` | `group-label` | `padding-inline` | `default` | `--xh-_context-menu-item-px` | context-menu 的 group-label 部件 padding-inline 覆盖槽。 |
| `--xh-context-menu-group-label-py` | `group-label` | `padding-block` | `default` | `--xh-space-1` | context-menu 的 group-label 部件 padding-block 覆盖槽。 |
| `--xh-context-menu-highlight` | `content` | `background` | `not([data-xh-action-control])`<br>`xh-material=frosted` | `--xh-_material-highlight` | context-menu 的 content 部件 background 覆盖槽。 |
| `--xh-context-menu-icon-size` | `positioner`<br>`root` | `--xh-icon-size` | `is([data-part='root'], [data-part='positioner'])`<br>`size=lg`<br>`size=sm` | `--xh-glyph-size-lg`<br>`--xh-glyph-size-md`<br>`--xh-glyph-size-sm` | context-menu 的 positioner、root 部件 --xh-icon-size 覆盖槽。 |
| `--xh-context-menu-item-bg-active` | `item` | `background-color` | `in-path` | `--xh-bg-subtle` | context-menu 的 item 部件 background-color 覆盖槽。 |
| `--xh-context-menu-item-bg-hover` | `item` | `background-color` | `disabled`<br>`error`<br>`highlighted`<br>`hover`<br>`is(:focus-visible, [data-highlighted])`<br>`not([aria-disabled='true'], [data-disabled], [aria-busy='true'], [data-error])` | `--xh-bg-subtle` | context-menu 的 item 部件 background-color 覆盖槽。 |
| `--xh-context-menu-item-bg-pressed` | `item` | `background-color` | `disabled`<br>`error`<br>`is(:active, [data-pressed])`<br>`not([aria-disabled='true'], [data-disabled], [aria-busy='true'], [data-error])`<br>`pressed` | `--xh-bg-subtle-hover` | context-menu 的 item 部件 background-color 覆盖槽。 |
| `--xh-context-menu-item-description-fg` | `item-description` | `color` | `default` | `--xh-material-frosted-fg-muted` | context-menu 的 item-description 部件 color 覆盖槽。 |
| `--xh-context-menu-item-description-font-size` | `item-description` | `font-size` | `default` | `--xh-text-caption-size` | context-menu 的 item-description 部件 font-size 覆盖槽。 |
| `--xh-context-menu-item-fg` | `item` | `color` | `default`<br>`disabled`<br>`error`<br>`highlighted`<br>`hover`<br>`in-path`<br>`is(:active, [data-pressed])`<br>`is(:focus-visible, [data-highlighted])`<br>`not([aria-disabled='true'], [data-disabled], [aria-busy='true'], [data-error])`<br>`pressed` | `--xh-material-frosted-fg` | context-menu 的 item 部件 color 覆盖槽。 |
| `--xh-context-menu-item-font-size` | `item` | `font-size` | `default` | `--xh-_context-menu-font-size` | context-menu 的 item 部件 font-size 覆盖槽。 |
| `--xh-context-menu-item-gap` | `item` | `gap` | `default` | `--xh-_context-menu-item-gap` | context-menu 的 item 部件 gap 覆盖槽。 |
| `--xh-context-menu-item-indicator-fg` | `item-indicator` | `color` | `default` | `--xh-_tone` | context-menu 的 item-indicator 部件 color 覆盖槽。 |
| `--xh-context-menu-item-indicator-size` | `item-indicator` | `--xh-icon-size`<br>`block-size`<br>`inline-size` | `default` | `--xh-control-indicator-size` | context-menu 的 item-indicator 部件 --xh-icon-size、block-size、inline-size 覆盖槽。 |
| `--xh-context-menu-item-leading` | `item` | `line-height` | `default` | `--xh-leading-normal` | context-menu 的 item 部件 line-height 覆盖槽。 |
| `--xh-context-menu-item-px` | `item` | `padding-inline` | `default` | `--xh-_context-menu-item-px` | context-menu 的 item 部件 padding-inline 覆盖槽。 |
| `--xh-context-menu-item-py` | `item` | `padding-block` | `default` | `--xh-_context-menu-item-py` | context-menu 的 item 部件 padding-block 覆盖槽。 |
| `--xh-context-menu-item-radius` | `item` | `border-radius` | `default` | `--xh-shape-control` | context-menu 的 item 部件 border-radius 覆盖槽。 |
| `--xh-context-menu-layer` | `positioner` | `z-index` | `default` | `--xh-_layer` | context-menu 的 positioner 部件 z-index 覆盖槽。 |
| `--xh-context-menu-max-h` | `content` | `max-block-size` | `default` | `--xh-overlay-menu-max-h` | context-menu 的 content 部件 max-block-size 覆盖槽。 |
| `--xh-context-menu-max-w` | `content` | `max-inline-size` | `default` | `--xh-overlay-max-w` | context-menu 的 content 部件 max-inline-size 覆盖槽。 |
| `--xh-context-menu-min-w` | `content` | `min-inline-size` | `default` | `--xh-overlay-menu-min-w` | context-menu 的 content 部件 min-inline-size 覆盖槽。 |
| `--xh-context-menu-separator-color` | `separator` | `background` | `default` | `--xh-material-frosted-separator` | context-menu 的 separator 部件 background 覆盖槽。 |
| `--xh-context-menu-separator-my` | `separator` | `margin-block` | `default` | `--xh-space-0_5` | context-menu 的 separator 部件 margin-block 覆盖槽。 |
| `--xh-context-menu-separator-radius` | `separator` | `border-radius` | `default` | `--xh-shape-pill` | context-menu 的 separator 部件 border-radius 覆盖槽。 |
| `--xh-context-menu-separator-thickness` | `separator` | `block-size` | `default` | `--xh-stroke-thin` | context-menu 的 separator 部件 block-size 覆盖槽。 |
| `--xh-context-menu-submenu-indicator-fg` | `item` | `background-color` | `default` | `--xh-material-frosted-fg-muted` | context-menu 的 item 部件 background-color 覆盖槽。 |
| `--xh-context-menu-submenu-indicator-size` | `item` | `block-size`<br>`inline-size` | `default` | `--xh-control-indicator-size` | context-menu 的 item 部件 block-size、inline-size 覆盖槽。 |
| `--xh-context-menu-trigger-bg-pressing` | `trigger` | `background` | `pressing` | `--xh-bg-subtle` | context-menu 的 trigger 部件 background 覆盖槽。 |
<!-- xh-component-tokens:end -->

### 动效

动效角色：按压 · 状态 · 出现（锚定列表）（见[动效规范](../design/motion#角色)）。

共享关键帧 `xh-overlay-slide-in` · `xh-overlay-slide-out` 由 `family/motion.css` 提供，皮肤 `@import` 它，单独引入仍成立；`background-color` 走 `transition` 过渡。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

皮肤之外还有一段：退场由适配器的退场闸门把关，动画播完才真收起。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。

### RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像；另有按 `dir` 分支的规则。
