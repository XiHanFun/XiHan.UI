# FilterBuilder 条件编辑器

可视化编辑一棵「全部满足 / 任一满足」的条件树，每个条件是「字段 + 运算符 + 值」，值可以是字面值，也可以是参数引用。值就是 `@xihan-ui/viz` 的 `FilterGroup`，交给 `compileFilter` 即可按它筛选数据。

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/filter-builder" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/filter-builder.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/filter-builder" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/filter-builder" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/filter-builder.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## 用法

组里是条件，每个条件是字段、运算符与值；运算符按字段类型给出，值的控件随运算符换，增删改都派发一棵新树

<XhDemo src="filter-builder/01-basic" />

## 组件结构

加粗的是必需部件。

`data-scope="filter-builder"`：**`root`** · `label` · **`group`** · `group-header` · `logic` · `group-delete-trigger` · `group-items` · `group-footer` · **`add-condition-trigger`** · `add-group-trigger` · `condition` · `condition-field` · `condition-operator` · `condition-source` · `condition-operand` · `range-separator` · `condition-ignore-case` · `condition-extra` · `condition-delete-trigger` · `condition-error` · `empty` · `live-region`

## 示例

### 引用参数

给了 parameters 时每个条件可以在「值 / 参数」之间切换，只列类型相容的参数；值写成 { parameter: 名字 }

<XhDemo src="filter-builder/02-parameters" />

### 嵌套的条件组

组里可以再套子组，表达「A 且（B 或 C）」；max-depth 限定层数，到上限时「加条件组」收起

<XhDemo src="filter-builder/03-nested" />

### 行尾扩展位

给了 createId 的条件带 id，行尾留一个扩展位放宿主自己的控件，参数带上条件与路径

<XhDemo src="filter-builder/04-extra" />

### 只读与禁用

只读时里面的控件可聚焦、不可修改，加删钮不可用；禁用时整棵树不可操作

<XhDemo src="filter-builder/05-states" />

## 设计指引

### 何时使用

- 让用户配置筛选、联动或分支条件：报表卡片与视图的筛选、表单的联动规则、流程的条件分支、列表页的高级筛选。
- 条件要嵌套（「A 且（B 或 C）」）时用子组，嵌套层数由 `maxDepth` 限定。

### 何时不用

- 只是一两个固定的筛选项：直接用对应的输入控件。
- 条件要写成一段公式：那是表达式，不是条件树。

### 特性

- 运算符按字段类型给出，字段可以自带运算符；值的控件随运算符换：单值、区间（两端）、一组值、不要值。
- 换运算符时能保留的值保留（单值进数组作第一项，数组取第一项作单值），换字段而类型变了时清空。
- 给了 `parameters` 时每个条件可以切换「值 / 参数」，参数只列类型相同、且多值与运算符相容的那些；值写成 `{ parameter: name }`。
- 组与条件上不认识的键原样保留；给了 `createId` 时新建的条件与组带上 `id`。
- 带 `id` 的条件行尾可以放宿主自己的控件：Vue 用 `condition-extra` 作用域插槽、React 用 `renderConditionExtra`，参数带上条件与路径；Web Components 在宿主的直接子节点上写 `slot="condition-extra:<条件 id>"`。没给内容或没有 `id` 的条件不铺扩展位。
- 不完整的条件照常保留在值里，行上带 `aria-invalid` 与行内说明；增删与挪动后由播报区读出「已添加条件 3」这类说明。
- 行内的每个控件都有名字：「条件 2 的字段」「条件 2 的运算符」「条件 2 的值」，区间两端分「起始值」「结束值」。

### 最佳实践

- 放进字段时用字段的标题给整棵树命名，不另写 `label`；不放进字段时在根上写 `aria-label`。
- 要给条件挂宿主专属的设置（报表的分桶方式等）就给 `createId`，在扩展位里放自己的控件。

## API 参考

### 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-filter-builder>` |
| Vue 组件 | `XhFilterBuilderAddConditionTrigger` `XhFilterBuilderAddGroupTrigger` `XhFilterBuilderCondition` `XhFilterBuilderConditionDeleteTrigger` `XhFilterBuilderConditionError` `XhFilterBuilderConditionExtra` `XhFilterBuilderConditionField` `XhFilterBuilderConditionIgnoreCase` `XhFilterBuilderConditionOperand` `XhFilterBuilderConditionOperator` `XhFilterBuilderConditionSource` `XhFilterBuilderEmpty` `XhFilterBuilderGroup` `XhFilterBuilderGroupDeleteTrigger` `XhFilterBuilderGroupFooter` `XhFilterBuilderGroupHeader` `XhFilterBuilderGroupItems` `XhFilterBuilderLabel` `XhFilterBuilderLiveRegion` `XhFilterBuilderLogic` `XhFilterBuilderRangeSeparator` `XhFilterBuilderRoot` |
| 组合式函数 | `useFilterBuilder` |
| 状态机 | `filterBuilderMachine` |
| 皮肤 | `@xihan-ui/styles/filter-builder.css` |

### Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `value` | `FilterGroup` |  | 受控的条件树；undefined 表示非受控。 |
| `defaultValue` | `FilterGroup` |  |  |
| `fields` | `readonly FilterBuilderField[]` |  | 可筛选的字段；条件的字段下拉按它的顺序。 |
| `parameters` | `readonly FilterBuilderParameter[]` |  | 可引用的参数；不给或为空时不显示「值 / 参数」切换。 |
| `createId` | `FilterBuilderCreateId` |  | 新节点的 id；不给时新建的条件与组不带 id，也就没有扩展位。 |
| `maxDepth` | `number` |  | 子组最多嵌套几层，缺省 2；0 表示不能加子组。 |
| `ignoreCase` | `boolean` |  | 字符串运算符旁给不给「忽略大小写」开关，缺省 true。 |
| `disabled` | `boolean` |  |  |
| `readOnly` | `boolean` |  |  |
| `invalid` | `boolean` |  |  |
| `ariaLabel` | `string` |  | 不显示出来的名字，写成 aria-label 落在根上。 放进字段（字段接线）或渲染了 label 部件时名字以它们为准，aria-labelledby 盖过它。 |
| `labelled` | `boolean` |  | 作者渲染了 label 部件：根以它为名。 |
| `variant` | `ControlVariant` |  |  |
| `size` | `Size` |  |  |
| `translations` | `Partial<FilterBuilderTranslations>` |  |  |
| `onValueChange` | `(details: FilterBuilderValueChangeDetails) => void` |  |  |

### 事件

自定义元素将载荷放在 `detail`；Vue 使用同名 emit。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `value-change` | `FilterBuilderValueChangeDetails` | 条件树变了；detail 为 `{ value: FilterGroup }` |

### 插槽

仅列出带载荷的插槽。

| Vue 组件 | 插槽 | 载荷 | 说明 |
| --- | --- | --- | --- |
| `XhFilterBuilderRoot` | `default` | `FilterBuilderRootSlotProps` |  |
| `XhFilterBuilderRoot` | `condition-extra` | `FilterBuilderConditionExtraSlotProps` |  |

### React 适配器 props

只列各组件自己声明的那些：继承自 `ComponentPropsWithRef` 的 DOM 属性不在其中，根组件上与上面 Props 表同名的也不重复列。Vue 的对应物是上面的插槽表。

| React 组件 | 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- | --- |
| `XhFilterBuilderCondition` | `value` | `string` | 是 | 条件的节点身份：视图里的 key。 |
| `XhFilterBuilderGroup` | `value` | `string` | 是 | 组的节点身份：视图里的 key。 |
| `XhFilterBuilderRoot` | `renderConditionExtra` | `(props: FilterBuilderConditionExtraSlotProps) => ReactNode` |  | 带 id 的条件行尾扩展位的内容；不给时不铺扩展位。 |
| `XhFilterBuilderRoot` | `children` | `SlotChildren<FilterBuilderRootSlotProps>` |  |  |

### 状态

以下名称仅用于内部状态机。

**状态**：`idle`

**事件**：`LOGIC.SET` · `CONDITION.ADD` · `GROUP.ADD` · `NODE.REMOVE` · `NODE.MOVE` · `FIELD.SET` · `OPERATOR.SET` · `OPERAND.SET` · `NUMBER.INPUT` · `SOURCE.SET` · `IGNORE_CASE.SET` · `FOCUS.DONE`

**判据**：`isEditable`

### connect API

`getXxxProps()` 返回对应部件的宿主属性。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `value` | `FilterGroup` |  |
| `tree` | `FilterBuilderGroupView` | 整棵树的视图，根组在最外层。 |
| `conditions` | `readonly FilterBuilderConditionView[]` | 按文档序排的全部条件。 |
| `hasIssues` | `boolean` | 有没有不完整的条件。 |
| `hasParameters` | `boolean` | 有没有可引用的参数：有时条件行才铺「值 / 参数」切换。 |
| `announcement` | `string` | 读屏播报的说明。 |
| `nodePath` | `(key: string) => FilterPath \| undefined` | 节点身份（组与条件部件上的 value）对应的路径；树里没有这个节点时为 undefined。 |
| `setLogic` | `(path: FilterPath, logic: FilterGroup['logic']) => void` |  |
| `addCondition` | `(groupPath: FilterPath) => void` |  |
| `addGroup` | `(groupPath: FilterPath) => void` |  |
| `remove` | `(path: FilterPath) => void` |  |
| `move` | `(path: FilterPath, delta: number) => void` |  |
| `setField` | `(path: FilterPath, field: string) => void` |  |
| `setOperator` | `(path: FilterPath, operator: FilterOperator) => void` |  |
| `setOperand` | `(path: FilterPath, value: unknown) => void` |  |
| `setSource` | `(path: FilterPath, source: FilterOperandSource) => void` |  |
| `setIgnoreCase` | `(path: FilterPath, value: boolean) => void` |  |
| `getRootProps` | `() => T['element']` |  |
| `getLabelProps` | `() => T['element']` |  |
| `getGroupProps` | `(path: FilterPath) => T['element']` |  |
| `getGroupHeaderProps` | `(path: FilterPath) => T['element']` |  |
| `getLogicProps` | `(path: FilterPath) => T['element']` |  |
| `getGroupDeleteTriggerProps` | `(path: FilterPath) => T['button']` |  |
| `getGroupItemsProps` | `(path: FilterPath) => T['element']` |  |
| `getGroupFooterProps` | `(path: FilterPath) => T['element']` |  |
| `getAddConditionTriggerProps` | `(path: FilterPath) => T['button']` |  |
| `getAddGroupTriggerProps` | `(path: FilterPath) => T['button']` |  |
| `getConditionProps` | `(path: FilterPath) => T['element']` |  |
| `getConditionFieldProps` | `(path: FilterPath) => T['element']` |  |
| `getConditionOperatorProps` | `(path: FilterPath) => T['element']` |  |
| `getConditionSourceProps` | `(path: FilterPath) => T['element']` |  |
| `getConditionOperandProps` | `(path: FilterPath) => T['element']` |  |
| `getRangeSeparatorProps` | `() => T['element']` |  |
| `getConditionIgnoreCaseProps` | `(path: FilterPath) => T['element']` |  |
| `getConditionExtraProps` | `(path: FilterPath) => T['element']` |  |
| `getConditionDeleteTriggerProps` | `(path: FilterPath) => T['button']` |  |
| `getConditionErrorProps` | `(path: FilterPath) => T['element']` |  |
| `getEmptyProps` | `() => T['element']` |  |
| `getLiveRegionProps` | `() => T['element']` |  |
| `getLogicControlProps` | `(path: FilterPath) => Partial<StructureInstanceProps['toggle-group']>` | 组的「全部满足 / 任一满足」切换，交给组合节点。 |
| `getFieldControlProps` | `(path: FilterPath) => Partial<StructureInstanceProps['select']>` |  |
| `getOperatorControlProps` | `(path: FilterPath) => Partial<StructureInstanceProps['select']>` |  |
| `getSourceControlProps` | `(path: FilterPath) => Partial<StructureInstanceProps['toggle-group']>` |  |
| `getOperandControls` | `(path: FilterPath) => readonly FilterOperandControl[]` | 操作数位置上的控件：区间是两个，不要操作数时为空。 |
| `getIgnoreCaseControlProps` | `(path: FilterPath) => Partial<StructureInstanceProps['switch']>` |  |

## 无障碍

### 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/)

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `Tab` / `Shift+Tab` | focus in root | 顺着条件行里的字段、运算符、取值来源、值、忽略大小写与删除钮走，组尾是「加条件」与「加条件组」 |
| `Alt+Shift+ArrowUp` / `Alt+Shift+ArrowDown` | focus in condition, not disabled, not readOnly | 在同一组里把这一行往前 / 往后挪一位，焦点跟着这一行；已在首位 / 末位就不动；Alt+↑ / ↓ 留给组合框的展开与收起 |
| `Ctrl+Delete` | focus in condition, not disabled, not readOnly | 删除这一行，焦点落到同组的下一行，没有时落到上一行，再没有落到「加条件」 |
| `ArrowUp` / `ArrowDown` / `Enter` / `Space` | focus in a control | 交给里面的下拉、分段切换、输入框、日期框、标签输入与开关各自的键盘行为 |

### ARIA

以下属性由 `connect` 生成。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `aria-invalid` | 'true' \| undefined |
| `root` | `aria-label` | props.ariaLabel |
| `root` | `aria-labelledby` | `label` 部件的 id \| undefined |
| `root` | `role` | 'group' |
| `group` | `aria-label` | t.group(group.group.logic) \| undefined |
| `group` | `role` | 'group' |
| `group-delete-trigger` | `aria-label` | t.removeGroup |
| `condition` | `aria-describedby` | `error` 部件的 id \| undefined |
| `condition` | `aria-invalid` | 'true' \| undefined |
| `condition` | `aria-label` | t.condition(view.number) \| undefined |
| `condition` | `role` | 'group' |
| `range-separator` | `aria-hidden` | 'true' |
| `condition-delete-trigger` | `aria-label` | t.removeCondition(view.number) \| undefined |
| `live-region` | `aria-live` | 'polite' |
| `live-region` | `role` | 'status' |

## 样式参考

### 皮肤

`@xihan-ui/styles/filter-builder.css` 按 `[data-scope="filter-builder"][data-part="root"]` 部件选择器书写，发布产物以挂载类 `.xh-scope-filter-builder` 代替其中的 data-scope（特异性相同），位于 `xihan.components` 层。覆盖样式使用 `xihan.overrides`，部件选择器照常可用。

`forced-colors: active` 下另有一套规则：颜色交给系统，边框与状态标记改用系统色关键字。

### 数据属性

由 `connect` 生成；条件不成立时不输出无值属性。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-disabled` | ''（条件成立时才出现） |
| `root` | `data-empty` | ''（条件成立时才出现） |
| `root` | `data-invalid` | ''（条件成立时才出现） |
| `root` | `data-readonly` | ''（条件成立时才出现） |
| `root` | `data-size` | props.size |
| `root` | `data-variant` | props.variant |
| `group` | `data-depth` | group?.depth |
| `group` | `data-logic` | group?.group.logic |
| `group-delete-trigger` | `data-disabled` | ''（条件成立时才出现） |
| `add-condition-trigger` | `data-disabled` | ''（条件成立时才出现） |
| `add-group-trigger` | `data-disabled` | ''（条件成立时才出现） |
| `condition` | `data-invalid` | ''（条件成立时才出现） |
| `condition-operand` | `data-shape` | conditionAt(path)?.shape |
| `condition-delete-trigger` | `data-disabled` | ''（条件成立时才出现） |

<!-- xh-component-tokens:start -->
### CSS 变量

本组件公开覆盖槽由独立皮肤的实际消费位生成；默认来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 默认来源 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `--xh-filter-builder-add-bg` | `add-condition-trigger`<br>`add-group-trigger` | `--xh-ink-surface`<br>`background-color` | `default`<br>`xh-ink-surface` | `--xh-_action-variant-bg-rest` | filter-builder 的 add-condition-trigger、add-group-trigger 部件 --xh-ink-surface、background-color 覆盖槽。 |
| `--xh-filter-builder-add-bg-active` | `add-condition-trigger`<br>`add-group-trigger` | `background-color` | `disabled`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-_action-variant-bg-pressed` | filter-builder 的 add-condition-trigger、add-group-trigger 部件 background-color 覆盖槽。 |
| `--xh-filter-builder-add-bg-hover` | `add-condition-trigger`<br>`add-group-trigger` | `background-color` | `disabled`<br>`hover`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])` | `--xh-_action-variant-bg-hover` | filter-builder 的 add-condition-trigger、add-group-trigger 部件 background-color 覆盖槽。 |
| `--xh-filter-builder-add-border` | `add-condition-trigger`<br>`add-group-trigger` | `border` | `default` | `--xh-_action-variant-border-rest` | filter-builder 的 add-condition-trigger、add-group-trigger 部件 border 覆盖槽。 |
| `--xh-filter-builder-add-border-disabled` | `add-condition-trigger`<br>`add-group-trigger` | `border-color` | `disabled` | `--xh-_action-variant-border-disabled` | filter-builder 的 add-condition-trigger、add-group-trigger 部件 border-color 覆盖槽。 |
| `--xh-filter-builder-add-border-hover` | `add-condition-trigger`<br>`add-group-trigger` | `border-color` | `disabled`<br>`hover`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])` | `--xh-_action-variant-border-hover` | filter-builder 的 add-condition-trigger、add-group-trigger 部件 border-color 覆盖槽。 |
| `--xh-filter-builder-add-fg` | `add-condition-trigger`<br>`add-group-trigger` | `color` | `default`<br>`disabled`<br>`hover`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-fg-brand` | filter-builder 的 add-condition-trigger、add-group-trigger 部件 color 覆盖槽。 |
| `--xh-filter-builder-add-font-size` | `add-condition-trigger`<br>`add-group-trigger` | `font-size` | `default` | `--xh-text-label-size` | filter-builder 的 add-condition-trigger、add-group-trigger 部件 font-size 覆盖槽。 |
| `--xh-filter-builder-add-height` | `add-condition-trigger`<br>`add-group-trigger` | `block-size`<br>`inline-size` | `default`<br>`xh-action-profile=icon` | `--xh-_action-profile-visual-size` | filter-builder 的 add-condition-trigger、add-group-trigger 部件 block-size、inline-size 覆盖槽。 |
| `--xh-filter-builder-add-px` | `add-condition-trigger`<br>`add-group-trigger` | `padding-inline` | `default` | `--xh-_action-profile-padding-inline` | filter-builder 的 add-condition-trigger、add-group-trigger 部件 padding-inline 覆盖槽。 |
| `--xh-filter-builder-add-radius` | `add-condition-trigger`<br>`add-group-trigger` | `border-radius` | `default` | `--xh-shape-control` | filter-builder 的 add-condition-trigger、add-group-trigger 部件 border-radius 覆盖槽。 |
| `--xh-filter-builder-condition-gap` | `condition` | `gap` | `default` | `--xh-space-2` | filter-builder 的 condition 部件 gap 覆盖槽。 |
| `--xh-filter-builder-delete-bg` | `condition-delete-trigger`<br>`group-delete-trigger` | `--xh-ink-surface`<br>`background-color` | `default`<br>`xh-ink-surface` | `--xh-_action-variant-bg-rest` | filter-builder 的 condition-delete-trigger、group-delete-trigger 部件 --xh-ink-surface、background-color 覆盖槽。 |
| `--xh-filter-builder-delete-bg-active` | `condition-delete-trigger`<br>`group-delete-trigger` | `background-color` | `disabled`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-_action-variant-bg-pressed` | filter-builder 的 condition-delete-trigger、group-delete-trigger 部件 background-color 覆盖槽。 |
| `--xh-filter-builder-delete-bg-hover` | `condition-delete-trigger`<br>`group-delete-trigger` | `background-color` | `disabled`<br>`hover`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])` | `--xh-_action-variant-bg-hover` | filter-builder 的 condition-delete-trigger、group-delete-trigger 部件 background-color 覆盖槽。 |
| `--xh-filter-builder-delete-fg` | `condition-delete-trigger`<br>`group-delete-trigger` | `color` | `default` | `--xh-fg-muted` | filter-builder 的 condition-delete-trigger、group-delete-trigger 部件 color 覆盖槽。 |
| `--xh-filter-builder-delete-fg-hover` | `condition-delete-trigger`<br>`group-delete-trigger` | `color` | `disabled`<br>`hover`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-fg-danger-hover` | filter-builder 的 condition-delete-trigger、group-delete-trigger 部件 color 覆盖槽。 |
| `--xh-filter-builder-delete-radius` | `condition-delete-trigger`<br>`group-delete-trigger` | `border-radius` | `default` | `--xh-shape-control` | filter-builder 的 condition-delete-trigger、group-delete-trigger 部件 border-radius 覆盖槽。 |
| `--xh-filter-builder-delete-size` | `condition-delete-trigger`<br>`group-delete-trigger` | `block-size`<br>`inline-size`<br>`min-inline-size` | `default`<br>`xh-action-profile=icon` | `--xh-_action-profile-visual-size` | filter-builder 的 condition-delete-trigger、group-delete-trigger 部件 block-size、inline-size、min-inline-size 覆盖槽。 |
| `--xh-filter-builder-empty-fg` | `empty` | `color` | `default` | `--xh-fg-muted` | filter-builder 的 empty 部件 color 覆盖槽。 |
| `--xh-filter-builder-empty-font-size` | `empty` | `font-size` | `default` | `--xh-text-secondary-size` | filter-builder 的 empty 部件 font-size 覆盖槽。 |
| `--xh-filter-builder-error-fg` | `condition-error` | `color` | `default` | `--xh-fg-danger` | filter-builder 的 condition-error 部件 color 覆盖槽。 |
| `--xh-filter-builder-error-font-size` | `condition-error` | `font-size` | `default` | `--xh-text-caption-size` | filter-builder 的 condition-error 部件 font-size 覆盖槽。 |
| `--xh-filter-builder-footer-gap` | `group-footer` | `gap` | `default` | `--xh-space-2` | filter-builder 的 group-footer 部件 gap 覆盖槽。 |
| `--xh-filter-builder-gap` | `root` | `gap` | `default` | `--xh-space-2` | filter-builder 的 root 部件 gap 覆盖槽。 |
| `--xh-filter-builder-group-gap` | `group` | `gap` | `default` | `--xh-space-2` | filter-builder 的 group 部件 gap 覆盖槽。 |
| `--xh-filter-builder-guide-color` | `group` | `border-inline-start` | `depth=0`<br>`not([data-depth='0'])` | `--xh-border-subtle` | filter-builder 的 group 部件 border-inline-start 覆盖槽。 |
| `--xh-filter-builder-header-gap` | `group-header` | `gap` | `default` | `--xh-space-2` | filter-builder 的 group-header 部件 gap 覆盖槽。 |
| `--xh-filter-builder-icon-size` | `condition-delete-trigger`<br>`group-delete-trigger` | `--xh-icon-size` | `default` | `--xh-_action-profile-glyph-size` | filter-builder 的 condition-delete-trigger、group-delete-trigger 部件 --xh-icon-size 覆盖槽。 |
| `--xh-filter-builder-indent` | `group` | `padding-inline-start` | `depth=0`<br>`not([data-depth='0'])` | `--xh-space-4` | filter-builder 的 group 部件 padding-inline-start 覆盖槽。 |
| `--xh-filter-builder-items-gap` | `group-items` | `gap` | `default` | `--xh-space-2` | filter-builder 的 group-items 部件 gap 覆盖槽。 |
| `--xh-filter-builder-label-fg` | `label` | `color` | `default` | `--xh-fg-muted` | filter-builder 的 label 部件 color 覆盖槽。 |
| `--xh-filter-builder-label-font-size` | `label` | `font-size` | `default` | `--xh-text-label-size` | filter-builder 的 label 部件 font-size 覆盖槽。 |
| `--xh-filter-builder-label-font-weight` | `label` | `font-weight` | `default` | `--xh-text-label-weight` | filter-builder 的 label 部件 font-weight 覆盖槽。 |
| `--xh-filter-builder-operand-gap` | `condition-operand` | `gap` | `default` | `--xh-space-2` | filter-builder 的 condition-operand 部件 gap 覆盖槽。 |
| `--xh-filter-builder-operand-w` | `condition-operand` | `flex` | `default` | `--xh-layout-col-min-sm` | filter-builder 的 condition-operand 部件 flex 覆盖槽。 |
| `--xh-filter-builder-select-w` | `condition-field`<br>`condition-operator` | `flex` | `default` | `--xh-layout-col-min-xs` | filter-builder 的 condition-field、condition-operator 部件 flex 覆盖槽。 |
| `--xh-filter-builder-separator-fg` | `range-separator` | `color` | `default` | `--xh-fg-muted` | filter-builder 的 range-separator 部件 color 覆盖槽。 |
| `--xh-filter-builder-separator-font-size` | `range-separator` | `font-size` | `default` | `--xh-text-label-size` | filter-builder 的 range-separator 部件 font-size 覆盖槽。 |
<!-- xh-component-tokens:end -->

### 动效

动效角色：按压 · 状态（见[动效规范](../design/motion#角色)）。

本组件皮肤不含过渡与关键帧，也没有脚本驱动的动效：状态一变，外观立即到位。

### RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像。
