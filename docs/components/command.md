# 命令面板 <Badge type="info" text="command" />

一块盖在页面上的检索面板：打字筛出命令，方向键选，回车执行。

## 何时使用

- 功能散在很多层菜单里，用户知道要做什么却找不到入口。
- 需要一条跨页面的统一入口：搜页面、搜设置、搜数据、跑动作，都从这里进。
- 熟手要靠键盘一路走完：唤起、打字、回车，全程不碰鼠标。

## 何时不用

- 只是从一份清单里选一个值填进表单：用[组合框](./combobox)或[选择器](./select)。
- 只是右键菜单或按钮菜单：用[上下文菜单](./context-menu)或[菜单](./menu)。
- 面板里要放表单、要分步骤：那是[对话框](./dialog)。

## 特性

- 内置过滤：清单交进来，按检索串逐词筛、按 `group` 归组，空组自动丢掉。`keywords` 让一条命令同时认英文名、拼音与旧称。
- 过滤可以关掉（`filter` 置否），改由调用方自己筛——远端检索走这一档。
- 面板默认是模态浮层：陷焦点、锁滚动、背景失活，Escape 与点击遮罩收起，收起后焦点还给触发按钮。`modal=false` 时不渲染遮罩、不拦页面指针，也不启用这些模态约束；展开期间切换会立即同步。
- 焦点全程在检索框，锚点经 `aria-activedescendant` 报给读屏；活动候选同步 `aria-selected=true`，其余候选显式为 `false`，打字后锚点自动钉回首条。
- 这里的 `aria-selected` 遵循 [WAI-ARIA 组合框规范](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/)中“选中随焦点移动”的模式，只描述当前活动建议；命令执行后不会留下持久选中状态，视觉也不画对号或选中底。
- 两种非条目相位各有部件：空（`empty`）与在途（`loading`）。取数期间在途占位顶上来，空态让位，两者不同屏。
- 零可见命令时列表不保留额外空白行；搜索输入和作者提供的状态、底栏仍然在场。
  没有提供 Empty / Loading 文案时，不显示纯空白占位，也不自动捏造提示文字。
- `collection` 与过滤结果保持数据语义；已挂载节点上的 `hidden` 会排除对应条目或分组的交互与 ARIA 高亮。
  未挂载、虚拟候选不按隐藏推断；展开期间替换列表节点后，可见性观察会切换到新节点。
- `closeOnSelect` 决定选中后收不收；连着执行多条命令时关掉它。

## 示例

### 基础用法

交一份命令清单，过滤、归组与空态都由组件包办

<XhDemo src="command/01-basic" />

### 快捷键唤起 + 手写部件

Mod+K 打开，命中的字由文本高亮标出来，行尾挂各命令自己的快捷键

<XhDemo src="command/02-hotkey" />

### 遮罩形态

variant 只落在 backdrop 那一层：opaque 压一层底、blur 糊掉背后、transparent 只挡点击

<XhDemo src="command/03-variant" />

### 远程检索

filter 关掉：交进来的 collection 就是此刻该显示的那几条，筛选归服务端；取数期间 loading 让在途占位顶上来、列表压暗一档，空态让位

<XhDemo src="command/04-async" />

## 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-command>` |
| Vue 组件 | `XhCommandContent` `XhCommandEmpty` `XhCommandFooter` `XhCommandGroup` `XhCommandGroupLabel` `XhCommandInput` `XhCommandItem` `XhCommandItemText` `XhCommandList` `XhCommandLoading` `XhCommandRoot` `XhCommandTrigger` |
| 组合式函数 | `useCommand` |
| 状态机 | `commandMachine` |
| 皮肤 | `@xihan-ui/styles/command.css` |

## 解剖

部件名即 `data-part` 属性值，也是皮肤的选择器。加粗的是必备部件，不渲染它组件不工作（Web Components 适配器会在诊断通道上报 `wc.missing-part`）。

`data-scope="command"`：`trigger` · `backdrop` · `positioner` · **`content`** · **`input`** · **`list`** · `group` · `group-label` · `item` · `item-text` · `empty` · `loading` · `footer`

## Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `collection` | `readonly CommandNode[]` |  | 命令清单，标题、别名、归组与禁用的事实源。 |
| `groups` | `readonly CommandGroup[]` |  | 分组声明，决定组名与组序；清单里出现而这里没声明的组排在后面。 |
| `open` | `boolean` |  |  |
| `defaultOpen` | `boolean` |  |  |
| `inputValue` | `string` |  |  |
| `defaultInputValue` | `string` |  |  |
| `filter` | `boolean` |  | 内置过滤，默认开。关掉即由调用方自己筛，交进来的 collection 就是此刻该显示的那几条。 |
| `caseSensitive` | `boolean` |  | 过滤区分大小写，缺省不区分。 |
| `closeOnSelect` | `boolean` |  | 选中一条命令后收起面板，默认 true。 |
| `modal` | `boolean` |  | 模态（陷焦点、锁滚动、遮罩交互外关闭），默认 true。 |
| `closeOnEscape` | `boolean` |  |  |
| `closeOnInteractOutside` | `boolean` |  |  |
| `restoreFocus` | `boolean` |  |  |
| `loop` | `boolean` |  | 方向键走到尽头是否回绕，默认 true。 |
| `loading` | `boolean` |  | 命令还在取：列表报 aria-busy，在途占位顶上来，空态占位让位。 |
| `placeholder` | `string` |  | 检索框的占位文字。 |
| `dir` | `Direction` |  | 文字方向，默认 ltr。 |
| `size` | `Size` |  | 尺寸：sm / md / lg。只换面板宽度与条目的几何档位。 |
| `variant` | `OverlayBackdropVariant` |  | 遮罩形态：opaque / blur / transparent。落在 backdrop 上，只换那一层的底色与模糊。 |
| `translations` | `Partial<CommandTranslations>` |  |  |
| `onOpenChange` | `(details: CommandOpenChangeDetails) => void` |  | open 变化意图回调；受控时是唯一出口，非受控时随内部转移一并通知。 |
| `onInputValueChange` | `(details: CommandInputValueChangeDetails) => void` |  | 检索串变化意图回调。 |
| `onSelect` | `(details: CommandSelectDetails) => void` |  | 选中一条命令：库不执行任何动作，做什么全归这里。 |

## 事件

自定义元素派发这些事件，Vue 组件对应同名 emit；载荷都在 `detail` 上。可双向绑定的值另有 `update:xxx`，见 Props。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `open-change` | `CommandOpenChangeDetails` | open 状态变化；detail 为 `{ open: boolean, reason?: string }` |
| `input-value-change` | `CommandInputValueChangeDetails` | 检索串变化；detail 为 `{ inputValue: string }` |
| `select` | `CommandSelectDetails` | 选中一条命令；detail 为 `{ value: string, label: string }` |

## 插槽

作者能拿到载荷的插槽。只转发内容、不带载荷的默认插槽不在此列——那类直接写子节点即可。

| Vue 组件 | 插槽 | 载荷 | 说明 |
| --- | --- | --- | --- |
| `XhCommandRoot` | `default` | `CommandRootSlotProps` |  |
| `XhCommandRoot` | `trigger` | — | 铺开时的触发按钮内容；不给即不渲染触发器（面板改由快捷键或 v-model:open 唤起）。 |
| `XhCommandRoot` | `item` | `CommandNodeMeta` |  |
| `XhCommandRoot` | `empty` | — |  |
| `XhCommandRoot` | `footer` | — |  |

## 状态

对外可见的状态落在 `data-state` 上，写样式与断言都读它：

| 部件 | 取值 |
| --- | --- |
| `trigger` | 'open' \| 'closed' |
| `backdrop` | 'open' \| 'closed' |
| `positioner` | 'open' \| 'closed' |
| `content` | 'open' \| 'closed' |
| `input` | 'open' \| 'closed' |
| `list` | 'open' \| 'closed' |
| `empty` | 'open' \| 'closed' |
| `loading` | 'open' \| 'closed' |
| `footer` | 'open' \| 'closed' |

状态机内部转移，写样式与业务都用不到；要监听变化请看上面的「事件」。

**状态**：`open` · `closed`

**事件**：`OPEN` · `TOGGLE` · `CLOSE` · `CONTROLLED.OPEN` · `CONTROLLED.CLOSE` · `INPUT.CHANGE` · `INPUT.SET` · `ITEM.HIGHLIGHT` · `HIGHLIGHT.CLEAR` · `ITEM.SELECT`

**判据**：`isOpenControlled` · `keepsOpenOnSelect`

## connect API

`useCommand` 产出的对象。`getXxxProps()` 铺到对应部件的宿主元素上，其余是可读状态与操作入口。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `open` | `boolean` |  |
| `inputValue` | `string` | 当前检索串。 |
| `groups` | `readonly CommandGroupMeta[]` | 过滤归组之后此刻该显示的命令，空组已经丢掉。 |
| `results` | `readonly CommandNodeMeta[]` | 上面那份分组视图摊平的结果，次序即方向键走的次序。 |
| `highlightedValue` | `string \| null` | 键盘锚点；收起时为 null。 |
| `empty` | `boolean` | 一条都没剩下。 |
| `loading` | `boolean` |  |
| `setOpen` | `(next: boolean) => void` |  |
| `setInputValue` | `(next: string) => void` |  |
| `select` | `(value: string) => void` | 直接选中某条命令，等同于在它上面按回车。 |
| `getTriggerProps` | `() => T['button']` |  |
| `getBackdropProps` | `() => T['element']` |  |
| `getPositionerProps` | `() => T['element']` |  |
| `getContentProps` | `() => T['element']` |  |
| `getInputProps` | `() => T['input']` |  |
| `getListProps` | `() => T['element']` |  |
| `getGroupProps` | `(props: CommandGroupProps) => T['element']` |  |
| `getGroupLabelProps` | `(props: CommandGroupProps) => T['element']` |  |
| `getItemProps` | `(props: CommandItemProps) => T['element']` |  |
| `getItemTextProps` | `(props: CommandItemProps) => T['element']` |  |
| `getEmptyProps` | `() => T['element']` | 空态占位：放在 content 里、list 的兄弟。 给了 collection 时由连接层按条数收放；条目手写时不写 hidden，露不露面归作者。 |
| `getLoadingProps` | `() => T['element']` | 在途占位：与空态占位同一个位置，两者不同屏。 |
| `getFooterProps` | `() => T['element']` | 面板底部的提示条：作者放什么由作者定，这里只给位置与观感。 |

## 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/#keyboardinteraction)

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `Enter` / `Space` | focus in trigger | 打开面板并把焦点移入检索框 |
| `Escape` | open | 关闭面板并把焦点还给 trigger |
| `ArrowDown` | open | 锚点移到下一条命令，禁用的跳过 |
| `ArrowUp` | open | 锚点移到上一条命令，禁用的跳过 |
| `Home` | open | 锚点移到首条命令 |
| `End` | open | 锚点移到末条命令 |
| `Enter` | open, 锚点落在可用命令上 | 选中该命令；长按连发的重复键不重复选中 |
| `Tab` | open, modal | 在面板内循环焦点 |

## 无障碍

下面这些由 `connect` 铺到部件上，作者不必自己写；重复写反而会覆盖掉正确值。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `trigger` | `aria-controls` | `content` 部件的 id |
| `trigger` | `aria-expanded` | 'true' \| 'false' |
| `trigger` | `aria-haspopup` | 'dialog' |
| `content` | `aria-hidden` | !open \|\| undefined |
| `content` | `aria-label` | translations?.title |
| `content` | `aria-modal` | 'true' \| 'false' |
| `content` | `role` | 'dialog' |
| `input` | `aria-activedescendant` | `item` 部件的 id \| undefined |
| `input` | `aria-autocomplete` | 'list' |
| `input` | `aria-controls` | `list` 部件的 id |
| `input` | `aria-expanded` | 'true' |
| `input` | `aria-haspopup` | 'listbox' |
| `input` | `aria-label` | translations?.input |
| `input` | `role` | 'combobox' |
| `list` | `aria-busy` | 'true' \| undefined |
| `list` | `aria-label` | translations?.list |
| `list` | `role` | 'listbox' |
| `group` | `aria-labelledby` | `group-label` 部件的 id |
| `group` | `role` | 'group' |
| `item` | `aria-disabled` | 'true' \| 'false' |
| `item` | `aria-selected` | 'true' \| 'false' |
| `item` | `role` | 'option' |
| `empty` | `role` | 'status' |
| `loading` | `role` | 'status' |

## 样式

默认皮肤 `@xihan-ui/styles/command.css` 按部件选择：`[data-scope="command"][data-part="trigger"]`。它落在 `xihan.components` 与 `xihan.motion` 层；业务样式不写进 `@layer` 即高于全部库层，要按层压过来就写进 `xihan.overrides`。

## 数据属性

由 `connect` 产出并铺到部件上，皮肤与测试都据此选择；`data-disabled` 这类无值属性在条件不成立时整个不出现。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `trigger` | `data-state` | 'open' \| 'closed' |
| `backdrop` | `data-state` | 'open' \| 'closed' |
| `backdrop` | `data-variant` | props.variant |
| `positioner` | `data-positioned` | '' |
| `positioner` | `data-size` | props.size |
| `positioner` | `data-state` | 'open' \| 'closed' |
| `content` | `data-size` | props.size |
| `content` | `data-state` | 'open' \| 'closed' |
| `input` | `data-state` | 'open' \| 'closed' |
| `list` | `data-state` | 'open' \| 'closed' |
| `empty` | `data-state` | 'open' \| 'closed' |
| `loading` | `data-state` | 'open' \| 'closed' |
| `footer` | `data-state` | 'open' \| 'closed' |

<!-- xh-component-tokens:start -->
## CSS 变量

本组件公开覆盖槽由独立皮肤的实际消费位生成；缺省来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 缺省来源 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `--xh-command-backdrop-bg` | `backdrop` | `background` | `default` | `--xh-bg-overlay` | command 的 backdrop 部件 background 覆盖槽。 |
| `--xh-command-backdrop-blur` | `backdrop` | `backdrop-filter` | `variant=blur` | `--xh-overlay-backdrop-blur` | command 的 backdrop 部件 backdrop-filter 覆盖槽。 |
| `--xh-command-backdrop-layer` | `backdrop` | `z-index` | `default` | `--xh-_layer` | command 的 backdrop 部件 z-index 覆盖槽。 |
| `--xh-command-bg` | `content` | `background` | `default` | `--xh-bg-surface` | command 的 content 部件 background 覆盖槽。 |
| `--xh-command-empty-fg` | `empty` | `color` | `default` | `--xh-fg-subtle` | command 的 empty 部件 color 覆盖槽。 |
| `--xh-command-empty-font-size` | `empty` | `font-size` | `default` | `--xh-_command-font-size` | command 的 empty 部件 font-size 覆盖槽。 |
| `--xh-command-empty-px` | `empty` | `padding-inline` | `default` | `--xh-_command-px` | command 的 empty 部件 padding-inline 覆盖槽。 |
| `--xh-command-empty-py` | `empty` | `padding-block` | `default` | `--xh-space-6` | command 的 empty 部件 padding-block 覆盖槽。 |
| `--xh-command-fg` | `content` | `color` | `default` | `--xh-fg-default` | command 的 content 部件 color 覆盖槽。 |
| `--xh-command-footer-border` | `footer` | `border-block-start` | `default` | `--xh-border-subtle` | command 的 footer 部件 border-block-start 覆盖槽。 |
| `--xh-command-footer-fg` | `footer` | `color` | `default` | `--xh-fg-muted` | command 的 footer 部件 color 覆盖槽。 |
| `--xh-command-footer-font-size` | `footer` | `font-size` | `default` | `--xh-text-caption-size` | command 的 footer 部件 font-size 覆盖槽。 |
| `--xh-command-footer-gap` | `footer` | `gap` | `default` | `--xh-space-2` | command 的 footer 部件 gap 覆盖槽。 |
| `--xh-command-footer-px` | `footer` | `padding-inline` | `default` | `--xh-_command-px` | command 的 footer 部件 padding-inline 覆盖槽。 |
| `--xh-command-footer-py` | `footer` | `padding-block` | `default` | `--xh-space-2` | command 的 footer 部件 padding-block 覆盖槽。 |
| `--xh-command-group-gap` | `group` | `gap` | `default` | `--xh-list-option-gap` | command 的 group 部件 gap 覆盖槽。 |
| `--xh-command-group-label-fg` | `group-label` | `color` | `default` | `--xh-fg-subtle` | command 的 group-label 部件 color 覆盖槽。 |
| `--xh-command-group-label-font-size` | `group-label` | `font-size` | `default` | `--xh-text-caption-size` | command 的 group-label 部件 font-size 覆盖槽。 |
| `--xh-command-group-label-font-weight` | `group-label` | `font-weight` | `default` | `--xh-font-weight-medium` | command 的 group-label 部件 font-weight 覆盖槽。 |
| `--xh-command-group-label-px` | `group-label` | `padding-inline` | `default` | `--xh-_command-px` | command 的 group-label 部件 padding-inline 覆盖槽。 |
| `--xh-command-group-label-py` | `group-label` | `padding-block` | `default` | `--xh-space-1` | command 的 group-label 部件 padding-block 覆盖槽。 |
| `--xh-command-group-spacing` | `group` | `margin-block-start` | `default` | `--xh-space-1_5` | command 的 group 部件 margin-block-start 覆盖槽。 |
| `--xh-command-icon-size` | `content` | `--xh-icon-size` | `default` | `--xh-glyph-size-text` | command 的 content 部件 --xh-icon-size 覆盖槽。 |
| `--xh-command-input-autofill-bg` | `input` | `box-shadow` | `-webkit-autofill`<br>`autofill` | `--xh-bg-surface` | command 的 input 部件 box-shadow 覆盖槽。 |
| `--xh-command-input-autofill-fg` | `input` | `-webkit-text-fill-color` | `-webkit-autofill`<br>`autofill` | `--xh-fg-default` | command 的 input 部件 -webkit-text-fill-color 覆盖槽。 |
| `--xh-command-input-border` | `input` | `border-block-end` | `default` | `--xh-border-subtle` | command 的 input 部件 border-block-end 覆盖槽。 |
| `--xh-command-input-fg` | `input` | `color` | `default` | `--xh-fg-default` | command 的 input 部件 color 覆盖槽。 |
| `--xh-command-input-font-size` | `input` | `font-size` | `default` | `--xh-text-body-size` | command 的 input 部件 font-size 覆盖槽。 |
| `--xh-command-input-h` | `input` | `block-size` | `default` | `--xh-_command-input-h` | command 的 input 部件 block-size 覆盖槽。 |
| `--xh-command-input-px` | `input` | `padding-inline` | `default` | `--xh-_command-px` | command 的 input 部件 padding-inline 覆盖槽。 |
| `--xh-command-inset-block-start` | `positioner` | `padding-block-start` | `default` | `--xh-space-8` | command 的 positioner 部件 padding-block-start 覆盖槽。 |
| `--xh-command-item-bg-hover` | `item` | `background` | `disabled`<br>`highlighted`<br>`is(:hover, [data-highlighted])`<br>`not([data-disabled])` | `--xh-bg-subtle` | command 的 item 部件 background 覆盖槽。 |
| `--xh-command-item-fg` | `item` | `color` | `default` | `--xh-fg-default` | command 的 item 部件 color 覆盖槽。 |
| `--xh-command-item-font-size` | `item` | `font-size` | `default` | `--xh-_command-font-size` | command 的 item 部件 font-size 覆盖槽。 |
| `--xh-command-item-gap` | `item` | `gap` | `default` | `--xh-_command-gap` | command 的 item 部件 gap 覆盖槽。 |
| `--xh-command-item-leading` | `item` | `line-height` | `default` | `--xh-leading-normal` | command 的 item 部件 line-height 覆盖槽。 |
| `--xh-command-item-px` | `item` | `padding-inline` | `default` | `--xh-_command-px` | command 的 item 部件 padding-inline 覆盖槽。 |
| `--xh-command-item-py` | `item` | `padding-block` | `default` | `--xh-_command-item-py` | command 的 item 部件 padding-block 覆盖槽。 |
| `--xh-command-item-radius` | `item` | `border-radius` | `default` | `--xh-shape-control` | command 的 item 部件 border-radius 覆盖槽。 |
| `--xh-command-layer` | `positioner` | `z-index` | `default` | `--xh-_layer` | command 的 positioner 部件 z-index 覆盖槽。 |
| `--xh-command-list-busy-opacity` | `list` | `opacity` | `default` | `--xh-state-disabled-opacity` | command 的 list 部件 opacity 覆盖槽。 |
| `--xh-command-list-gap` | `list` | `gap` | `default` | `--xh-list-option-gap` | command 的 list 部件 gap 覆盖槽。 |
| `--xh-command-list-px` | `list` | `padding-inline` | `default` | `--xh-space-2` | command 的 list 部件 padding-inline 覆盖槽。 |
| `--xh-command-list-py` | `list` | `padding-block` | `default` | `--xh-space-2` | command 的 list 部件 padding-block 覆盖槽。 |
| `--xh-command-loading-fg` | `loading` | `color` | `default` | `--xh-fg-subtle` | command 的 loading 部件 color 覆盖槽。 |
| `--xh-command-loading-font-size` | `loading` | `font-size` | `default` | `--xh-_command-font-size` | command 的 loading 部件 font-size 覆盖槽。 |
| `--xh-command-loading-px` | `loading` | `padding-inline` | `default` | `--xh-_command-px` | command 的 loading 部件 padding-inline 覆盖槽。 |
| `--xh-command-loading-py` | `loading` | `padding-block` | `default` | `--xh-space-6` | command 的 loading 部件 padding-block 覆盖槽。 |
| `--xh-command-max-h` | `content` | `max-block-size` | `default` | `--xh-overlay-max-h` | command 的 content 部件 max-block-size 覆盖槽。 |
| `--xh-command-max-w` | `content` | `max-inline-size` | `default` | `--xh-_command-max-w` | command 的 content 部件 max-inline-size 覆盖槽。 |
| `--xh-command-placeholder-fg` | `input` | `color` | `placeholder` | `--xh-fg-subtle` | command 的 input 部件 color 覆盖槽。 |
| `--xh-command-positioner-pb` | `positioner` | `padding-block-end` | `default` | `--xh-space-4` | command 的 positioner 部件 padding-block-end 覆盖槽。 |
| `--xh-command-positioner-px` | `positioner` | `padding-inline` | `default` | `--xh-space-4` | command 的 positioner 部件 padding-inline 覆盖槽。 |
| `--xh-command-radius` | `content` | `border-radius` | `default` | `--xh-shape-surface` | command 的 content 部件 border-radius 覆盖槽。 |
| `--xh-command-shadow` | `content` | `box-shadow` | `default` | `--xh-elevation-sheet` | command 的 content 部件 box-shadow 覆盖槽。 |
<!-- xh-component-tokens:end -->

## 动效

关键帧 `xh-fade-in` · `xh-fade-out` · `xh-overlay-pop-in` · `xh-pop-out` · `xh-rise-in` 随皮肤自带，不引用别处文件里的名字；`background` · `color` 走 `transition` 过渡。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

皮肤之外还有一段：退场由适配器的退场闸门把关，动画播完才真收起。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。

## RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像。

## 组合

- 唤起用[快捷键](./hotkeys)：把 `mod+k` 绑到 `setOpen(true)` 上。
- 条目文字里标出命中的那几个字用[文本高亮](./highlight)，检索串就是它的关键词。
- 行尾的快捷键提示用[快捷键](./hotkeys)的按键部件，与全局绑定同一套写法。

## 最佳实践

- 命令名写成「动词 + 宾语」（新建用户、导出报表），用户按动作找东西。
- 分组按用户的心智分（页面 / 设置 / 动作），不要按代码模块分。
- 底部提示条写清三件事：上下键选、回车执行、Escape 关闭。
- 命令来自远端时给在途占位，别让面板停在一片空白上。

## 反模式

- 把整个后台的每个按钮都塞进来——面板变成第二份菜单树，检索反而更慢。
- 只认命令的中文全名：用户打 `export` 什么也搜不到，别名该写进 `keywords`。
- 选中后什么反馈都没有：命令要么当场生效，要么导航过去，要么给一条轻提示。
