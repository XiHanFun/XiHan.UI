# CheckboxGroup 复选框组 <Badge type="info" text="alpha" />

从一组选项中选择任意多项。

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/checkbox-group" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/checkbox-group.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/checkbox-group" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/checkbox-group" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/checkbox-group.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## 用法

从一组选项中选择任意多项

<XhDemo src="checkbox-group/01-basic" />

## 组件结构

加粗的是必需部件。

`data-scope="checkbox-group"`：**`root`** · `label` · **`item`** · `indicator` · `item-text` · `hidden-input` · `select-all-trigger`

## 示例

### 全选与半选

使用 itemValues 计算全选和半选状态

<XhDemo src="checkbox-group/02-select-all" />

### 横向排布

使用 orientation 设置排列方向

<XhDemo src="checkbox-group/03-horizontal" />

### 禁用与只读

禁用项不可操作，只读项仍可聚焦

<XhDemo src="checkbox-group/04-disabled" />

### 尺寸

size 决定方框与条目文字的几何档位，组标题不随档

<XhDemo src="checkbox-group/05-size" />

## 设计指引

### 何时使用

- 用于偏好设置、筛选条件和批量选择。

### 何时不用

- 选项较多或需要搜索时，使用[选择器](./select)的多选或[穿梭框](./transfer)。
- 选项互斥时，使用[单选组](./radio-group)。

### 特性

- `collection` 提供选项文本与禁用状态。
- 全选触发器自动计算全选与半选状态。
- `orientation` 设置横向或纵向排列。
- 方框是字段家族的控制盒：canvas 底、描边与无影，勾中后以语气色填充，按下缩放并换底。

### 组合

- 每一项都是一个[复选框](./checkbox)，全选触发器是组内额外的一项，半选状态由组计算。
- 在[表单](./form)中以整组的值数组作为一个字段参与校验与提交。

### 最佳实践

- 使用简短、互不重叠的选项标签。
- 保持选项顺序稳定。

### 反模式

- 用复选框组表达互斥选项。
- 将全选项放在列表末尾。

## API 参考

### 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-checkbox-group>` |
| Vue 组件 | `XhCheckboxGroupIndicator` `XhCheckboxGroupItem` `XhCheckboxGroupItemText` `XhCheckboxGroupLabel` `XhCheckboxGroupRoot` `XhCheckboxGroupSelectAllTrigger` |
| 组合式函数 | `useCheckboxGroup` |
| 状态机 | `checkboxGroupMachine` |
| 皮肤 | `@xihan-ui/styles/checkbox-group.css` |

### Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `collection` | `CheckboxGroupNode[]` |  | 条目数据，显示文本与禁用的事实源。提供后条目部件只需声明 value。 未提供时回到文本与禁用都写在条目部件上的方式。 |
| `value` | `string[]` |  | 选中值集合。提供即受控：cell 直读 prop，写入只发 onValueChange 不落内部值。 |
| `defaultValue` | `string[]` |  |  |
| `itemValues` | `string[]` |  | 组内全部条目的值，按书写顺序声明；未提供时 checkedState 退化为 unchecked / indeterminate 两态。 |
| `disabled` | `boolean` |  | 整组禁用：每一项随之禁用，且隐藏输入不参与提交。 |
| `readOnly` | `boolean` |  | 只读：仍可聚焦与朗读，但用户不可修改。 |
| `invalid` | `boolean` |  | 校验失败标注，写入每个条目的 aria-invalid。 |
| `name` | `string` |  | 表单字段名；提供后每个条目的隐藏输入才带 name，同名多值一并提交。 |
| `orientation` | `Orientation` |  | 视觉排布，默认 vertical。只输出 data-orientation，不输出 aria-orientation。 |
| `tone` | `Tone` |  | 语气：brand / neutral / success / warning / danger / info，决定勾选方框使用哪族颜色。 |
| `size` | `Size` |  | 尺寸：sm / md / lg，决定方框与文字的几何档位。 |
| `onValueChange` | `(details: CheckboxGroupValueChangeDetails) => void` |  | value 变化意图回调；受控时是唯一出口，非受控时随内部写入一并通知。 |

### 事件

自定义元素将载荷放在 `detail`；Vue 使用同名 emit。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `value-change` | `CheckboxGroupValueChangeDetails` | 选中值变化；detail 为 `{ value: string[] }` |

### 插槽

仅列出带载荷的插槽。

| Vue 组件 | 插槽 | 载荷 | 说明 |
| --- | --- | --- | --- |
| `XhCheckboxGroupRoot` | `default` | `CheckboxGroupRootSlotProps` |  |
| `XhCheckboxGroupRoot` | `label` | — |  |
| `XhCheckboxGroupRoot` | `item` | `CheckboxGroupNodeMeta` |  |

### 状态

公开状态写入 `data-state`。

| 部件 | 取值 |
| --- | --- |
| `select-all-trigger` | resolveCheckedState(value, prop('itemValues') ?? []) |

以下名称仅用于内部状态机。

**状态**：`idle`

**事件**：`VALUE.SET` · `ITEM.TOGGLE` · `ALL.TOGGLE` · `FORM.RESET`

**判据**：`editable`

### connect API

`getXxxProps()` 返回对应部件的宿主属性。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `value` | `string[]` |  |
| `collection` | `readonly CheckboxGroupNodeMeta[]` | 由 collection 推导的条目元信息，按数据顺序排列；未提供 collection 时为空数组。 |
| `checkedState` | `CheckboxGroupCheckedState` |  |
| `disabled` | `boolean` |  |
| `readOnly` | `boolean` |  |
| `invalid` | `boolean` |  |
| `isChecked` | `(value: string) => boolean` |  |
| `setValue` | `(next: string[]) => void` | 整体替换选中集合。程序化入口，不受 readOnly 拦截。 |
| `toggleValue` | `(value: string) => void` | 切换某个值；整组禁用或只读时无效。 |
| `getRootProps` | `() => T['element']` |  |
| `getLabelProps` | `() => T['element']` |  |
| `getItemProps` | `(props: CheckboxGroupItemProps) => T['element']` |  |
| `getIndicatorProps` | `(props: CheckboxGroupItemProps) => T['element']` |  |
| `getItemTextProps` | `(props: CheckboxGroupItemProps) => T['element']` |  |
| `getHiddenInputProps` | `(props: CheckboxGroupItemProps) => T['input']` | 条目的表单影子：一份视觉隐藏的原生 checkbox，由条目内部渲染。 |
| `getSelectAllTriggerProps` | `() => T['element']` | 全选 / 半选的父复选框。必须写在 root 之内，它依靠祖先链找到本组。 |

## 无障碍

### 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/checkbox/#keyboardinteraction)

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `Tab` / `Shift+Tab` | focus enters or leaves the group | 组内有几个条目就有几个 Tab 停靠点（禁用条目也留一个），容器自己不占位；单选组的"整组一个停靠点"在这里不成立 |
| `Space` | focus on item, group editable and item not disabled | 翻转该条目的选中态；改不动时放行按键给页面滚动 |
| `Space` | focus on select-all-trigger, group editable | 可用条目未全选则一并勾上，已全选则一并取消；禁用条目不受影响 |

### ARIA

以下属性由 `connect` 生成。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `aria-labelledby` | `label` 部件的 id |
| `root` | `role` | 'group' |
| `item` | `aria-checked` | 'true' \| 'false' |
| `item` | `aria-disabled` | 'true' \| 'false' |
| `item` | `aria-invalid` | 'true' \| 'false' |
| `item` | `aria-readonly` | 'true' \| 'false' |
| `item` | `role` | 'checkbox' |
| `indicator` | `aria-hidden` | 'true' |
| `hidden-input` | `aria-hidden` | 'true' |
| `select-all-trigger` | `aria-checked` | 'true' \| 'mixed' \| 'false' |
| `select-all-trigger` | `aria-disabled` | 'false' \| 'true' |
| `select-all-trigger` | `aria-labelledby` | `label` 部件的 id `select-all-trigger` 部件的 id |
| `select-all-trigger` | `aria-readonly` | 'true' \| 'false' |
| `select-all-trigger` | `role` | 'checkbox' |

## 样式参考

### 皮肤

`@xihan-ui/styles/checkbox-group.css` 使用 `[data-scope="checkbox-group"][data-part="root"]` 部件选择器，位于 `xihan.components` 层。覆盖样式使用 `xihan.overrides`。

`forced-colors: active` 下另有一套规则：颜色交给系统，边框与状态标记改用系统色关键字。

### 数据属性

由 `connect` 生成；条件不成立时不输出无值属性。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-disabled` | ''（条件成立时才出现） |
| `root` | `data-invalid` | ''（条件成立时才出现） |
| `root` | `data-orientation` | props.orientation |
| `root` | `data-readonly` | ''（条件成立时才出现） |
| `root` | `data-size` | props.size |
| `root` | `data-tone` | props.tone |
| `select-all-trigger` | `data-disabled` | ''（条件成立时才出现） |
| `select-all-trigger` | `data-readonly` | ''（条件成立时才出现） |
| `select-all-trigger` | `data-state` | resolveCheckedState(value, prop('itemValues') ?? []) |

<!-- xh-component-tokens:start -->
### CSS 变量

本组件公开覆盖槽由独立皮肤的实际消费位生成；默认来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 默认来源 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `--xh-checkbox-group-gap` | `root` | `gap` | `default` | `--xh-space-2` | checkbox-group 的 root 部件 gap 覆盖槽。 |
| `--xh-checkbox-group-icon-size` | `root` | `--xh-icon-size` | `default` | `--xh-_checkbox-group-glyph` | checkbox-group 的 root 部件 --xh-icon-size 覆盖槽。 |
| `--xh-checkbox-group-indicator-bg` | `indicator`<br>`root`<br>`select-all-trigger` | `background-color` | `default` | `--xh-bg-canvas` | checkbox-group 的 indicator、root、select-all-trigger 部件 background-color 覆盖槽。 |
| `--xh-checkbox-group-indicator-bg-checked` | `indicator`<br>`select-all-trigger` | `background-color` | `is([data-state='checked'], [data-state='indeterminate'])`<br>`state=checked`<br>`state=indeterminate` | `--xh-_checkbox-group-accent` | checkbox-group 的 indicator、select-all-trigger 部件 background-color 覆盖槽。 |
| `--xh-checkbox-group-indicator-bg-checked-pressed` | `indicator`<br>`item`<br>`root`<br>`select-all-trigger` | `background-color` | `disabled`<br>`is(:active, [data-pressed])`<br>`is([data-state='checked'], [data-state='indeterminate'])`<br>`not([data-disabled])`<br>`not([data-readonly])`<br>`pressed`<br>`readonly`<br>`state=checked`<br>`state=indeterminate` | `--xh-_tone-active` | checkbox-group 的 indicator、item、root、select-all-trigger 部件 background-color 覆盖槽。 |
| `--xh-checkbox-group-indicator-bg-disabled` | `indicator`<br>`item`<br>`root`<br>`select-all-trigger` | `background-color` | `disabled` | `--xh-bg-subtle` | checkbox-group 的 indicator、item、root、select-all-trigger 部件 background-color 覆盖槽。 |
| `--xh-checkbox-group-indicator-bg-pressed` | `indicator`<br>`item`<br>`root`<br>`select-all-trigger` | `background-color` | `disabled`<br>`is(:active, [data-pressed])`<br>`not([data-disabled])`<br>`not([data-readonly])`<br>`pressed`<br>`readonly` | `--xh-bg-subtle-hover` | checkbox-group 的 indicator、item、root、select-all-trigger 部件 background-color 覆盖槽。 |
| `--xh-checkbox-group-indicator-border` | `indicator`<br>`select-all-trigger` | `border` | `default` | `--xh-border-control` | checkbox-group 的 indicator、select-all-trigger 部件 border 覆盖槽。 |
| `--xh-checkbox-group-indicator-border-checked` | `indicator`<br>`select-all-trigger` | `border-color` | `is([data-state='checked'], [data-state='indeterminate'])`<br>`state=checked`<br>`state=indeterminate` | `--xh-_checkbox-group-accent` | checkbox-group 的 indicator、select-all-trigger 部件 border-color 覆盖槽。 |
| `--xh-checkbox-group-indicator-border-disabled` | `indicator`<br>`item`<br>`root`<br>`select-all-trigger` | `border-color` | `disabled` | `--xh-border-default` | checkbox-group 的 indicator、item、root、select-all-trigger 部件 border-color 覆盖槽。 |
| `--xh-checkbox-group-indicator-border-hover` | `indicator`<br>`item`<br>`root`<br>`select-all-trigger` | `border-color` | `@media (hover: hover)`<br>`disabled`<br>`hover`<br>`invalid`<br>`not([data-disabled])`<br>`not([data-invalid])`<br>`not([data-readonly])`<br>`not([data-state='checked'])`<br>`not([data-state='indeterminate'])`<br>`readonly`<br>`state=checked`<br>`state=indeterminate` | `--xh-border-control-hover` | checkbox-group 的 indicator、item、root、select-all-trigger 部件 border-color 覆盖槽。 |
| `--xh-checkbox-group-indicator-border-invalid` | `indicator`<br>`root` | `border-color` | `invalid` | `--xh-border-invalid` | checkbox-group 的 indicator、root 部件 border-color 覆盖槽。 |
| `--xh-checkbox-group-indicator-fg` | `indicator`<br>`select-all-trigger` | `background-color`<br>`color` | `default`<br>`state=checked`<br>`state=indeterminate` | `--xh-_checkbox-group-on-accent` | checkbox-group 的 indicator、select-all-trigger 部件 background-color、color 覆盖槽。 |
| `--xh-checkbox-group-indicator-fg-disabled` | `indicator`<br>`item`<br>`root`<br>`select-all-trigger` | `color` | `disabled` | `--xh-fg-disabled` | checkbox-group 的 indicator、item、root、select-all-trigger 部件 color 覆盖槽。 |
| `--xh-checkbox-group-indicator-font-size` | `indicator`<br>`select-all-trigger` | `font-size` | `default`<br>`state=checked`<br>`state=indeterminate` | `--xh-_checkbox-group-glyph` | checkbox-group 的 indicator、select-all-trigger 部件 font-size 覆盖槽。 |
| `--xh-checkbox-group-indicator-radius` | `indicator`<br>`select-all-trigger` | `border-radius` | `default` | `--xh-shape-inset` | checkbox-group 的 indicator、select-all-trigger 部件 border-radius 覆盖槽。 |
| `--xh-checkbox-group-indicator-shadow` | `indicator`<br>`select-all-trigger` | `box-shadow` | `default` | `none` | checkbox-group 的 indicator、select-all-trigger 部件 box-shadow 覆盖槽。 |
| `--xh-checkbox-group-indicator-size` | `indicator`<br>`select-all-trigger` | `block-size`<br>`inline-size`<br>`margin-inline-start` | `default`<br>`state=checked`<br>`state=indeterminate` | `--xh-_checkbox-group-box` | checkbox-group 的 indicator、select-all-trigger 部件 block-size、inline-size、margin-inline-start 覆盖槽。 |
| `--xh-checkbox-group-item-fg` | `item` | `color` | `default` | `--xh-fg-default` | checkbox-group 的 item 部件 color 覆盖槽。 |
| `--xh-checkbox-group-item-fg-disabled` | `item` | `color` | `disabled` | `--xh-fg-disabled` | checkbox-group 的 item 部件 color 覆盖槽。 |
| `--xh-checkbox-group-item-font-size` | `item` | `font-size` | `default` | `--xh-_checkbox-group-font-size` | checkbox-group 的 item 部件 font-size 覆盖槽。 |
| `--xh-checkbox-group-item-gap` | `item` | `gap` | `default` | `--xh-_checkbox-group-gap` | checkbox-group 的 item 部件 gap 覆盖槽。 |
| `--xh-checkbox-group-item-radius` | `item` | `border-radius` | `default` | `--xh-shape-control` | checkbox-group 的 item 部件 border-radius 覆盖槽。 |
| `--xh-checkbox-group-label-fg` | `label` | `color` | `default` | `--xh-fg-muted` | checkbox-group 的 label 部件 color 覆盖槽。 |
| `--xh-checkbox-group-label-fg-disabled` | `label`<br>`root` | `color` | `disabled` | `--xh-fg-subtle` | checkbox-group 的 label、root 部件 color 覆盖槽。 |
| `--xh-checkbox-group-label-font-size` | `label` | `font-size` | `default` | `--xh-text-label-size` | checkbox-group 的 label 部件 font-size 覆盖槽。 |
| `--xh-checkbox-group-label-font-weight` | `label` | `font-weight` | `default` | `--xh-text-label-weight` | checkbox-group 的 label 部件 font-weight 覆盖槽。 |
| `--xh-checkbox-group-select-all-trigger-fg` | `select-all-trigger` | `color` | `default` | `--xh-fg-default` | checkbox-group 的 select-all-trigger 部件 color 覆盖槽。 |
| `--xh-checkbox-group-select-all-trigger-fg-disabled` | `select-all-trigger` | `color` | `disabled` | `--xh-fg-disabled` | checkbox-group 的 select-all-trigger 部件 color 覆盖槽。 |
| `--xh-checkbox-group-select-all-trigger-font-size` | `select-all-trigger` | `font-size` | `default` | `--xh-_checkbox-group-font-size` | checkbox-group 的 select-all-trigger 部件 font-size 覆盖槽。 |
| `--xh-checkbox-group-select-all-trigger-font-weight` | `select-all-trigger` | `font-weight` | `default` | `--xh-font-weight-medium` | checkbox-group 的 select-all-trigger 部件 font-weight 覆盖槽。 |
| `--xh-checkbox-group-select-all-trigger-gap` | `select-all-trigger` | `gap` | `default` | `--xh-_checkbox-group-gap` | checkbox-group 的 select-all-trigger 部件 gap 覆盖槽。 |
| `--xh-checkbox-group-select-all-trigger-radius` | `select-all-trigger` | `border-radius` | `default` | `--xh-shape-inset` | checkbox-group 的 select-all-trigger 部件 border-radius 覆盖槽。 |
<!-- xh-component-tokens:end -->

### 动效

`background-color` · `border-color` · `scale` 走 `transition` 过渡。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。

### 响应式

皮肤另按输入能力分档：`hover: hover`：同一份皮肤在触屏与带指针的设备上不一样，与视口宽度无关。

### RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像。
