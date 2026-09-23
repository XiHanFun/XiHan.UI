# Listbox 列表框

用于展示一组常驻选项，并允许用户选择其中一项或多项。

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/listbox" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/listbox.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/listbox" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/listbox" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/listbox.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## 用法

从成员列表中选择一项

<XhDemo src="listbox/01-basic" />

## 组件结构

加粗的是必需部件。

`data-scope="listbox"`：`root` · `label` · **`content`** · `item` · `item-prefix` · `item-text` · `item-description` · `item-suffix` · `item-indicator` · `group` · `group-label` · `empty` · `loading` · `load-more-trigger`

## 示例

### 多选

允许选择多个选项

<XhDemo src="listbox/02-multiple" />

### 分组

按类别组织选项

<XhDemo src="listbox/03-group" />

### 滚动

固定高度显示长列表

<XhDemo src="listbox/04-scroll" />

### 空态

没有选项时显示简洁提示

<XhDemo src="listbox/05-empty" />

## 设计指引

### 何时使用

- 选项需要常驻可见。
- 需要单选、多选或连续范围选择。

### 何时不用

- 选项需要收起：使用[选择器](./select)。
- 内容不可选择：使用[列表](./list)。

### 特性

- 支持 `single`、`multiple` 和 `extended` 三种选择模式。
- 支持方向键导航、连续输入检索与范围选择。
- 支持分组、禁用条目和定高滚动。
- 条目可逐条声明语气，失效或需要留意的那条自带该族字色与高亮底。
- 条目可写副文本，第 2 行放一句解释，与标题同列、走 muted 档。
- 行首与行尾两格各有逐条钩子：只想加个图标或计数，不必把整条重搭。
- 提供空态、加载态与加载更多部件。

### 组合

- 收进浮层即是[选择器](./select)与[组合框](./combobox)的候选列表；常驻时直接铺在面板内。
- 长列表接入[虚拟滚动](./virtualizer)只渲染可视区；两侧搬运的场景使用[穿梭框](./transfer)。

### 最佳实践

- 使用 `item-indicator` 表示选中，并始终保留其空间。页内列表的选中行铺品牌淡底行面并在起始侧画对号，与下拉候选的透明底行尾对号刻意不同。
- 条目标题保持简短，补充信息使用次级文字。
- 长列表设置固定高度，并按需启用虚拟化。
- 空态与加载态放在 `content` 外，与其互斥显示。

### 反模式

- 用选项承载删除、提交等即时命令。
- 在没有可见选项时保留空白列表边框。

## API 参考

### 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-listbox>` |
| Vue 组件 | `XhListboxContent` `XhListboxEmpty` `XhListboxGroup` `XhListboxGroupLabel` `XhListboxItem` `XhListboxItemDescription` `XhListboxItemIndicator` `XhListboxItemPrefix` `XhListboxItemSuffix` `XhListboxItemText` `XhListboxLabel` `XhListboxLoadMoreTrigger` `XhListboxLoading` `XhListboxRoot` |
| 组合式函数 | `useListbox` |
| 状态机 | `listboxMachine` |
| 皮肤 | `@xihan-ui/styles/listbox.css` |

### Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `collection` | `ListboxNode[]` |  | 条目数据，显示文本与禁用的事实源。提供后条目部件只需声明 value。 未提供时回到文本与禁用都写在条目部件上的方式。 |
| `value` | `string \| string[]` |  | 选中值，提供即受控；单选可写为裸串，内部归一为数组。 |
| `defaultValue` | `string \| string[]` |  |  |
| `selectionMode` | `ListboxSelectionMode` |  | 选择模式，默认 single。 |
| `disabled` | `boolean` |  | 整个列表禁用，键盘与点击都不再改选中值。 |
| `readOnly` | `boolean` |  | 只读：条目照常浏览与聚焦，但选中值不可修改。禁用则连同焦点一起退出。 |
| `loading` | `boolean` |  | 条目加载中：列表报告 aria-busy，显示在途占位，隐藏空态占位。 |
| `invalid` | `boolean` |  | 校验失败：列表报告 aria-invalid，各角色节点带 data-invalid。 |
| `tone` | `Tone` |  | 语气：brand / neutral / success / warning / danger / info，决定勾选标记使用哪族颜色。 |
| `size` | `Size` |  | 尺寸：sm / md / lg，决定条目的几何档位。 |
| `loop` | `boolean` |  | 方向键到达末尾是否回绕，默认 true。 |
| `dir` | `Direction` |  | 文字方向，默认 ltr。 |
| `orientation` | `Orientation` |  | 方向键轴向，默认 vertical。 |
| `typeahead` | `boolean` |  | 连打检索，默认开启。 |
| `onValueChange` | `(details: ListboxValueChangeDetails) => void` |  | value 变化意图回调。 |

### ListboxNode

`collection` 的元素。

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `value` | `string` | 是 |  |
| `label` | `string` |  | 展示文本，也是连打检索的取字来源；默认回退为 value。 |
| `disabled` | `boolean` |  | 条目禁用：方向键跳过它，但它仍可聚焦、仍是导航起点。 |
| `tone` | `Tone` |  | 该条选项自身的性质：危险选项写 danger、需要留意的写 warning。不写即与其余条目同档。 只换字色与悬停 / 按下的面，不表达选中与校验；选中的标记与禁用都压过它。 彩字不是唯一通道，要紧的差别仍要配图标或文案。整列的 tone 不下发给条目。 |
| `description` | `string` |  | 副文本，写入 item-description 部件；未提供时本条不铺该部件。 它是第 2 行的说明，跟着条目走 muted 档，不跟语气；放不下一行的解释才用它， 一句话能说清的写进 label。 |

### 事件

自定义元素将载荷放在 `detail`；Vue 使用同名 emit。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `value-change` | `ListboxValueChangeDetails` | 选中集合变化；detail 为 `{ value: string[] }` |

### 插槽

仅列出带载荷的插槽。

| Vue 组件 | 插槽 | 载荷 | 说明 |
| --- | --- | --- | --- |
| `XhListboxRoot` | `default` | `ListboxRootSlotProps` |  |
| `XhListboxRoot` | `label` | — |  |
| `XhListboxRoot` | `item` | `ListboxNodeMeta` | 只填条目的文字槽，副文本与首尾两格照旧各归各的 |
| `XhListboxRoot` | `item-prefix` | `ListboxNodeMeta` | 只接管行首那一格，其余槽照旧由数据铺 |
| `XhListboxRoot` | `item-suffix` | `ListboxNodeMeta` | 只接管行尾那一格（计数、徽标、次级图标），其余槽照旧由数据铺 |

### 状态

公开状态写入 `data-state`。

| 部件 | 取值 |
| --- | --- |
| `item` | 'checked' \| 'unchecked' |
| `item-prefix` | 'checked' \| 'unchecked' |
| `item-text` | 'checked' \| 'unchecked' |
| `item-description` | 'checked' \| 'unchecked' |
| `item-suffix` | 'checked' \| 'unchecked' |
| `item-indicator` | 'checked' \| 'unchecked' |

以下名称仅用于内部状态机。

**状态**：`idle`

**事件**：`VALUE.SET` · `VALUE.CLEAR` · `ITEM.SELECT` · `ITEM.TOGGLE` · `ITEM.FOCUS` · `FOCUS.CLEAR` · `LIST.BLUR` · `PRESS.START` · `PRESS.END`

**判据**：`canPress`

### connect API

`getXxxProps()` 返回对应部件的宿主属性。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `value` | `string[]` | 选中集合；单选模式下长度 ≤ 1。 |
| `collection` | `readonly ListboxNodeMeta[]` | 由 collection 推导的条目元信息，按数据顺序排列；未提供 collection 时为空数组。 |
| `selectionMode` | `ListboxSelectionMode` | 生效的选择模式。 |
| `focusedValue` | `string \| null` | 焦点锚点；焦点不在列表内时为 null。 |
| `disabled` | `boolean` |  |
| `readOnly` | `boolean` |  |
| `invalid` | `boolean` |  |
| `loading` | `boolean` |  |
| `isSelected` | `(value: string) => boolean` |  |
| `setValue` | `(next: string[]) => void` |  |
| `select` | `(value: string) => void` | 只保留该条目；加选使用 toggle。 |
| `toggle` | `(value: string) => void` |  |
| `getRootProps` | `() => T['element']` |  |
| `getLabelProps` | `() => T['element']` |  |
| `getContentProps` | `() => T['element']` |  |
| `getEmptyProps` | `() => T['element']` | 空态占位：放在 root 中、content 的兄弟。 提供 collection 时由连接层按条数收放；条目手写时不写 hidden，是否显示由作者决定。 |
| `getLoadingProps` | `() => T['element']` | 在途占位：与空态占位同一位置，两者不同时显示：加载期间显示它，空态让位。 提供 collection 时由连接层按条数收放；条目手写时只按 loading 收放。 |
| `getLoadMoreTriggerProps` | `() => T['element']` | 取下一页的入口：库不知道是否还有下一页，是否显示与点击后的行为都由作者决定， 连接层只保证取数在途与整列禁用两档不可点击。 |
| `getGroupProps` | `(props: ListboxGroupProps) => T['element']` |  |
| `getGroupLabelProps` | `(props: ListboxGroupProps) => T['element']` |  |
| `getItemProps` | `(props: ListboxItemProps) => T['element']` |  |
| `getItemPrefixProps` | `(props: ListboxItemProps) => T['element']` |  |
| `getItemTextProps` | `(props: ListboxItemProps) => T['element']` |  |
| `getItemDescriptionProps` | `(props: ListboxItemProps) => T['element']` |  |
| `getItemSuffixProps` | `(props: ListboxItemProps) => T['element']` |  |
| `getItemIndicatorProps` | `(props: ListboxItemProps) => T['element']` |  |

## 无障碍

### 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/listbox/#keyboardinteraction)

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `Tab` / `Shift+Tab` | focus outside the listbox | 整个列表只占一个 Tab 位：焦点进入锚点条目，无锚点时先落容器再由它转投 |
| `ArrowDown` | focus in listbox, orientation=vertical | 焦点移到下一个可停留条目（禁用项跳过、尽头按 loop 回绕）；orientation=horizontal 时改由 ArrowRight 承担，dir=rtl 再对调左右 |
| `ArrowUp` | focus in listbox, orientation=vertical | 焦点移到上一个可停留条目（禁用项跳过、尽头按 loop 回绕）；orientation=horizontal 时改由 ArrowLeft 承担，dir=rtl 再对调左右 |
| `Home` | focus in listbox | 焦点移到首个可停留条目 |
| `End` | focus in listbox | 焦点移到末个可停留条目 |
| `Enter` / `Space` | focus on item, selectionMode 为 single 或 extended | 只选中焦点条目，替换原有选中；条目自报禁用则不认 |
| `Space` / `Enter` / `Ctrl+Space` | focus on item, 可多选（multiple；extended 下须按住 Ctrl/Cmd） | 切换焦点条目的选中态，其余选中不动 |
| `Shift+ArrowDown` / `Shift+ArrowUp` | focus in listbox, 可多选 | 焦点移到相邻条目并切换它的选中态；反向移动即取消刚扩展进来的条目 |
| `Ctrl+A` / `Cmd+A` | focus in listbox, 可多选 | 选中全部可选条目；已经全选则把它们一并取消（禁用但已选中的不动） |
| `Enter` / `Space` | held in item / load-more-trigger, interactive | 按住期间该部件投影 data-pressed，与指针 :active 同一副按压面；抬起或失焦撤下；禁用、只读的条目与在途中的取下一页不进 |
| `单个可打印字符` | focus in listbox, typeahead 未关 | 连打检索把焦点移到首字母匹配的条目，不改选中值 |

### ARIA

以下属性由 `connect` 生成。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `content` | `aria-busy` | 'true' \| undefined |
| `content` | `aria-disabled` | 'true' \| 'false' |
| `content` | `aria-invalid` | 'true' \| 'false' |
| `content` | `aria-labelledby` | `label` 部件的 id |
| `content` | `aria-multiselectable` | 'true' \| 'false' |
| `content` | `aria-orientation` | props.orientation |
| `content` | `aria-readonly` | 'true' \| 'false' |
| `content` | `role` | 'listbox' |
| `item` | `aria-disabled` | 'true' \| 'false' |
| `item` | `aria-selected` | 'true' \| 'false' |
| `item` | `role` | 'option' |
| `item-prefix` | `aria-hidden` | 'true' |
| `item-indicator` | `aria-hidden` | 'true' |
| `group` | `aria-labelledby` | `group-label` 部件的 id |
| `group` | `role` | 'group' |

## 样式参考

### 皮肤

`@xihan-ui/styles/listbox.css` 使用 `[data-scope="listbox"][data-part="root"]` 部件选择器，位于 `xihan.components` 层。覆盖样式使用 `xihan.overrides`。

### 数据属性

由 `connect` 生成；条件不成立时不输出无值属性。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-disabled` | ''（条件成立时才出现） |
| `root` | `data-invalid` | ''（条件成立时才出现） |
| `root` | `data-loading` | ''（条件成立时才出现） |
| `root` | `data-orientation` | props.orientation |
| `root` | `data-readonly` | ''（条件成立时才出现） |
| `root` | `data-size` | props.size |
| `root` | `data-tone` | props.tone |
| `label` | `data-disabled` | ''（条件成立时才出现） |
| `content` | `data-disabled` | ''（条件成立时才出现） |
| `content` | `data-invalid` | ''（条件成立时才出现） |
| `content` | `data-orientation` | props.orientation |
| `content` | `data-readonly` | ''（条件成立时才出现） |
| `item` | `data-disabled` | ''（条件成立时才出现） |
| `item` | `data-highlighted` | ''（条件成立时才出现） |
| `item` | `data-pressed` | ''（条件成立时才出现） |
| `item` | `data-state` | 'checked' \| 'unchecked' |
| `item` | `data-tone` | metaOf.get(item.value)?.tone |
| `item` | `data-xh-collection-context` | 'page' |
| `item` | `data-xh-collection-item` | '' |
| `item` | `data-xh-collection-size` | props.size |
| `item-prefix` | `data-disabled` | ''（条件成立时才出现） |
| `item-prefix` | `data-highlighted` | ''（条件成立时才出现） |
| `item-prefix` | `data-state` | 'checked' \| 'unchecked' |
| `item-prefix` | `data-xh-collection-slot` | 'prefix' |
| `item-text` | `data-disabled` | ''（条件成立时才出现） |
| `item-text` | `data-highlighted` | ''（条件成立时才出现） |
| `item-text` | `data-state` | 'checked' \| 'unchecked' |
| `item-text` | `data-xh-collection-slot` | 'text' |
| `item-description` | `data-disabled` | ''（条件成立时才出现） |
| `item-description` | `data-highlighted` | ''（条件成立时才出现） |
| `item-description` | `data-state` | 'checked' \| 'unchecked' |
| `item-description` | `data-xh-collection-slot` | 'description' |
| `item-suffix` | `data-disabled` | ''（条件成立时才出现） |
| `item-suffix` | `data-highlighted` | ''（条件成立时才出现） |
| `item-suffix` | `data-state` | 'checked' \| 'unchecked' |
| `item-suffix` | `data-xh-collection-slot` | 'suffix' |
| `item-indicator` | `data-disabled` | ''（条件成立时才出现） |
| `item-indicator` | `data-highlighted` | ''（条件成立时才出现） |
| `item-indicator` | `data-state` | 'checked' \| 'unchecked' |
| `item-indicator` | `data-xh-collection-slot` | 'indicator' |
| `group` | `data-disabled` | ''（条件成立时才出现） |
| `group-label` | `data-disabled` | ''（条件成立时才出现） |
| `empty` | `data-disabled` | ''（条件成立时才出现） |
| `loading` | `data-disabled` | ''（条件成立时才出现） |
| `load-more-trigger` | `data-disabled` | ''（条件成立时才出现） |
| `load-more-trigger` | `data-loading` | ''（条件成立时才出现） |
| `load-more-trigger` | `data-pressed` | ''（条件成立时才出现） |
| `load-more-trigger` | `data-xh-action-control` | '' |
| `load-more-trigger` | `data-xh-action-display` | 'always' |
| `load-more-trigger` | `data-xh-action-profile` | 'row' |
| `load-more-trigger` | `data-xh-action-size` | props.size |
| `load-more-trigger` | `data-xh-action-variant` | 'ghost' |

<!-- xh-component-tokens:start -->
### CSS 变量

本组件公开覆盖槽由独立皮肤的实际消费位生成；默认来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 默认来源 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `--xh-listbox-content-bg` | `content` | `background` | `default` | `--xh-bg-surface` | listbox 的 content 部件 background 覆盖槽。 |
| `--xh-listbox-content-border` | `content` | `border` | `default` | `--xh-border-default` | listbox 的 content 部件 border 覆盖槽。 |
| `--xh-listbox-content-border-invalid` | `content` | `border-color` | `invalid` | `--xh-border-invalid` | listbox 的 content 部件 border-color 覆盖槽。 |
| `--xh-listbox-content-fg` | `content` | `color` | `default` | `--xh-fg-default` | listbox 的 content 部件 color 覆盖槽。 |
| `--xh-listbox-content-gap` | `content` | `gap` | `default` | `--xh-list-option-gap` | listbox 的 content 部件 gap 覆盖槽。 |
| `--xh-listbox-content-max-h` | `content` | `max-block-size` | `default` | `--xh-viewport-h-md` | listbox 的 content 部件 max-block-size 覆盖槽。 |
| `--xh-listbox-content-px` | `content` | `padding-inline` | `default` | `--xh-space-1` | listbox 的 content 部件 padding-inline 覆盖槽。 |
| `--xh-listbox-content-py` | `content` | `padding-block` | `default` | `--xh-space-1` | listbox 的 content 部件 padding-block 覆盖槽。 |
| `--xh-listbox-content-radius` | `content` | `border-radius` | `default` | `--xh-shape-surface` | listbox 的 content 部件 border-radius 覆盖槽。 |
| `--xh-listbox-empty-fg` | `empty` | `color` | `default` | `--xh-fg-subtle` | listbox 的 empty 部件 color 覆盖槽。 |
| `--xh-listbox-empty-font-size` | `empty` | `font-size` | `default` | `--xh-_listbox-font-size` | listbox 的 empty 部件 font-size 覆盖槽。 |
| `--xh-listbox-empty-px` | `empty` | `padding-inline` | `default` | `--xh-_listbox-item-px` | listbox 的 empty 部件 padding-inline 覆盖槽。 |
| `--xh-listbox-empty-py` | `empty` | `padding-block` | `default` | `--xh-space-3` | listbox 的 empty 部件 padding-block 覆盖槽。 |
| `--xh-listbox-gap` | `root` | `gap` | `default` | `--xh-space-2` | listbox 的 root 部件 gap 覆盖槽。 |
| `--xh-listbox-group-gap` | `group` | `gap` | `default` | `--xh-list-option-gap` | listbox 的 group 部件 gap 覆盖槽。 |
| `--xh-listbox-group-label-fg` | `group-label` | `color` | `default` | `--xh-fg-subtle` | listbox 的 group-label 部件 color 覆盖槽。 |
| `--xh-listbox-group-label-font-size` | `group-label` | `font-size` | `default` | `--xh-text-caption-size` | listbox 的 group-label 部件 font-size 覆盖槽。 |
| `--xh-listbox-group-label-font-weight` | `group-label` | `font-weight` | `default` | `--xh-font-weight-medium` | listbox 的 group-label 部件 font-weight 覆盖槽。 |
| `--xh-listbox-group-label-px` | `group-label` | `padding-inline` | `default` | `--xh-_listbox-item-px` | listbox 的 group-label 部件 padding-inline 覆盖槽。 |
| `--xh-listbox-group-label-py` | `group-label` | `padding-block` | `default` | `--xh-space-1` | listbox 的 group-label 部件 padding-block 覆盖槽。 |
| `--xh-listbox-group-spacing` | `content`<br>`group`<br>`item` | `margin-block-start` | `has([data-scope='listbox'][data-part='item']:not([hidden])`<br>`not([data-scope='listbox'][data-part='content'] [hidden] *)` | `--xh-space-1_5` | listbox 的 content、group、item 部件 margin-block-start 覆盖槽。 |
| `--xh-listbox-icon-size` | `item`<br>`root` | `--xh-icon-size` | `default`<br>`size=lg`<br>`size=sm` | `--xh-_collection-glyph-size`<br>`--xh-glyph-size-lg`<br>`--xh-glyph-size-md`<br>`--xh-glyph-size-sm` | listbox 的 item、root 部件 --xh-icon-size 覆盖槽。 |
| `--xh-listbox-item-bg-hover` | `item` | `background-color` | `disabled`<br>`error`<br>`highlighted`<br>`hover`<br>`is(:focus-visible, [data-highlighted])`<br>`not([aria-disabled='true'], [data-disabled], [aria-busy='true'], [data-error])` | `--xh-bg-subtle` | listbox 的 item 部件 background-color 覆盖槽。 |
| `--xh-listbox-item-bg-pressed` | `item` | `background-color` | `disabled`<br>`error`<br>`is(:active, [data-pressed])`<br>`not([aria-disabled='true'], [data-disabled], [aria-busy='true'], [data-error])`<br>`pressed` | `--xh-bg-subtle-hover` | listbox 的 item 部件 background-color 覆盖槽。 |
| `--xh-listbox-item-bg-selected` | `item` | `background-color` | `disabled`<br>`error`<br>`is([aria-selected='true'], [data-selected])`<br>`not([aria-disabled='true'], [data-disabled], [aria-busy='true'], [data-error])`<br>`selected`<br>`xh-collection-context=page` | `--xh-bg-brand-subtle` | listbox 的 item 部件 background-color 覆盖槽。 |
| `--xh-listbox-item-check-fg` | `item` | `color` | `disabled`<br>`error`<br>`highlighted`<br>`hover`<br>`is(:active, [data-pressed])`<br>`is(:focus-visible, [data-highlighted])`<br>`is([aria-selected='true'], [data-selected])`<br>`not([aria-disabled='true'], [data-disabled], [aria-busy='true'], [data-error])`<br>`pressed`<br>`selected`<br>`state=checked`<br>`xh-collection-context=page`<br>`xh-collection-slot=indicator` | `--xh-listbox-item-indicator-fg` | listbox 的 item 部件 color 覆盖槽。 |
| `--xh-listbox-item-fg` | `item` | `color` | `default`<br>`disabled`<br>`error`<br>`highlighted`<br>`hover`<br>`is(:active, [data-pressed])`<br>`is(:focus-visible, [data-highlighted])`<br>`not([aria-disabled='true'], [data-disabled], [aria-busy='true'], [data-error])`<br>`pressed` | `--xh-fg-default` | listbox 的 item 部件 color 覆盖槽。 |
| `--xh-listbox-item-fg-selected` | `item` | `color` | `disabled`<br>`error`<br>`highlighted`<br>`hover`<br>`is(:active, [data-pressed])`<br>`is(:focus-visible, [data-highlighted])`<br>`is([aria-selected='true'], [data-selected])`<br>`not([aria-disabled='true'], [data-disabled], [aria-busy='true'], [data-error])`<br>`pressed`<br>`selected`<br>`xh-collection-context=page` | `--xh-fg-on-brand-subtle` | listbox 的 item 部件 color 覆盖槽。 |
| `--xh-listbox-item-font-size` | `item` | `font-size` | `default` | `--xh-_listbox-font-size` | listbox 的 item 部件 font-size 覆盖槽。 |
| `--xh-listbox-item-font-weight-selected` | `item` | `font-weight` | `disabled`<br>`error`<br>`highlighted`<br>`hover`<br>`is(:active, [data-pressed])`<br>`is(:focus-visible, [data-highlighted])`<br>`is([aria-selected='true'], [data-selected])`<br>`not([aria-disabled='true'], [data-disabled], [aria-busy='true'], [data-error])`<br>`pressed`<br>`selected`<br>`xh-collection-context=page` | `--xh-font-weight-regular` | listbox 的 item 部件 font-weight 覆盖槽。 |
| `--xh-listbox-item-gap` | `item` | `margin-inline-end`<br>`margin-inline-start` | `xh-collection-context=page`<br>`xh-collection-slot=indicator`<br>`xh-collection-slot=prefix`<br>`xh-collection-slot=shortcut`<br>`xh-collection-slot=suffix` | `--xh-_listbox-gap` | listbox 的 item 部件 margin-inline-end、margin-inline-start 覆盖槽。 |
| `--xh-listbox-item-indicator-fg` | `item` | `color` | `disabled`<br>`error`<br>`highlighted`<br>`hover`<br>`is(:active, [data-pressed])`<br>`is(:focus-visible, [data-highlighted])`<br>`is([aria-selected='true'], [data-selected])`<br>`not([aria-disabled='true'], [data-disabled], [aria-busy='true'], [data-error])`<br>`pressed`<br>`selected`<br>`state=checked`<br>`xh-collection-context=page`<br>`xh-collection-slot=indicator` | `--xh-_listbox-accent` | listbox 的 item 部件 color 覆盖槽。 |
| `--xh-listbox-item-indicator-size` | `item-indicator` | `--xh-icon-size`<br>`block-size`<br>`inline-size` | `default` | `--xh-control-indicator-size` | listbox 的 item-indicator 部件 --xh-icon-size、block-size、inline-size 覆盖槽。 |
| `--xh-listbox-item-leading` | `item` | `line-height` | `default` | `--xh-leading-normal` | listbox 的 item 部件 line-height 覆盖槽。 |
| `--xh-listbox-item-px` | `item` | `padding-inline` | `default` | `--xh-_listbox-item-px` | listbox 的 item 部件 padding-inline 覆盖槽。 |
| `--xh-listbox-item-py` | `item` | `padding-block` | `default` | `--xh-_listbox-item-py` | listbox 的 item 部件 padding-block 覆盖槽。 |
| `--xh-listbox-item-radius` | `item` | `border-radius` | `default` | `--xh-shape-control` | listbox 的 item 部件 border-radius 覆盖槽。 |
| `--xh-listbox-label-fg` | `label` | `color` | `default` | `--xh-fg-muted` | listbox 的 label 部件 color 覆盖槽。 |
| `--xh-listbox-label-font-size` | `label` | `font-size` | `default` | `--xh-text-label-size` | listbox 的 label 部件 font-size 覆盖槽。 |
| `--xh-listbox-label-font-weight` | `label` | `font-weight` | `default` | `--xh-text-label-weight` | listbox 的 label 部件 font-weight 覆盖槽。 |
| `--xh-listbox-load-more-trigger-bg-hover` | `load-more-trigger` | `background-color` | `disabled`<br>`hover`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])` | `--xh-_action-variant-bg-hover` | listbox 的 load-more-trigger 部件 background-color 覆盖槽。 |
| `--xh-listbox-load-more-trigger-fg` | `load-more-trigger` | `color` | `default`<br>`disabled`<br>`hover`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-_tone-fg` | listbox 的 load-more-trigger 部件 color 覆盖槽。 |
| `--xh-listbox-load-more-trigger-font-size` | `load-more-trigger` | `font-size` | `default` | `--xh-_listbox-font-size` | listbox 的 load-more-trigger 部件 font-size 覆盖槽。 |
| `--xh-listbox-load-more-trigger-gap` | `load-more-trigger` | `gap` | `default` | `--xh-_listbox-gap` | listbox 的 load-more-trigger 部件 gap 覆盖槽。 |
| `--xh-listbox-load-more-trigger-px` | `load-more-trigger` | `padding-inline` | `default` | `--xh-_listbox-item-px` | listbox 的 load-more-trigger 部件 padding-inline 覆盖槽。 |
| `--xh-listbox-load-more-trigger-py` | `load-more-trigger` | `padding-block` | `xh-action-profile=row` | `--xh-_listbox-item-py` | listbox 的 load-more-trigger 部件 padding-block 覆盖槽。 |
| `--xh-listbox-load-more-trigger-radius` | `load-more-trigger` | `border-radius` | `default` | `--xh-shape-control` | listbox 的 load-more-trigger 部件 border-radius 覆盖槽。 |
| `--xh-listbox-loading-fg` | `loading` | `color` | `default` | `--xh-fg-subtle` | listbox 的 loading 部件 color 覆盖槽。 |
| `--xh-listbox-loading-font-size` | `loading` | `font-size` | `default` | `--xh-_listbox-font-size` | listbox 的 loading 部件 font-size 覆盖槽。 |
| `--xh-listbox-loading-px` | `loading` | `padding-inline` | `default` | `--xh-_listbox-item-px` | listbox 的 loading 部件 padding-inline 覆盖槽。 |
| `--xh-listbox-loading-py` | `loading` | `padding-block` | `default` | `--xh-space-3` | listbox 的 loading 部件 padding-block 覆盖槽。 |
<!-- xh-component-tokens:end -->

### 动效

本组件皮肤不含过渡与关键帧，也没有脚本驱动的动效：状态一变，外观立即到位。

### RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像。
