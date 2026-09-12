# CheckboxGroup <Badge type="info" text="复选框组" />

一组多选项共一个值数组，附带全选与半选。

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/checkbox-group" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/checkbox-group.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/checkbox-group" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/checkbox-group" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/checkbox-group.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## 用法

值是字符串数组，各选各的，再点一次即取消；组内有几项就有几个 Tab 停靠点

<XhDemo src="checkbox-group/01-basic" />

## 组件结构

加粗的是必需部件。

`data-scope="checkbox-group"`：**`root`** · `label` · **`item`** · `indicator` · `item-text` · `hidden-input` · `select-all-trigger`

## 示例

### 全选与半选

select-all-trigger 是第三态复选框，只有把全部条目的值交给 itemValues 才分得清 checked 与 indeterminate

<XhDemo src="checkbox-group/02-select-all" />

### 横向排布

orientation 只出 data-orientation 交给皮肤排版，role=group 不接受 aria-orientation

<XhDemo src="checkbox-group/03-horizontal" />

### 禁用与只读

整组禁用连隐藏输入一起退出提交，只读则仍能聚焦与朗读、只是改不动

<XhDemo src="checkbox-group/04-disabled" />

### 栅格排布

组容器的行列只是缺省排布，行内把 display 改成 grid 就能摆成多列

<XhDemo src="checkbox-group/05-grid" />

### 受控与拦截

传了 value 就由宿主说了算，value-change 只报意图；这里最多留两项

<XhDemo src="checkbox-group/06-event" />

### 整组换档

方框边长、字号、间距与选中色都是组件令牌，写在组容器上整组一起生效

<XhDemo src="checkbox-group/07-scale" />

### 数字主键

条目身份存在 DOM 属性上，值一律是字符串；数字主键在进出两侧各转一次

<XhDemo src="checkbox-group/08-numeric-value" />

### 语气与尺寸

tone 换勾选方框的色族，size 换方框边长与文字档；两轴打在组容器上，条目自己不写

<XhDemo src="checkbox-group/09-tone-size" />

## 设计指引

### 何时使用

- 从若干项里选任意多项，且要随表单提交。

### 何时不用

- 选项很多、需要搜索：用[选择器](./select)的多选或[穿梭框](./transfer)。
- 选项互斥：用[单选组](./radio-group)。

### 特性

- `collection` 是文本与禁用的事实源；也可以逐项自己写。
- 全选触发器自动算半选态。
- `orientation` 换排布；也可以直接把条目放进[栅格](./grid)。
- 值可以是数字主键，不必强转字符串。

### 组合

- 外面套[表单字段](./field)。

### 最佳实践

- 超过约十项就换成带搜索的控件。
- 选项顺序稳定，别按选中状态重排——用户会跟丢。

### 反模式

- 用它表达一组互斥的筛选条件。
- 全选框放在列表最下面。

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
| `collection` | `CheckboxGroupNode[]` |  | 条目数据，显示文本与禁用的事实源。给了它，条目部件只需报 value。 缺省即回到「文本与禁用都写在条目部件上」的老路。 |
| `value` | `string[]` |  | 选中值集合。给定即受控：cell 直读 prop，写只发 onValueChange 不落内部值。 |
| `defaultValue` | `string[]` |  |  |
| `itemValues` | `string[]` |  | 组内全部条目的值，按书写顺序声明；不给时 checkedState 退化成 unchecked / indeterminate 两态。 |
| `disabled` | `boolean` |  | 整组禁用：每一项都跟着禁用，且隐藏输入不参与提交。 |
| `readOnly` | `boolean` |  | 只读：仍可聚焦与朗读，但用户改不动。 |
| `invalid` | `boolean` |  | 校验失败标注，落到每个条目的 aria-invalid 上。 |
| `name` | `string` |  | 表单字段名；给定后每个条目的隐藏输入才带 name，同名多值一并提交。 |
| `orientation` | `Orientation` |  | 视觉排布，默认 vertical。只出 data-orientation，不出 aria-orientation。 |
| `tone` | `Tone` |  | 语气：brand / neutral / success / warning / danger / info，决定勾选方框用哪族颜色。 |
| `size` | `Size` |  | 尺寸：sm / md / lg，决定方框与文字的几何档位。 |
| `onValueChange` | `(details: CheckboxGroupValueChangeDetails) => void` |  | value 变化意图回调；受控时是唯一出口，非受控随内部写入一并通知。 |

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
| `collection` | `readonly CheckboxGroupNodeMeta[]` | collection 推出的条目元信息，按数据顺序排列；没给 collection 即空数组。 |
| `checkedState` | `CheckboxGroupCheckedState` |  |
| `disabled` | `boolean` |  |
| `readOnly` | `boolean` |  |
| `invalid` | `boolean` |  |
| `isChecked` | `(value: string) => boolean` |  |
| `setValue` | `(next: string[]) => void` | 整体替换选中集合。程序化入口，不受 readOnly 拦截。 |
| `toggleValue` | `(value: string) => void` | 翻转某个值；整组禁用或只读时无效。 |
| `getRootProps` | `() => T['element']` |  |
| `getLabelProps` | `() => T['element']` |  |
| `getItemProps` | `(props: CheckboxGroupItemProps) => T['element']` |  |
| `getIndicatorProps` | `(props: CheckboxGroupItemProps) => T['element']` |  |
| `getItemTextProps` | `(props: CheckboxGroupItemProps) => T['element']` |  |
| `getHiddenInputProps` | `(props: CheckboxGroupItemProps) => T['input']` | 条目的表单影子：一份视觉隐藏的原生 checkbox，由条目内部渲染。 |
| `getSelectAllTriggerProps` | `() => T['element']` | 全选/半选的父复选框。必须写在 root 之内，它靠祖先链找到本组。 |

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

本组件公开覆盖槽由独立皮肤的实际消费位生成；缺省来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 缺省来源 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `--xh-checkbox-group-gap` | `root` | `gap` | `default` | `--xh-stack-gap-md` | checkbox-group 的 root 部件 gap 覆盖槽。 |
| `--xh-checkbox-group-icon-size` | `root` | `--xh-icon-size` | `default` | `--xh-glyph-size-text` | checkbox-group 的 root 部件 --xh-icon-size 覆盖槽。 |
| `--xh-checkbox-group-indicator-bg` | `indicator`<br>`select-all-trigger` | `background` | `default` | `--xh-bg-canvas` | checkbox-group 的 indicator、select-all-trigger 部件 background 覆盖槽。 |
| `--xh-checkbox-group-indicator-bg-checked` | `indicator`<br>`select-all-trigger` | `background` | `is([data-state='checked'], [data-state='indeterminate'])`<br>`state=checked`<br>`state=indeterminate` | `--xh-_checkbox-group-accent` | checkbox-group 的 indicator、select-all-trigger 部件 background 覆盖槽。 |
| `--xh-checkbox-group-indicator-border` | `indicator`<br>`select-all-trigger` | `border` | `default` | `--xh-border-control` | checkbox-group 的 indicator、select-all-trigger 部件 border 覆盖槽。 |
| `--xh-checkbox-group-indicator-border-checked` | `indicator`<br>`select-all-trigger` | `border-color` | `is([data-state='checked'], [data-state='indeterminate'])`<br>`state=checked`<br>`state=indeterminate` | `--xh-_checkbox-group-accent` | checkbox-group 的 indicator、select-all-trigger 部件 border-color 覆盖槽。 |
| `--xh-checkbox-group-indicator-border-hover` | `indicator`<br>`item` | `border-color` | `disabled`<br>`hover`<br>`not([data-disabled])`<br>`not([data-state='checked'])`<br>`state=checked` | `--xh-border-control-hover` | checkbox-group 的 indicator、item 部件 border-color 覆盖槽。 |
| `--xh-checkbox-group-indicator-border-invalid` | `indicator`<br>`root` | `border-color` | `invalid` | `--xh-border-invalid` | checkbox-group 的 indicator、root 部件 border-color 覆盖槽。 |
| `--xh-checkbox-group-indicator-fg` | `indicator`<br>`select-all-trigger` | `background-color`<br>`color` | `default`<br>`state=checked`<br>`state=indeterminate` | `--xh-_checkbox-group-on-accent` | checkbox-group 的 indicator、select-all-trigger 部件 background-color、color 覆盖槽。 |
| `--xh-checkbox-group-indicator-font-size` | `indicator`<br>`select-all-trigger` | `font-size` | `default`<br>`state=checked`<br>`state=indeterminate` | `--xh-_checkbox-group-glyph` | checkbox-group 的 indicator、select-all-trigger 部件 font-size 覆盖槽。 |
| `--xh-checkbox-group-indicator-radius` | `indicator`<br>`select-all-trigger` | `border-radius` | `default` | `--xh-shape-inset` | checkbox-group 的 indicator、select-all-trigger 部件 border-radius 覆盖槽。 |
| `--xh-checkbox-group-indicator-size` | `indicator`<br>`select-all-trigger` | `block-size`<br>`inline-size`<br>`margin-inline-start` | `default`<br>`state=checked`<br>`state=indeterminate` | `--xh-_checkbox-group-box` | checkbox-group 的 indicator、select-all-trigger 部件 block-size、inline-size、margin-inline-start 覆盖槽。 |
| `--xh-checkbox-group-item-fg` | `item` | `color` | `default` | `--xh-fg-default` | checkbox-group 的 item 部件 color 覆盖槽。 |
| `--xh-checkbox-group-item-fg-disabled` | `item` | `color` | `disabled` | `--xh-fg-disabled` | checkbox-group 的 item 部件 color 覆盖槽。 |
| `--xh-checkbox-group-item-font-size` | `item` | `font-size` | `default` | `--xh-text-label-size` | checkbox-group 的 item 部件 font-size 覆盖槽。 |
| `--xh-checkbox-group-item-gap` | `item` | `gap` | `default` | `--xh-_checkbox-group-gap` | checkbox-group 的 item 部件 gap 覆盖槽。 |
| `--xh-checkbox-group-item-radius` | `item` | `border-radius` | `default` | `--xh-shape-control` | checkbox-group 的 item 部件 border-radius 覆盖槽。 |
| `--xh-checkbox-group-label-fg` | `label` | `color` | `default` | `--xh-fg-muted` | checkbox-group 的 label 部件 color 覆盖槽。 |
| `--xh-checkbox-group-label-fg-disabled` | `label`<br>`root` | `color` | `disabled` | `--xh-fg-subtle` | checkbox-group 的 label、root 部件 color 覆盖槽。 |
| `--xh-checkbox-group-label-font-size` | `label` | `font-size` | `default` | `--xh-text-label-size` | checkbox-group 的 label 部件 font-size 覆盖槽。 |
| `--xh-checkbox-group-label-font-weight` | `label` | `font-weight` | `default` | `--xh-text-label-weight` | checkbox-group 的 label 部件 font-weight 覆盖槽。 |
| `--xh-checkbox-group-select-all-trigger-fg` | `select-all-trigger` | `color` | `default` | `--xh-fg-default` | checkbox-group 的 select-all-trigger 部件 color 覆盖槽。 |
| `--xh-checkbox-group-select-all-trigger-fg-disabled` | `select-all-trigger` | `color` | `disabled` | `--xh-fg-disabled` | checkbox-group 的 select-all-trigger 部件 color 覆盖槽。 |
| `--xh-checkbox-group-select-all-trigger-font-size` | `select-all-trigger` | `font-size` | `default` | `--xh-text-label-size` | checkbox-group 的 select-all-trigger 部件 font-size 覆盖槽。 |
| `--xh-checkbox-group-select-all-trigger-font-weight` | `select-all-trigger` | `font-weight` | `default` | `--xh-font-weight-medium` | checkbox-group 的 select-all-trigger 部件 font-weight 覆盖槽。 |
| `--xh-checkbox-group-select-all-trigger-gap` | `select-all-trigger` | `gap` | `default` | `--xh-_checkbox-group-gap` | checkbox-group 的 select-all-trigger 部件 gap 覆盖槽。 |
| `--xh-checkbox-group-select-all-trigger-radius` | `select-all-trigger` | `border-radius` | `default` | `--xh-shape-control` | checkbox-group 的 select-all-trigger 部件 border-radius 覆盖槽。 |
<!-- xh-component-tokens:end -->

### 动效

`background` · `border-color` 走 `transition` 过渡。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。

### RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像。
