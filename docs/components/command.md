# Command 命令面板 <Badge type="info" text="alpha" />

覆盖在页面上的检索面板：输入筛选命令，方向键选择，回车执行。

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/command" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/command.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/command" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/command" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/command.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## 用法

提供一份命令清单，过滤、归组与空态都由组件处理

<XhDemo src="command/01-basic" />

## 组件结构

加粗的是必需部件。

`data-scope="command"`：`trigger` · `backdrop` · `positioner` · **`content`** · **`input`** · **`list`** · `group` · `group-label` · `item` · `item-text` · `empty` · `loading` · `footer`

## 示例

### 快捷键唤起与手写部件

Mod+K 打开，命中的文字由文本高亮标出，行尾挂载各命令自己的快捷键

<XhDemo src="command/02-hotkey" />

### 遮罩形态

variant 只落在 backdrop 层：opaque 压一层底色、blur 模糊背后、transparent 只阻挡点击

<XhDemo src="command/03-variant" />

### 远程检索

filter 关闭：传入的 collection 就是当前应显示的条目，筛选归服务端；取数期间 loading 显示在途占位、列表压暗一档，空态让位

<XhDemo src="command/04-async" />

## 设计指引

### 何时使用

- 功能分散在多层菜单中，用户知道要做什么但找不到入口。
- 需要一条跨页面的统一入口：搜索页面、设置、数据，执行动作。
- 熟练用户需要全程键盘操作：唤起、输入、回车。

### 何时不用

- 只是从一份清单中选一个值填入表单时，使用[组合框](./combobox)或[选择器](./select)。
- 只是右键菜单或按钮菜单时，使用[右键菜单](./context-menu)或[菜单](./menu)。
- 面板内需要放表单或分步骤时，使用[对话框](./dialog)。

### 特性

- 内置过滤：传入清单后按检索串逐词筛选、按 `group` 归组，空组自动移除。`keywords` 让一条命令同时匹配英文名、拼音与旧称。
- 过滤可以关闭（`filter` 置否），改由调用方筛选；远端检索使用这一档。
- 面板默认是模态浮层：捕获焦点、锁定滚动、背景失活，Escape 与点击遮罩收起，收起后焦点归还触发按钮。`modal=false` 时不渲染遮罩、不拦截页面指针，也不启用这些模态约束；展开期间切换会立即同步。
- 焦点全程在检索框，活动候选经 `aria-activedescendant` 报告给读屏；活动候选同步 `aria-selected=true`，其余候选显式为 `false`，输入后活动候选自动回到首条。
- 这里的 `aria-selected` 遵循 [WAI-ARIA 组合框规范](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/)中“选中随焦点移动”的模式，只描述当前活动建议；命令执行后不保留持久选中状态，视觉上也不绘制对号或选中底。
- 两种非条目相位各有部件：空（`empty`）与在途（`loading`）。取数期间显示在途占位，空态让位，两者不同时出现。
- 零可见命令时列表不保留额外空白行；搜索输入和作者提供的状态、底栏仍然在场。未提供 Empty / Loading 文案时不显示空白占位，也不自动生成提示文字。
- `collection` 与过滤结果保持数据语义；已挂载节点上的 `hidden` 会排除对应条目或分组的交互与 ARIA 高亮。未挂载或虚拟候选不按隐藏推断；展开期间替换列表节点后，可见性观察会切换到新节点。
- `closeOnSelect` 决定选中后是否收起；连续执行多条命令时关闭它。

### 组合

- 唤起可用[键盘按键](./kbd)：显示 `Mod + K` 并开启 `register`，在回调中执行 `setOpen(true)`。
- 条目文字中标出命中的字符使用[文本高亮](./highlight)，检索串即关键词。
- 行尾的快捷键提示和注册行为共用同一个 Kbd，避免展示与实际绑定不一致。

### 最佳实践

- 命令名写成“动词 + 宾语”（新建用户、导出报表），用户按动作查找。
- 分组按用户的心智模型划分（页面 / 设置 / 动作），不按代码模块划分。
- 底部提示条说明三件事：上下键选择、回车执行、Escape 关闭。
- 命令来自远端时提供在途占位，不让面板停留在空白状态。

### 反模式

- 把后台的每个按钮都放进来，面板变成第二份菜单树，检索反而更慢。
- 只匹配命令的中文全名：用户输入 `export` 时搜不到，别名应写进 `keywords`。
- 选中后没有任何反馈：命令应当场生效、导航过去，或给出一条轻提示。

## API 参考

### 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-command>` |
| Vue 组件 | `XhCommandContent` `XhCommandEmpty` `XhCommandFooter` `XhCommandGroup` `XhCommandGroupLabel` `XhCommandInput` `XhCommandItem` `XhCommandItemText` `XhCommandList` `XhCommandLoading` `XhCommandRoot` `XhCommandTrigger` |
| 组合式函数 | `useCommand` |
| 状态机 | `commandMachine` |
| 皮肤 | `@xihan-ui/styles/command.css` |

### Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `collection` | `readonly CommandNode[]` |  | 命令清单，标题、别名、归组与禁用的事实源。 |
| `groups` | `readonly CommandGroup[]` |  | 分组声明，决定组名与组序；清单中出现而这里未声明的组排在后面。 |
| `open` | `boolean` |  |  |
| `defaultOpen` | `boolean` |  |  |
| `inputValue` | `string` |  |  |
| `defaultInputValue` | `string` |  |  |
| `filter` | `boolean` |  | 内置过滤，默认开启。关闭后由调用方自行筛选，传入的 collection 即当前应显示的命令。 |
| `caseSensitive` | `boolean` |  | 过滤区分大小写，默认不区分。 |
| `closeOnSelect` | `boolean` |  | 选中一条命令后收起面板，默认 true。 |
| `modal` | `boolean` |  | 模态（陷焦点、锁滚动、遮罩交互外关闭），默认 true。 |
| `closeOnEscape` | `boolean` |  |  |
| `closeOnInteractOutside` | `boolean` |  |  |
| `restoreFocus` | `boolean` |  |  |
| `loop` | `boolean` |  | 方向键到达末尾是否回绕，默认 true。 |
| `loading` | `boolean` |  | 命令加载中：列表报告 aria-busy，显示在途占位，隐藏空态占位。 |
| `placeholder` | `string` |  | 检索框的占位文字。 |
| `dir` | `Direction` |  | 文字方向，默认 ltr。 |
| `size` | `Size` |  | 尺寸：sm / md / lg。只影响面板宽度与条目的几何档位。 |
| `variant` | `OverlayBackdropVariant` |  | 遮罩形态：opaque / blur / transparent。写在 backdrop 上，只影响该层的底色与模糊。 |
| `translations` | `Partial<CommandTranslations>` |  |  |
| `onOpenChange` | `(details: CommandOpenChangeDetails) => void` |  | open 变化意图回调；受控时是唯一出口，非受控时随内部转移一并通知。 |
| `onInputValueChange` | `(details: CommandInputValueChangeDetails) => void` |  | 检索串变化意图回调。 |
| `onSelect` | `(details: CommandSelectDetails) => void` |  | 选中一条命令：库不执行任何动作，后续行为全部由这里决定。 |

### 事件

自定义元素将载荷放在 `detail`；Vue 使用同名 emit。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `open-change` | `CommandOpenChangeDetails` | open 状态变化；detail 为 `{ open: boolean, reason?: string }` |
| `input-value-change` | `CommandInputValueChangeDetails` | 检索串变化；detail 为 `{ inputValue: string }` |
| `select` | `CommandSelectDetails` | 选中一条命令；detail 为 `{ value: string, label: string }` |

### 插槽

仅列出带载荷的插槽。

| Vue 组件 | 插槽 | 载荷 | 说明 |
| --- | --- | --- | --- |
| `XhCommandRoot` | `default` | `CommandRootSlotProps` |  |
| `XhCommandRoot` | `trigger` | — | 铺开时的触发按钮内容；未提供时不渲染触发器（面板改由快捷键或 v-model:open 唤起）。 |
| `XhCommandRoot` | `item` | `CommandNodeMeta` |  |
| `XhCommandRoot` | `empty` | — |  |
| `XhCommandRoot` | `footer` | — |  |

### 状态

公开状态写入 `data-state`。

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

以下名称仅用于内部状态机。

**状态**：`open` · `closed`

**事件**：`OPEN` · `TOGGLE` · `CLOSE` · `CONTROLLED.OPEN` · `CONTROLLED.CLOSE` · `INPUT.CHANGE` · `INPUT.SET` · `ITEM.HIGHLIGHT` · `HIGHLIGHT.CLEAR` · `ITEM.SELECT` · `PRESS.START` · `PRESS.END`

**判据**：`isOpenControlled` · `keepsOpenOnSelect` · `canPress`

### connect API

`getXxxProps()` 返回对应部件的宿主属性。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `open` | `boolean` |  |
| `inputValue` | `string` | 当前检索串。 |
| `groups` | `readonly CommandGroupMeta[]` | 过滤归组之后当前应显示的命令，空组已移除。 |
| `results` | `readonly CommandNodeMeta[]` | 上述分组视图展平的结果，次序即方向键的移动次序。 |
| `highlightedValue` | `string \| null` | 键盘锚点；收起时为 null。 |
| `empty` | `boolean` | 没有剩余条目。 |
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
| `getEmptyProps` | `() => T['element']` | 空态占位：放在 content 中、list 的兄弟。 提供 collection 时由连接层按条数收放；条目手写时不写 hidden，是否显示由作者决定。 |
| `getLoadingProps` | `() => T['element']` | 在途占位：与空态占位同一位置，两者不同时显示。 |
| `getFooterProps` | `() => T['element']` | 面板底部的提示条：内容由作者决定，这里只提供位置与观感。 |

## 无障碍

### 键盘

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
| `Enter` | open, 锚点落在可用命令上且未加载，按住 | 按住期间锚点命令投影 data-pressed，与指针 :active 同一副按压面；抬起或失焦撤下，命令随面板收起一并撤下 |
| `Tab` | open, modal | 在面板内循环焦点 |

### ARIA

以下属性由 `connect` 生成。

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

## 样式参考

### 皮肤

`@xihan-ui/styles/command.css` 使用 `[data-scope="command"][data-part="trigger"]` 部件选择器，位于 `xihan.components` 层。覆盖样式使用 `xihan.overrides`。

### 数据属性

由 `connect` 生成；条件不成立时不输出无值属性。

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
| `item` | `data-pressed` | ''（条件成立时才出现） |
| `item` | `data-xh-collection-context` | 'overlay' |
| `item` | `data-xh-collection-item` | '' |
| `item` | `data-xh-collection-size` | props.size |
| `item-text` | `data-xh-collection-slot` | 'text' |
| `empty` | `data-state` | 'open' \| 'closed' |
| `loading` | `data-state` | 'open' \| 'closed' |
| `footer` | `data-state` | 'open' \| 'closed' |

<!-- xh-component-tokens:start -->
### CSS 变量

本组件公开覆盖槽由独立皮肤的实际消费位生成；默认来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 默认来源 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `--xh-command-backdrop-bg` | `backdrop` | `background` | `default` | `--xh-bg-overlay` | command 的 backdrop 部件 background 覆盖槽。 |
| `--xh-command-backdrop-blur` | `backdrop` | `backdrop-filter` | `variant=blur` | `--xh-overlay-backdrop-blur` | command 的 backdrop 部件 backdrop-filter 覆盖槽。 |
| `--xh-command-backdrop-layer` | `backdrop` | `z-index` | `default` | `--xh-_layer` | command 的 backdrop 部件 z-index 覆盖槽。 |
| `--xh-command-bg` | `content` | `background` | `default` | `--xh-material-elevated-bg` | command 的 content 部件 background 覆盖槽。 |
| `--xh-command-border` | `content` | `border` | `default` | `--xh-material-elevated-border` | command 的 content 部件 border 覆盖槽。 |
| `--xh-command-empty-fg` | `empty` | `color` | `default` | `--xh-fg-subtle` | command 的 empty 部件 color 覆盖槽。 |
| `--xh-command-empty-font-size` | `empty` | `font-size` | `default` | `--xh-_command-font-size` | command 的 empty 部件 font-size 覆盖槽。 |
| `--xh-command-empty-px` | `empty` | `padding-inline` | `default` | `--xh-_command-px` | command 的 empty 部件 padding-inline 覆盖槽。 |
| `--xh-command-empty-py` | `empty` | `padding-block` | `default` | `--xh-space-6` | command 的 empty 部件 padding-block 覆盖槽。 |
| `--xh-command-fg` | `content` | `color` | `default` | `--xh-material-elevated-fg` | command 的 content 部件 color 覆盖槽。 |
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
| `--xh-command-icon-size` | `content`<br>`positioner` | `--xh-icon-size` | `is([data-part='positioner'], [data-part='content'])`<br>`size=lg`<br>`size=sm` | `--xh-glyph-size-lg`<br>`--xh-glyph-size-md`<br>`--xh-glyph-size-sm` | command 的 content、positioner 部件 --xh-icon-size 覆盖槽。 |
| `--xh-command-input-autofill-bg` | `input` | `box-shadow` | `-webkit-autofill`<br>`autofill` | `--xh-bg-surface` | command 的 input 部件 box-shadow 覆盖槽。 |
| `--xh-command-input-autofill-fg` | `input` | `-webkit-text-fill-color` | `-webkit-autofill`<br>`autofill` | `--xh-fg-default` | command 的 input 部件 -webkit-text-fill-color 覆盖槽。 |
| `--xh-command-input-border` | `input` | `border-block-end` | `default` | `--xh-border-subtle` | command 的 input 部件 border-block-end 覆盖槽。 |
| `--xh-command-input-fg` | `input` | `color` | `default` | `--xh-fg-default` | command 的 input 部件 color 覆盖槽。 |
| `--xh-command-input-font-size` | `input` | `font-size` | `default` | `--xh-text-body-size` | command 的 input 部件 font-size 覆盖槽。 |
| `--xh-command-input-h` | `input` | `block-size` | `default` | `--xh-_command-input-h` | command 的 input 部件 block-size 覆盖槽。 |
| `--xh-command-input-px` | `input` | `padding-inline` | `default` | `--xh-_command-px` | command 的 input 部件 padding-inline 覆盖槽。 |
| `--xh-command-inset-block-start` | `positioner` | `padding-block-start` | `default` | `--xh-space-8` | command 的 positioner 部件 padding-block-start 覆盖槽。 |
| `--xh-command-item-bg-hover` | `item` | `background-color` | `disabled`<br>`error`<br>`highlighted`<br>`hover`<br>`is(:focus-visible, [data-highlighted])`<br>`is([aria-selected='true'], [data-selected])`<br>`not([aria-disabled='true'], [data-disabled], [aria-busy='true'], [data-error])`<br>`selected`<br>`xh-collection-context=overlay` | `--xh-bg-subtle` | command 的 item 部件 background-color 覆盖槽。 |
| `--xh-command-item-bg-pressed` | `item` | `background-color` | `disabled`<br>`error`<br>`is(:active, [data-pressed])`<br>`is([aria-selected='true'], [data-selected])`<br>`not([aria-disabled='true'], [data-disabled], [aria-busy='true'], [data-error])`<br>`pressed`<br>`selected`<br>`xh-collection-context=overlay` | `--xh-bg-subtle-hover` | command 的 item 部件 background-color 覆盖槽。 |
| `--xh-command-item-fg` | `item` | `color` | `default`<br>`disabled`<br>`error`<br>`highlighted`<br>`hover`<br>`is(:active, [data-pressed])`<br>`is(:focus-visible, [data-highlighted])`<br>`is([aria-selected='true'], [data-selected])`<br>`not([aria-disabled='true'], [data-disabled], [aria-busy='true'], [data-error])`<br>`pressed`<br>`selected`<br>`xh-collection-context=overlay` | `--xh-fg-default` | command 的 item 部件 color 覆盖槽。 |
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
| `--xh-command-radius` | `content` | `border-radius` | `default` | `--xh-shape-overlay` | command 的 content 部件 border-radius 覆盖槽。 |
| `--xh-command-shadow` | `content` | `box-shadow` | `default` | `--xh-material-elevated-shadow` | command 的 content 部件 box-shadow 覆盖槽。 |
<!-- xh-component-tokens:end -->

### 动效

共享关键帧 `xh-fade-in` · `xh-fade-out` · `xh-overlay-pop-in` · `xh-pop-out` · `xh-rise-in` 由 `family/motion.css` 提供，皮肤 `@import` 它，单独引入仍成立。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

皮肤之外还有一段：退场由适配器的退场闸门把关，动画播完才真收起。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。

### RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像。
