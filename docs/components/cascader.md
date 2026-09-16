# Cascader 级联选择 <Badge type="info" text="alpha" />

用于从多层分类中选择完整路径。

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/cascader" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/cascader.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/cascader" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/cascader" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/cascader.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## 用法

按层级选择完整地区路径

<XhDemo src="cascader/01-basic" />

## 组件结构

加粗的是必需部件。

`data-scope="cascader"`：`root` · `hidden-input` · `label` · `control` · **`trigger`** · `value-text` · `indicator` · `clear-trigger` · `positioner` · **`content`** · `input` · `search-list` · `search-item` · `column` · `group` · `group-label` · `item` · `item-text` · `item-indicator` · `empty` · `loading` · `footer`

## 示例

### 多选

选择多个分类路径

<XhDemo src="cascader/02-multiple" />

### 校验状态

清晰标记必填错误

<XhDemo src="cascader/03-invalid" />

### 懒加载

展开分支时加载下一层数据

<XhDemo src="cascader/04-lazy-load" />

### 搜索

按完整路径筛选选项

<XhDemo src="cascader/05-search" />

## 设计指引

### 何时使用

- 选项具有稳定的多层结构，如地区或商品类目。
- 用户需要逐层缩小选择范围。

### 何时不用

- 不规则层级使用[树选择](./tree-select)。
- 单层选项使用[选择器](./select)。
- 主要通过关键词查找时使用[组合框](./combobox)。

### 特性

- `changeOnSelect` 允许选择中间层。
- `expandTrigger` 支持点击或悬停展开。
- `multiple`、`cascade` 与 `checkedStrategy` 控制多选及路径收敛方式。
- `searchable` 按完整路径筛选选项。
- 支持按需加载、空状态、加载状态与原生表单提交。
- 选中项使用末端标记，半选项使用横线。

### 组合

- 使用 `label`、`control` 与 `value-text` 组成字段外壳。
- 使用 `column`、`item` 与 `item-indicator` 组成分级列表。

### 最佳实践

- 层级建议控制在三层以内。
- 回显完整路径，避免同名末级选项产生歧义。
- 自定义条目时保留 `item-text` 与 `item-indicator`。

### 反模式

- 不要在异步加载时隐藏已有列。
- 多选时明确约定 `checkedStrategy`。

## API 参考

### 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-cascader>` |
| Vue 组件 | `XhCascaderClearTrigger` `XhCascaderColumn` `XhCascaderContent` `XhCascaderControl` `XhCascaderFooter` `XhCascaderGroup` `XhCascaderGroupLabel` `XhCascaderIndicator` `XhCascaderInput` `XhCascaderItem` `XhCascaderItemIndicator` `XhCascaderItemText` `XhCascaderLabel` `XhCascaderLoading` `XhCascaderPositioner` `XhCascaderRoot` `XhCascaderSearchList` `XhCascaderTrigger` `XhCascaderValueText` |
| 组合式函数 | `useCascader` |
| 状态机 | `cascaderMachine` |
| 皮肤 | `@xihan-ui/styles/cascader.css` |

### Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `collection` | `CascaderNode[]` |  | 树数据，层级元信息与显示文本的唯一事实源。默认为空树。 |
| `value` | `CascaderValue` |  | 选中路径。提供即受控：cell 直读 prop，写入只发 onValueChange 不落内部值。 单条路径是简写，内部一律归一为路径集合。 |
| `defaultValue` | `CascaderValue` |  |  |
| `name` | `string` |  | 原生字段名，每条选中路径提交一项 JSON 字符串数组。 |
| `form` | `string` |  | 关联的原生表单 ID；指定后覆盖祖先表单归属。 |
| `open` | `boolean` |  | 展开态。提供即受控：内部不再自行修改，只发 onOpenChange。 |
| `defaultOpen` | `boolean` |  |  |
| `expandTrigger` | `CascaderExpandTrigger` |  | 子列的展开方式，默认 click。 |
| `changeOnSelect` | `boolean` |  | 中间层（分支）也可以落值。关闭时点击分支只展开子列，不改变选中值。 |
| `multiple` | `boolean` |  | 多选：选中为路径集合，选中后浮层不收起、焦点留在列中以便继续选择。 |
| `searchable` | `boolean` |  | 开启搜索：input 部件可用，输入后整条路径连缀过滤、候选替换列视图。 |
| `cascade` | `boolean` |  | 多选下父子级联勾选：点击分支整枝传导、子全勾父勾、部分勾选半选， 禁用子树整棵冻结。默认 false（按路径原样切换）；单选下无效。 |
| `checkedStrategy` | `CascadeStrategy` |  | 级联下对外值的收敛策略，默认 child（只收叶）；parent = 最高整枝，all = 全部勾选节点。 |
| `disabled` | `boolean` |  | 整个控件禁用：trigger 使用原生 disabled，浮层不可展开。 |
| `readOnly` | `boolean` |  | 只读：浮层照常展开与浏览，但选中值不可修改、也不可清空。 |
| `invalid` | `boolean` |  | 校验失败：trigger 报告 aria-invalid，各角色节点带 data-invalid。 |
| `loading` | `boolean` |  | 候选加载中：浮层报告 aria-busy；当前视图无候选时显示在途占位。 |
| `translations` | `Partial<CascaderTranslations>` |  | 空态占位的文案覆盖，默认英文。 |
| `variant` | `ControlVariant` |  | 形态：outline / subtle / ghost，决定触发框的描边与底色使用方式。默认 outline。 |
| `tone` | `Tone` |  | 语气：brand / neutral / success / warning / danger / info，决定聚焦与选中使用哪族颜色。 |
| `size` | `Size` |  | 尺寸：sm / md / lg，决定触发框与条目的几何档位。 |
| `placeholder` | `string` |  | 无选中时 value-text 显示的占位文字。 |
| `separator` | `string` |  | 路径回显的连接符，默认 ' / '。 |
| `placement` | `Placement` |  |  |
| `offset` | `number` |  |  |
| `loop` | `boolean` |  | 列内上下键到达首尾是否回绕，默认 true。 |
| `dir` | `Direction` |  | 文字方向，默认 ltr；只对调左右方向键的进入子列 / 返回上一列语义。 |
| `onValueChange` | `(details: CascaderValueChangeDetails) => void` |  | value 变化意图回调；受控时是唯一出口，非受控时随内部写入一并通知。 |
| `onOpenChange` | `(details: CascaderOpenChangeDetails) => void` |  | open 变化意图回调；受控时是唯一出口，非受控时随内部转移一并通知。 |

### 事件

自定义元素将载荷放在 `detail`；Vue 使用同名 emit。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `value-change` | `CascaderValueChangeDetails` | 选中路径集合变化；detail 为 `{ value: string[][] }` |
| `open-change` | `CascaderOpenChangeDetails` | open 状态变化；detail 为 `{ open: boolean }` |

### 插槽

仅列出带载荷的插槽。

| Vue 组件 | 插槽 | 载荷 | 说明 |
| --- | --- | --- | --- |
| `XhCascaderRoot` | `default` | `CascaderRootSlotProps` |  |
| `XhCascaderSearchList` | `item` | `CascaderSearchListItemSlotProps` |  |

### 状态

公开状态写入 `data-state`。

| 部件 | 取值 |
| --- | --- |
| `root` | 'open' \| 'closed' |
| `control` | 'open' \| 'closed' |
| `trigger` | 'open' \| 'closed' |
| `indicator` | 'open' \| 'closed' |
| `positioner` | 'open' \| 'closed' |
| `content` | 'open' \| 'closed' |
| `search-item` | 'checked' \| 'indeterminate' \| 'unchecked' |
| `column` | 'open' \| 'closed' |
| `footer` | 'open' \| 'closed' |

以下名称仅用于内部状态机。

**状态**：`open` · `closed`

**事件**：`FORM.RESET` · `OPEN` · `TOGGLE` · `CLOSE` · `CONTROLLED.OPEN` · `CONTROLLED.CLOSE` · `ITEM.FOCUS` · `ITEM.EXPAND` · `ITEM.LOST` · `ITEM.SELECT` · `VALUE.SET` · `VALUE.CLEAR` · `PATH.SET` · `INPUT.CHANGE` · `SEARCH.HIGHLIGHT`

**判据**：`isOpenControlled` · `isMultiple` · `staysOpenOnSelect`

### connect API

`getXxxProps()` 返回对应部件的宿主属性。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `open` | `boolean` |  |
| `collection` | `readonly CascaderNode[]` | 作者提供的原始树数据。 |
| `columns` | `readonly CascaderColumn[]` | 当前并排打开的列（含每列的条目）：列数 = 展开路径可走通的段数 + 1。 |
| `levels` | `readonly CascaderLevel[]` | 按深度展开的静态列，与展开路径无关；不应显示的条目由连接层加 hidden 收起。 |
| `value` | `string[][]` | 选中路径集合；单选下长度 ≤ 1，形状不随模式变化。 |
| `valuePath` | `string[] \| null` | 单选便利读法：选中的路径，无选中时为 null。 |
| `valueText` | `string \| null` | 选中路径的显示文字（整条路径用分隔符连接；多选各条之间用逗号）；无选中时为 null。 |
| `displayText` | `string` | value-text 实际显示的文字：有选中时取路径文本，否则取 placeholder。 |
| `activePath` | `string[]` | 展开路径：并排打开哪几列由它决定。 |
| `focusedPath` | `string[] \| null` | 焦点锚点；收起、或它已不在任何可见列中时为 null。 |
| `multiple` | `boolean` |  |
| `disabled` | `boolean` |  |
| `readOnly` | `boolean` |  |
| `invalid` | `boolean` |  |
| `canClear` | `boolean` | 清空按钮当前是否可按。 |
| `isSelected` | `(value: string) => boolean` | 该条目是否为某条选中路径的末项。 |
| `isIndeterminate` | `(value: string) => boolean` | 级联模式下该分支是否半选（有效叶后代部分勾选）；非级联恒为 false。 |
| `isActive` | `(value: string) => boolean` | 该条目是否落在展开路径上（它的子列已打开，或它自身即为最后一站）。 |
| `isVisible` | `(value: string) => boolean` | 该条目当前是否落在某个可见列中。 |
| `searching` | `boolean` | 正处于搜索视图（开启 searchable 且输入非空）：列视图让位给候选列表。 |
| `inputValue` | `string` | 搜索框中的原始串。 |
| `searchResults` | `readonly CascaderSearchResult[]` | 过滤后的候选：整条路径连缀匹配，带 pathKey 与禁用标记。 |
| `searchHighlightIndex` | `number` | 候选中的虚拟高亮下标，恒落在一条可选候选上；没有候选或整批禁用时为 -1。 |
| `translations` | `CascaderTranslations` | 空态占位的文案：实例覆盖并入默认后的完整一份。 |
| `setInputValue` | `(next: string) => void` |  |
| `setOpen` | `(next: boolean) => void` |  |
| `setValue` | `(next: string[][]) => void` |  |
| `setActivePath` | `(next: string[]) => void` |  |
| `select` | `(path: string[]) => void` | 选中一条路径，与点击条目同一语义（分支是否落值仍取决于 changeOnSelect）。 |
| `clear` | `() => void` |  |
| `getRootProps` | `() => T['element']` |  |
| `getHiddenInputProps` | `(props: { path: readonly string[] }) => T['input']` | 每条路径独立编码，适配器按 value 渲染重复同名字段。 |
| `getLabelProps` | `() => T['element']` |  |
| `getControlProps` | `() => T['element']` |  |
| `getTriggerProps` | `() => T['button']` |  |
| `getValueTextProps` | `() => T['element']` |  |
| `getIndicatorProps` | `() => T['element']` |  |
| `getClearTriggerProps` | `() => T['button']` |  |
| `getPositionerProps` | `() => T['element']` |  |
| `getContentProps` | `() => T['element']` |  |
| `getInputProps` | `() => T['input']` | 搜索框：放在 content 顶部；输入即过滤，上下键移动候选、Enter 选中、Escape 先清除输入。 |
| `getSearchListProps` | `() => T['element']` | 候选列表容器；不在搜索视图时带 hidden。 |
| `getSearchItemProps` | `(props: CascaderSearchItemProps) => T['element']` | 一条候选：身份是整条路径；点击选中（与点击列内条目同一语义）。 |
| `getEmptyProps` | `() => T['element']` | 空态占位：当前视图没有条目（搜索无候选，或根列没有条目）时显示，其余时候带 hidden。 |
| `getLoadingProps` | `() => T['element']` | 在途占位：当前视图无候选且正在取数时显示；已有候选或祖先列时只保留 aria-busy。 适配器自动提供默认部件，作者显式编写部件即可替换它。 |
| `getFooterProps` | `() => T['element']` | 浮层底部的操作区：放在 content 中、与列并列，不进入任何一列的拥有关系，方向键也无法到达。 |
| `getGroupProps` | `(props: CascaderGroupProps) => T['element']` | 分组容器：role=group，条目挂在其中；分组标题经 aria-labelledby 关联。 |
| `getGroupLabelProps` | `(props: CascaderGroupProps) => T['element']` | 分组标题：不是条目、不进入导航，只作为本组的可及名。 |
| `getColumnProps` | `(props: CascaderColumnProps) => T['element']` |  |
| `getItemProps` | `(props: CascaderItemProps) => T['element']` |  |
| `getItemTextProps` | `(props: CascaderItemProps) => T['element']` |  |
| `getItemIndicatorProps` | `(props: CascaderItemProps) => T['element']` |  |

## 无障碍

### 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/#keyboardinteraction)

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `Enter` / `Space` | closed, focus in trigger | 展开浮层并把焦点落到选中路径的末项（无选中或它已禁用则落该列首个可用条目） |
| `ArrowDown` | closed, focus in trigger | 展开浮层并把焦点落到选中条目在它那一列里的下一个可用条目 |
| `ArrowUp` | closed, focus in trigger | 展开浮层并把焦点落到选中条目在它那一列里的上一个可用条目 |
| `Delete` | focus in trigger, 有值且未禁用、未只读 | 清空全部选中值，浮层不展开、焦点留在 trigger |
| `Backspace` | focus in trigger, 有值且未禁用、未只读 | 单选清空；多选去掉最后一个选中路径 |
| `ArrowDown` | open, focus in content | 焦点移到当前列的下一个条目（禁用条目跳过；loop 默认开，末项回绕到首项）；别的列不动 |
| `ArrowUp` | open, focus in content | 焦点移到当前列的上一个条目（禁用条目跳过；loop 默认开，首项回绕到末项） |
| `Home` | open, focus in content | 焦点移到当前列的首个可用条目 |
| `End` | open, focus in content | 焦点移到当前列的末个可用条目 |
| `ArrowRight` | open, 焦点条目有子节点（dir=rtl 时改由 ArrowLeft 承担） | 子列没开时先把它铺出来（焦点不动），已开时焦点移进它的首个可用条目；叶子上什么都不做且不吞键 |
| `ArrowLeft` | open, 焦点不在根列（dir=rtl 时改由 ArrowRight 承担） | 焦点退回上一列的父条目，当前这一列随之收起；根列上什么都不做且不吞键 |
| `Enter` / `Space` | open, 焦点条目未禁用 | 叶子：落值并收起浮层、焦点归还 trigger。分支：展开它的子列且浮层不收起，changeOnSelect 打开时同时落值 |
| `Escape` | open | 收起浮层并把焦点归还 trigger，选中值不变 |
| `Tab` / `Shift+Tab` | open | 收起浮层，焦点不归还 trigger，按 Tab 序列自然离开 |
| `可打印字符` | open, focus in input, searchable | 改写检索词；trim 后非空即把列视图整个换成候选列表（整条路径连缀匹配），高亮落到首个可选候选 |
| `ArrowDown` | open, focus in input, 检索词非空 | 高亮移到下一个候选（禁用整条的候选跳过；loop 默认开，末条回绕到首条），焦点留在检索框 |
| `ArrowUp` | open, focus in input, 检索词非空 | 高亮移到上一个候选（禁用整条的候选跳过；loop 默认开，首条回绕到末条），焦点留在检索框 |
| `Home` | open, focus in input, 检索词非空 | 高亮移到首个可选候选；检索词为空时不接管，光标照常跳到行首 |
| `End` | open, focus in input, 检索词非空 | 高亮移到末个可选候选；检索词为空时不接管，光标照常跳到行尾 |
| `Enter` | open, focus in input, 有高亮候选 | 把整条候选路径落成选中值：单选收起浮层、焦点归还 trigger，多选并入集合且浮层不收起；两种都清掉检索词回列视图。无可选候选时不吞这个键 |
| `Escape` | open, focus in input, 检索词非空 | 清掉检索词回到列视图，浮层不收起、焦点留在检索框；检索词已空才轮到收浮层那一档 |
| `ArrowDown` / `ArrowUp` | open, focus in input, 检索词为空 | 把焦点交给列视图：有锚点条目就落回它，没有则 ArrowDown 进当前列首个可用条目、ArrowUp 进末个 |
| `ArrowLeft` / `ArrowRight` | open, focus in input | 不接管，留给检索框自己移光标；进子列 / 回上一列那一套只在焦点落在条目上时发生 |
| `Tab` / `Shift+Tab` | open, focus in input | 收起浮层，焦点不归还 trigger，按 Tab 序列自然离开 |
| `输入法组合期间的任意键` | open, focus in input, isComposing | 一律不接管：组合期的 Enter 与上下键属于输入法候选框，既不选中候选也不移高亮 |

### ARIA

以下属性由 `connect` 生成。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `trigger` | `aria-controls` | `content` 部件的 id |
| `trigger` | `aria-expanded` | 'true' \| 'false' |
| `trigger` | `aria-haspopup` | 'listbox' |
| `trigger` | `aria-invalid` | 'true' \| 'false' |
| `trigger` | `aria-labelledby` | `label` 部件的 id `value-text` 部件的 id |
| `trigger` | `aria-readonly` | 'true' \| 'false' |
| `trigger` | `role` | 'combobox' |
| `indicator` | `aria-hidden` | 'true' |
| `clear-trigger` | `aria-label` | translations.clearTrigger |
| `content` | `aria-busy` | 'true' \| undefined |
| `content` | `aria-hidden` | !open \|\| undefined |
| `input` | `aria-activedescendant` | `search-item` 部件的 id \| undefined |
| `input` | `aria-autocomplete` | 'list' |
| `input` | `aria-controls` | `search-list` 部件的 id |
| `input` | `aria-label` | translations.searchInput |
| `search-list` | `aria-label` | translations.searchList |
| `search-list` | `aria-multiselectable` | 'true' \| 'false' |
| `search-list` | `role` | 'listbox' |
| `search-item` | `aria-checked` | 'true' \| 'mixed' \| 'false' \| undefined |
| `search-item` | `aria-disabled` | 'true' \| 'false' |
| `search-item` | `aria-selected` | 'true' \| 'false' |
| `search-item` | `role` | 'option' |
| `column` | `aria-disabled` | 'true' \| 'false' |
| `column` | `aria-label` | translations.column \| undefined |
| `column` | `aria-labelledby` | `label` 部件的 id `value-text` 部件的 id \| `item` 部件的 id |
| `column` | `aria-multiselectable` | 'true' \| 'false' |
| `column` | `aria-orientation` | 'vertical' |
| `column` | `role` | 'listbox' |
| `group` | `aria-labelledby` | `group-label` 部件的 id |
| `group` | `role` | 'group' |
| `item` | `aria-checked` | 'true' \| 'mixed' \| 'false' \| undefined |
| `item` | `aria-disabled` | 'true' \| 'false' |
| `item` | `aria-haspopup` | 'listbox' \| undefined |
| `item` | `aria-selected` | 'true' \| 'false' |
| `item` | `role` | 'option' |
| `item-indicator` | `aria-hidden` | 'true' |
| `empty` | `role` | 'status' |
| `loading` | `role` | 'status' |

## 样式参考

### 皮肤

`@xihan-ui/styles/cascader.css` 使用 `[data-scope="cascader"][data-part="root"]` 部件选择器，位于 `xihan.components` 与 `xihan.motion` 层。覆盖样式使用 `xihan.overrides`。

`forced-colors: active` 下另有一套规则：颜色交给系统，边框与状态标记改用系统色关键字。

### 数据属性

由 `connect` 生成；条件不成立时不输出无值属性。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-disabled` | ''（条件成立时才出现） |
| `root` | `data-invalid` | ''（条件成立时才出现） |
| `root` | `data-loading` | ''（条件成立时才出现） |
| `root` | `data-readonly` | ''（条件成立时才出现） |
| `root` | `data-size` | props.size |
| `root` | `data-state` | 'open' \| 'closed' |
| `root` | `data-tone` | props.tone |
| `root` | `data-variant` | props.variant |
| `label` | `data-disabled` | ''（条件成立时才出现） |
| `control` | `data-disabled` | ''（条件成立时才出现） |
| `control` | `data-invalid` | ''（条件成立时才出现） |
| `control` | `data-readonly` | ''（条件成立时才出现） |
| `control` | `data-state` | 'open' \| 'closed' |
| `control` | `data-variant` | props.variant |
| `control` | `data-xh-field-chrome` | '' |
| `control` | `data-xh-field-size` | props.size |
| `trigger` | `data-disabled` | ''（条件成立时才出现） |
| `trigger` | `data-invalid` | ''（条件成立时才出现） |
| `trigger` | `data-placeholder` | ''（条件成立时才出现） |
| `trigger` | `data-readonly` | ''（条件成立时才出现） |
| `trigger` | `data-state` | 'open' \| 'closed' |
| `value-text` | `data-disabled` | ''（条件成立时才出现） |
| `value-text` | `data-placeholder` | ''（条件成立时才出现） |
| `indicator` | `data-clearable` | ''（条件成立时才出现） |
| `indicator` | `data-disabled` | ''（条件成立时才出现） |
| `indicator` | `data-state` | 'open' \| 'closed' |
| `clear-trigger` | `data-xh-action-control` | '' |
| `clear-trigger` | `data-xh-action-display` | 'has-value' |
| `clear-trigger` | `data-xh-action-has-value` | ''（条件成立时才出现） |
| `clear-trigger` | `data-xh-action-profile` | 'field-inset' |
| `clear-trigger` | `data-xh-action-size` | props.size |
| `clear-trigger` | `data-xh-action-variant` | 'ghost' |
| `positioner` | `data-hidden` | ''（条件成立时才出现） |
| `positioner` | `data-placement` | 定位引擎算出的实际落位 |
| `positioner` | `data-positioned` | ''（条件成立时才出现） |
| `positioner` | `data-size` | props.size |
| `positioner` | `data-state` | 'open' \| 'closed' |
| `positioner` | `data-tone` | props.tone |
| `positioner` | `data-variant` | props.variant |
| `content` | `data-empty` | ''（条件成立时才出现） |
| `content` | `data-placement` | 定位引擎算出的实际落位 |
| `content` | `data-searching` | ''（条件成立时才出现） |
| `content` | `data-state` | 'open' \| 'closed' |
| `search-list` | `data-empty` | ''（条件成立时才出现） |
| `search-item` | `data-disabled` | ''（条件成立时才出现） |
| `search-item` | `data-highlighted` | ''（条件成立时才出现） |
| `search-item` | `data-state` | 'checked' \| 'indeterminate' \| 'unchecked' |
| `search-item` | `data-xh-collection-context` | 'overlay' |
| `search-item` | `data-xh-collection-item` | '' |
| `search-item` | `data-xh-collection-size` | props.size |
| `column` | `data-level` | String(column.level) |
| `column` | `data-state` | 'open' \| 'closed' |
| `group` | `data-disabled` | ''（条件成立时才出现） |
| `group-label` | `data-disabled` | ''（条件成立时才出现） |
| `item` | `data-branch` | ''（条件成立时才出现） |
| `item` | `data-level` | String(meta.level) \| undefined |
| `item` | `data-xh-collection-context` | 'overlay' |
| `item` | `data-xh-collection-item` | '' |
| `item` | `data-xh-collection-size` | props.size |
| `item-text` | `data-xh-collection-slot` | 'text' |
| `item-indicator` | `data-xh-collection-slot` | 'indicator' |
| `footer` | `data-state` | 'open' \| 'closed' |

<!-- xh-component-tokens:start -->
### CSS 变量

本组件公开覆盖槽由独立皮肤的实际消费位生成；默认来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 默认来源 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `--xh-cascader-action-bg` | `clear-trigger` | `background-color` | `default` | `--xh-_action-variant-bg-rest` | cascader 的 clear-trigger 部件 background-color 覆盖槽。 |
| `--xh-cascader-action-bg-active` | `clear-trigger` | `background-color` | `disabled`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-_action-variant-bg-pressed` | cascader 的 clear-trigger 部件 background-color 覆盖槽。 |
| `--xh-cascader-action-bg-hover` | `clear-trigger` | `background-color` | `disabled`<br>`hover`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])` | `--xh-_action-variant-bg-hover` | cascader 的 clear-trigger 部件 background-color 覆盖槽。 |
| `--xh-cascader-action-fg` | `clear-trigger` | `color` | `default` | `--xh-fg-muted` | cascader 的 clear-trigger 部件 color 覆盖槽。 |
| `--xh-cascader-action-fg-hover` | `clear-trigger` | `color` | `disabled`<br>`hover`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])` | `--xh-fg-default` | cascader 的 clear-trigger 部件 color 覆盖槽。 |
| `--xh-cascader-action-font-size` | `clear-trigger` | `font-size` | `default` | `--xh-text-secondary-size` | cascader 的 clear-trigger 部件 font-size 覆盖槽。 |
| `--xh-cascader-action-radius` | `clear-trigger` | `border-radius` | `default` | `--xh-shape-inset` | cascader 的 clear-trigger 部件 border-radius 覆盖槽。 |
| `--xh-cascader-action-size` | `clear-trigger` | `block-size`<br>`inline-size`<br>`min-inline-size` | `default`<br>`xh-action-profile=field-inset` | `--xh-_action-profile-visual-size` | cascader 的 clear-trigger 部件 block-size、inline-size、min-inline-size 覆盖槽。 |
| `--xh-cascader-branch-arrow-fg` | `item` | `background-color` | `branch` | `--xh-fg-subtle` | cascader 的 item 部件 background-color 覆盖槽。 |
| `--xh-cascader-branch-arrow-size` | `item` | `block-size`<br>`inline-size` | `branch` | `--xh-icon-size` | cascader 的 item 部件 block-size、inline-size 覆盖槽。 |
| `--xh-cascader-column-divider` | `column` | `border-inline-start` | `default` | `--xh-material-frosted-separator` | cascader 的 column 部件 border-inline-start 覆盖槽。 |
| `--xh-cascader-column-gap` | `column` | `gap` | `default` | `--xh-list-option-gap` | cascader 的 column 部件 gap 覆盖槽。 |
| `--xh-cascader-column-h` | `column`<br>`search-list` | `block-size` | `default` | `--xh-viewport-h-sm` | cascader 的 column、search-list 部件 block-size 覆盖槽。 |
| `--xh-cascader-column-min-w` | `column`<br>`empty`<br>`loading` | `min-inline-size` | `default` | `7rem` | cascader 的 column、empty、loading 部件 min-inline-size 覆盖槽。 |
| `--xh-cascader-column-px` | `column` | `padding-inline` | `default` | `--xh-space-1` | cascader 的 column 部件 padding-inline 覆盖槽。 |
| `--xh-cascader-column-py` | `column` | `padding-block` | `default` | `--xh-space-1` | cascader 的 column 部件 padding-block 覆盖槽。 |
| `--xh-cascader-content-backdrop` | `content` | `-webkit-backdrop-filter`<br>`backdrop-filter` | `default` | `--xh-material-frosted-backdrop` | cascader 的 content 部件 -webkit-backdrop-filter、backdrop-filter 覆盖槽。 |
| `--xh-cascader-content-bg` | `content` | `background` | `default` | `--xh-material-frosted-bg` | cascader 的 content 部件 background 覆盖槽。 |
| `--xh-cascader-content-border` | `content` | `border` | `default` | `--xh-material-frosted-border` | cascader 的 content 部件 border 覆盖槽。 |
| `--xh-cascader-content-fg` | `content` | `color` | `default` | `--xh-material-frosted-fg` | cascader 的 content 部件 color 覆盖槽。 |
| `--xh-cascader-content-highlight` | `content` | `background` | `default` | `--xh-material-frosted-highlight` | cascader 的 content 部件 background 覆盖槽。 |
| `--xh-cascader-content-max-w` | `content` | `max-inline-size` | `default` | `--xh-overlay-max-w-xl` | cascader 的 content 部件 max-inline-size 覆盖槽。 |
| `--xh-cascader-content-radius` | `content` | `border-radius` | `default` | `--xh-shape-overlay` | cascader 的 content 部件 border-radius 覆盖槽。 |
| `--xh-cascader-content-shadow` | `content` | `box-shadow` | `default` | `--xh-material-frosted-shadow` | cascader 的 content 部件 box-shadow 覆盖槽。 |
| `--xh-cascader-control-bg` | `control` | `background-color` | `xh-field-chrome` | `--xh-_field-variant-bg-rest` | cascader 的 control 部件 background-color 覆盖槽。 |
| `--xh-cascader-control-bg-disabled` | `control` | `background-color` | `disabled`<br>`xh-field-chrome` | `--xh-_field-variant-bg-disabled` | cascader 的 control 部件 background-color 覆盖槽。 |
| `--xh-cascader-control-bg-hover` | `control` | `background-color` | `disabled`<br>`hover`<br>`invalid`<br>`loading`<br>`not([data-disabled])`<br>`not([data-invalid])`<br>`not([data-loading])`<br>`not([data-readonly])`<br>`readonly`<br>`xh-field-chrome` | `--xh-_field-variant-bg-hover` | cascader 的 control 部件 background-color 覆盖槽。 |
| `--xh-cascader-control-bg-readonly` | `control` | `background-color` | `readonly`<br>`xh-field-chrome` | `--xh-_field-variant-bg-read-only` | cascader 的 control 部件 background-color 覆盖槽。 |
| `--xh-cascader-control-border` | `control` | `border` | `xh-field-chrome` | `--xh-_field-variant-border-rest` | cascader 的 control 部件 border 覆盖槽。 |
| `--xh-cascader-control-border-focus` | `control` | `border-color` | `disabled`<br>`focus-within`<br>`not([data-disabled])`<br>`xh-field-chrome` | `--xh-_field-variant-border-focus` | cascader 的 control 部件 border-color 覆盖槽。 |
| `--xh-cascader-control-border-hover` | `control` | `border-color` | `disabled`<br>`hover`<br>`invalid`<br>`loading`<br>`not([data-disabled])`<br>`not([data-invalid])`<br>`not([data-loading])`<br>`not([data-readonly])`<br>`readonly`<br>`xh-field-chrome` | `--xh-_field-variant-border-hover` | cascader 的 control 部件 border-color 覆盖槽。 |
| `--xh-cascader-control-border-invalid` | `control` | `border-color` | `invalid`<br>`xh-field-chrome` | `--xh-_field-variant-border-invalid` | cascader 的 control 部件 border-color 覆盖槽。 |
| `--xh-cascader-control-fg` | `control` | `color` | `xh-field-chrome` | `--xh-fg-default` | cascader 的 control 部件 color 覆盖槽。 |
| `--xh-cascader-control-gap` | `control` | `gap` | `xh-field-chrome` | `--xh-_cascader-gap` | cascader 的 control 部件 gap 覆盖槽。 |
| `--xh-cascader-control-h` | `control` | `block-size`<br>`min-block-size` | `has([data-xh-field-input][data-xh-field-layout='multi-tag'])`<br>`has([data-xh-field-input][data-xh-field-layout='single-line'])`<br>`has([data-xh-field-input][data-xh-field-layout='textarea'])`<br>`xh-field-chrome`<br>`xh-field-input`<br>`xh-field-layout=multi-tag`<br>`xh-field-layout=single-line`<br>`xh-field-layout=textarea` | `--xh-_cascader-h` | cascader 的 control 部件 block-size、min-block-size 覆盖槽。 |
| `--xh-cascader-control-min-w` | `control`<br>`root` | `min-inline-size` | `default`<br>`xh-field-chrome` | `--xh-control-min-w` | cascader 的 control、root 部件 min-inline-size 覆盖槽。 |
| `--xh-cascader-control-px` | `control` | `padding-inline` | `xh-field-chrome` | `--xh-_cascader-px` | cascader 的 control 部件 padding-inline 覆盖槽。 |
| `--xh-cascader-control-radius` | `control` | `border-radius` | `xh-field-chrome` | `--xh-shape-control` | cascader 的 control 部件 border-radius 覆盖槽。 |
| `--xh-cascader-control-shadow` | `control` | `box-shadow` | `xh-field-chrome` | `none` | cascader 的 control 部件 box-shadow 覆盖槽。 |
| `--xh-cascader-empty-fg` | `empty` | `color` | `default` | `--xh-material-frosted-fg-muted` | cascader 的 empty 部件 color 覆盖槽。 |
| `--xh-cascader-empty-min-h` | `empty` | `min-block-size` | `default` | `5rem` | cascader 的 empty 部件 min-block-size 覆盖槽。 |
| `--xh-cascader-empty-p` | `empty` | `padding` | `default` | `--xh-space-3` | cascader 的 empty 部件 padding 覆盖槽。 |
| `--xh-cascader-footer-border` | `footer` | `border-block-start` | `default` | `--xh-border-subtle` | cascader 的 footer 部件 border-block-start 覆盖槽。 |
| `--xh-cascader-footer-fg` | `footer` | `color` | `default` | `--xh-fg-muted` | cascader 的 footer 部件 color 覆盖槽。 |
| `--xh-cascader-footer-font-size` | `footer` | `font-size` | `default` | `--xh-text-secondary-size` | cascader 的 footer 部件 font-size 覆盖槽。 |
| `--xh-cascader-footer-gap` | `footer` | `gap` | `default` | `--xh-space-2` | cascader 的 footer 部件 gap 覆盖槽。 |
| `--xh-cascader-footer-px` | `footer` | `padding-inline` | `default` | `--xh-space-2` | cascader 的 footer 部件 padding-inline 覆盖槽。 |
| `--xh-cascader-footer-py` | `footer` | `padding-block` | `default` | `--xh-space-2` | cascader 的 footer 部件 padding-block 覆盖槽。 |
| `--xh-cascader-gap` | `root` | `gap` | `default` | `--xh-space-1` | cascader 的 root 部件 gap 覆盖槽。 |
| `--xh-cascader-group-gap` | `group` | `gap` | `default` | `--xh-list-option-gap` | cascader 的 group 部件 gap 覆盖槽。 |
| `--xh-cascader-group-label-fg` | `group-label` | `color` | `default` | `--xh-material-frosted-fg-muted` | cascader 的 group-label 部件 color 覆盖槽。 |
| `--xh-cascader-group-label-font-size` | `group-label` | `font-size` | `default` | `--xh-text-caption-size` | cascader 的 group-label 部件 font-size 覆盖槽。 |
| `--xh-cascader-group-label-font-weight` | `group-label` | `font-weight` | `default` | `--xh-font-weight-medium` | cascader 的 group-label 部件 font-weight 覆盖槽。 |
| `--xh-cascader-group-label-px` | `group-label` | `padding-inline` | `default` | `--xh-_cascader-row-px` | cascader 的 group-label 部件 padding-inline 覆盖槽。 |
| `--xh-cascader-group-label-py` | `group-label` | `padding-block` | `default` | `--xh-space-1` | cascader 的 group-label 部件 padding-block 覆盖槽。 |
| `--xh-cascader-group-spacing` | `group` | `margin-block-start` | `default` | `--xh-space-1_5` | cascader 的 group 部件 margin-block-start 覆盖槽。 |
| `--xh-cascader-icon-size` | `control`<br>`item`<br>`positioner`<br>`root` | `--xh-icon-size` | `default`<br>`is([data-part='root'], [data-part='positioner'])`<br>`size=lg`<br>`size=sm`<br>`xh-field-chrome` | `--xh-_collection-glyph-size`<br>`--xh-_field-size-glyph-size`<br>`--xh-glyph-size-lg`<br>`--xh-glyph-size-md`<br>`--xh-glyph-size-sm` | cascader 的 control、item、positioner、root 部件 --xh-icon-size 覆盖槽。 |
| `--xh-cascader-indicator-fg` | `indicator` | `color` | `default` | `--xh-fg-muted` | cascader 的 indicator 部件 color 覆盖槽。 |
| `--xh-cascader-input-autofill-bg` | `input` | `box-shadow` | `-webkit-autofill`<br>`autofill` | `--xh-bg-surface` | cascader 的 input 部件 box-shadow 覆盖槽。 |
| `--xh-cascader-input-autofill-fg` | `input` | `-webkit-text-fill-color` | `-webkit-autofill`<br>`autofill` | `--xh-fg-default` | cascader 的 input 部件 -webkit-text-fill-color 覆盖槽。 |
| `--xh-cascader-input-font-size` | `input` | `font-size` | `default` | `--xh-_cascader-font-size` | cascader 的 input 部件 font-size 覆盖槽。 |
| `--xh-cascader-input-px` | `input` | `padding-inline` | `default` | `--xh-control-px-md` | cascader 的 input 部件 padding-inline 覆盖槽。 |
| `--xh-cascader-input-py` | `input` | `padding-block` | `default` | `--xh-space-2` | cascader 的 input 部件 padding-block 覆盖槽。 |
| `--xh-cascader-item-active-font-weight` | `item` | `font-weight` | `in-path` | `--xh-font-weight-regular` | cascader 的 item 部件 font-weight 覆盖槽。 |
| `--xh-cascader-item-bg-active` | `item` | `background-color` | `in-path` | `--xh-bg-subtle` | cascader 的 item 部件 background-color 覆盖槽。 |
| `--xh-cascader-item-bg-hover` | `item`<br>`search-item` | `background-color` | `error`<br>`highlighted`<br>`hover`<br>`is(:focus-visible, [data-highlighted])`<br>`not([aria-disabled='true'], [aria-busy='true'], [data-error])`<br>`xh-collection-context=overlay` | `--xh-bg-subtle` | cascader 的 item、search-item 部件 background-color 覆盖槽。 |
| `--xh-cascader-item-bg-pressed` | `item`<br>`search-item` | `background-color` | `error`<br>`is(:active, [data-pressed])`<br>`not([aria-disabled='true'], [aria-busy='true'], [data-error])`<br>`pressed`<br>`xh-collection-context=overlay` | `--xh-bg-subtle-hover` | cascader 的 item、search-item 部件 background-color 覆盖槽。 |
| `--xh-cascader-item-check-fg` | `item` | `color` | `error`<br>`highlighted`<br>`hover`<br>`in-path`<br>`is(:active, [data-pressed])`<br>`is(:focus-visible, [data-highlighted])`<br>`not([aria-disabled='true'], [aria-busy='true'], [data-error])`<br>`pressed`<br>`state=checked`<br>`xh-collection-context=overlay`<br>`xh-collection-slot=indicator` | `--xh-cascader-item-indicator-fg` | cascader 的 item 部件 color 覆盖槽。 |
| `--xh-cascader-item-fg` | `item`<br>`search-item` | `color` | `default`<br>`error`<br>`highlighted`<br>`hover`<br>`in-path`<br>`is(:active, [data-pressed])`<br>`is(:focus-visible, [data-highlighted])`<br>`not([aria-disabled='true'], [aria-busy='true'], [data-error])`<br>`pressed`<br>`xh-collection-context=overlay` | `--xh-material-frosted-fg` | cascader 的 item、search-item 部件 color 覆盖槽。 |
| `--xh-cascader-item-fg-selected` | `item`<br>`search-item` | `color` | `error`<br>`highlighted`<br>`hover`<br>`is(:active, [data-pressed])`<br>`is(:focus-visible, [data-highlighted])`<br>`not([aria-disabled='true'], [aria-busy='true'], [data-error])`<br>`pressed`<br>`xh-collection-context=overlay` | `--xh-cascader-item-fg` | cascader 的 item、search-item 部件 color 覆盖槽。 |
| `--xh-cascader-item-font-size` | `empty`<br>`item`<br>`search-item` | `font-size` | `default` | `--xh-_cascader-font-size` | cascader 的 empty、item、search-item 部件 font-size 覆盖槽。 |
| `--xh-cascader-item-font-weight-selected` | `item`<br>`search-item` | `font-weight` | `error`<br>`highlighted`<br>`hover`<br>`is(:active, [data-pressed])`<br>`is(:focus-visible, [data-highlighted])`<br>`not([aria-disabled='true'], [aria-busy='true'], [data-error])`<br>`pressed`<br>`xh-collection-context=overlay` | `--xh-font-weight-regular` | cascader 的 item、search-item 部件 font-weight 覆盖槽。 |
| `--xh-cascader-item-gap` | `item`<br>`search-item` | `margin-inline-end`<br>`margin-inline-start`<br>`padding-inline-end` | `branch`<br>`default`<br>`xh-collection-slot=indicator`<br>`xh-collection-slot=prefix`<br>`xh-collection-slot=shortcut`<br>`xh-collection-slot=suffix` | `--xh-_cascader-gap` | cascader 的 item、search-item 部件 margin-inline-end、margin-inline-start、padding-inline-end 覆盖槽。 |
| `--xh-cascader-item-indicator-fg` | `item`<br>`search-item` | `background-color`<br>`color` | `default`<br>`error`<br>`highlighted`<br>`hover`<br>`in-path`<br>`is(:active, [data-pressed])`<br>`is(:focus-visible, [data-highlighted])`<br>`not([aria-disabled='true'], [aria-busy='true'], [data-error])`<br>`pressed`<br>`state=checked`<br>`xh-collection-context=overlay`<br>`xh-collection-slot=indicator` | `--xh-_cascader-accent` | cascader 的 item、search-item 部件 background-color、color 覆盖槽。 |
| `--xh-cascader-item-indicator-size` | `item-indicator`<br>`search-item` | `block-size`<br>`inline-size`<br>`padding-inline-end` | `default` | `--xh-control-indicator-size` | cascader 的 item-indicator、search-item 部件 block-size、inline-size、padding-inline-end 覆盖槽。 |
| `--xh-cascader-item-leading` | `item`<br>`search-item` | `line-height` | `default` | `--xh-leading-normal` | cascader 的 item、search-item 部件 line-height 覆盖槽。 |
| `--xh-cascader-item-max-w` | `item` | `max-inline-size` | `default` | `--xh-overlay-max-w` | cascader 的 item 部件 max-inline-size 覆盖槽。 |
| `--xh-cascader-item-px` | `item`<br>`search-item` | `inset-inline-end`<br>`padding-inline`<br>`padding-inline-end` | `default` | `--xh-_cascader-row-px` | cascader 的 item、search-item 部件 inset-inline-end、padding-inline、padding-inline-end 覆盖槽。 |
| `--xh-cascader-item-py` | `item`<br>`search-item` | `padding-block` | `default` | `--xh-_cascader-row-py` | cascader 的 item、search-item 部件 padding-block 覆盖槽。 |
| `--xh-cascader-item-radius` | `item`<br>`search-item` | `border-radius` | `default` | `--xh-shape-control` | cascader 的 item、search-item 部件 border-radius 覆盖槽。 |
| `--xh-cascader-label-fg` | `label` | `color` | `default` | `--xh-fg-default` | cascader 的 label 部件 color 覆盖槽。 |
| `--xh-cascader-label-fg-disabled` | `label` | `color` | `disabled` | `--xh-fg-subtle` | cascader 的 label 部件 color 覆盖槽。 |
| `--xh-cascader-label-font-size` | `label` | `font-size` | `default` | `--xh-text-label-size` | cascader 的 label 部件 font-size 覆盖槽。 |
| `--xh-cascader-label-font-weight` | `label` | `font-weight` | `default` | `--xh-text-label-weight` | cascader 的 label 部件 font-weight 覆盖槽。 |
| `--xh-cascader-layer` | `positioner` | `z-index` | `default` | `--xh-_layer` | cascader 的 positioner 部件 z-index 覆盖槽。 |
| `--xh-cascader-loading-fg` | `loading` | `color` | `default` | `--xh-material-frosted-fg-muted` | cascader 的 loading 部件 color 覆盖槽。 |
| `--xh-cascader-loading-font-size` | `loading` | `font-size` | `default` | `--xh-_cascader-font-size` | cascader 的 loading 部件 font-size 覆盖槽。 |
| `--xh-cascader-loading-min-h` | `loading` | `min-block-size` | `default` | `5rem` | cascader 的 loading 部件 min-block-size 覆盖槽。 |
| `--xh-cascader-loading-min-w` | `loading` | `min-inline-size` | `default` | `--xh-cascader-column-min-w` | cascader 的 loading 部件 min-inline-size 覆盖槽。 |
| `--xh-cascader-loading-p` | `loading` | `padding` | `default` | `--xh-space-3` | cascader 的 loading 部件 padding 覆盖槽。 |
| `--xh-cascader-placeholder-fg` | `value-text` | `color` | `placeholder` | `--xh-fg-subtle` | cascader 的 value-text 部件 color 覆盖槽。 |
| `--xh-cascader-search-divider` | `input` | `border-block-end` | `default` | `--xh-material-frosted-separator` | cascader 的 input 部件 border-block-end 覆盖槽。 |
| `--xh-cascader-search-list-gap` | `search-list` | `gap` | `default` | `--xh-list-option-gap` | cascader 的 search-list 部件 gap 覆盖槽。 |
| `--xh-cascader-search-p` | `search-list` | `padding` | `default` | `--xh-space-1` | cascader 的 search-list 部件 padding 覆盖槽。 |
| `--xh-cascader-trigger-fg` | `trigger` | `color` | `default` | `--xh-fg-default` | cascader 的 trigger 部件 color 覆盖槽。 |
| `--xh-cascader-trigger-font-size` | `trigger` | `font-size` | `default` | `--xh-_cascader-font-size` | cascader 的 trigger 部件 font-size 覆盖槽。 |
| `--xh-cascader-trigger-gap` | `trigger` | `gap` | `default` | `--xh-_cascader-gap` | cascader 的 trigger 部件 gap 覆盖槽。 |
<!-- xh-component-tokens:end -->

### 动效

共享关键帧 `xh-fade-in` · `xh-overlay-slide-in` · `xh-overlay-slide-out` 由 `family/motion.css` 提供，皮肤 `@import` 它，单独引入仍成立；`rotate` 走 `transition` 过渡。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

皮肤之外还有一段：退场由适配器的退场闸门把关，动画播完才真收起。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。

### RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像；另有按 `dir` 分支的规则。
