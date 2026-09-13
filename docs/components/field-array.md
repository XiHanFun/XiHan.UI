# FieldArray 字段数组 <Badge type="info" text="alpha" />

用于管理可添加、删除和排序的重复字段。

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/field-array" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/field-array.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/field-array" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/field-array" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/field-array.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## 用法

添加和删除重复字段

<XhDemo src="field-array/01-basic" />

## 组件结构

加粗的是必需部件。

`data-scope="field-array"`：**`root`** · `item` · `item-label` · `item-content` · `item-action` · `add-trigger` · `item-delete-trigger` · `move-up-trigger` · `move-down-trigger`

## 示例

### 数量限制

设置最少和最多行数

<XhDemo src="field-array/02-min-max" />

### 排序

上移或下移字段

<XhDemo src="field-array/03-movable" />

### 多字段行

每行包含多个输入框

<XhDemo src="field-array/04-object-rows" />

## 设计指引

### 何时使用

- 联系方式、规格参数、收件人等数量可变的字段。

### 何时不用

- 行数固定时直接使用普通字段。
- 每项只是短文本时使用[标签输入](./tags-input)。

### 特性

- `min` 与 `max` 限制行数。
- `movable` 启用上移和下移操作。
- `createItem` 设置新增行的初始值。
- 每行可以包含一个或多个字段。
- 在 Form 中会同步迁移数组子字段的值、规则和错误。

### 最佳实践

- 新增后将焦点移到新行的第一个输入框。
- 删除按钮应说明目标行。
- 到达数量限制时保持操作按钮可见并禁用。

### 反模式

- 删除后无法撤销。
- 只在提交时提示数量限制。

## API 参考

### 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-field-array>` |
| Vue 组件 | `XhFieldArrayAddTrigger` `XhFieldArrayItem` `XhFieldArrayItemAction` `XhFieldArrayItemContent` `XhFieldArrayItemDeleteTrigger` `XhFieldArrayItemLabel` `XhFieldArrayMoveDownTrigger` `XhFieldArrayMoveUpTrigger` `XhFieldArrayRoot` |
| 组合式函数 | `useFieldArray` |
| 状态机 | `fieldArrayMachine` |
| 皮肤 | `@xihan-ui/styles/field-array.css` |

### Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `value` | `unknown[]` |  | 受控数据数组；给了就由宿主说了算，机器不自改，只发 onValueChange。 |
| `defaultValue` | `unknown[]` |  | 非受控初始数据数组。 |
| `min` | `number` |  | 最少几行。到了这个数，删除把手就按不动了。缺省 0。 |
| `max` | `number` |  | 最多几行。到了这个数，新增把手就按不动了。缺省不限。 |
| `createItem` | `() => unknown` |  | 新增一行时造一个空项。不给就插一个 null。 |
| `movable` | `boolean` |  | 出不出换序把手。关（默认）时两个换序把手一律收起。 |
| `disabled` | `boolean` |  | 禁用：新增、删除、换序三路都按不动。 |
| `readOnly` | `boolean` |  | 只读：行数改不动（新增、删除、换序都按不动），行里的控件仍由作者自己置只读。 |
| `invalid` | `boolean` |  | 校验失败标注：落到根与每一行上。 |
| `name` | `FormPath` |  | 整份数组的表单字段名。嵌套在 Form 中时会自动接入其值、规则、错误与校验真源； 每一行经 `item.name` 拿到显式数组 FormPath，绝不拼接字符串下标。 |
| `translations` | `Partial<FieldArrayTranslations>` |  |  |
| `onValueChange` | `(details: FieldArrayValueChangeDetails) => void` |  |  |

### 事件

自定义元素将载荷放在 `detail`；Vue 使用同名 emit。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `value-change` | `FieldArrayValueChangeDetails` | 数据数组变化；detail 为 `{ value: unknown[] }` |

### 插槽

仅列出带载荷的插槽。

| Vue 组件 | 插槽 | 载荷 | 说明 |
| --- | --- | --- | --- |
| `XhFieldArrayRoot` | `default` | `FieldArrayRootSlotProps` |  |

### 状态

以下名称仅用于内部状态机。

**状态**：`idle`

**事件**：`VALUE.SET` · `ITEM.ADD` · `ITEM.REMOVE` · `ITEM.MOVE` · `FORM.RESET`

**判据**：`canAdd` · `canRemove` · `canMove`

### connect API

`getXxxProps()` 返回对应部件的宿主属性。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `value` | `unknown[]` |  |
| `items` | `FieldArrayItem[]` | 逐行的读侧投影，含渲染用的 key。 |
| `count` | `number` |  |
| `empty` | `boolean` |  |
| `disabled` | `boolean` |  |
| `readOnly` | `boolean` |  |
| `invalid` | `boolean` |  |
| `movable` | `boolean` |  |
| `atMin` | `boolean` | 已到下限：再删就少于 min 了。 |
| `atMax` | `boolean` | 已到上限：再加就多于 max 了。 |
| `canAdd` | `boolean` |  |
| `setValue` | `(next: unknown[]) => void` | 整份替换，不受 min / max 约束。 |
| `add` | `() => void` |  |
| `remove` | `(index: number) => void` |  |
| `move` | `(from: number, to: number) => void` |  |
| `moveUp` | `(index: number) => void` |  |
| `moveDown` | `(index: number) => void` |  |
| `getRootProps` | `() => T['element']` |  |
| `getItemProps` | `(item: FieldArrayItemProps) => T['element']` |  |
| `getItemLabelProps` | `(item: FieldArrayItemProps) => T['element']` | 行前那一小段行号或名目；纯标注，不与行里的控件建立 for 关联。 |
| `getItemContentProps` | `(item: FieldArrayItemProps) => T['element']` |  |
| `getItemActionProps` | `(item: FieldArrayItemProps) => T['element']` |  |
| `getAddTriggerProps` | `() => T['button']` |  |
| `getItemDeleteTriggerProps` | `(item: FieldArrayItemProps) => T['button']` |  |
| `getMoveUpTriggerProps` | `(item: FieldArrayItemProps) => T['button']` |  |
| `getMoveDownTriggerProps` | `(item: FieldArrayItemProps) => T['button']` |  |

## 无障碍

### 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/)

无键盘交互（不接收焦点，或焦点行为完全由原生元素提供）。

### ARIA

以下属性由 `connect` 生成。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `add-trigger` | `aria-disabled` | 'false' \| 'true' |
| `item-delete-trigger` | `aria-disabled` | 'false' \| 'true' |
| `item-delete-trigger` | `aria-label` | label.deleteItem(item.index + 1, count) |

## 样式参考

### 皮肤

`@xihan-ui/styles/field-array.css` 使用 `[data-scope="field-array"][data-part="root"]` 部件选择器，位于 `xihan.components` 层。覆盖样式使用 `xihan.overrides`。

### 数据属性

由 `connect` 生成；条件不成立时不输出无值属性。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-at-max` | ''（条件成立时才出现） |
| `root` | `data-at-min` | ''（条件成立时才出现） |
| `root` | `data-disabled` | ''（条件成立时才出现） |
| `root` | `data-empty` | ''（条件成立时才出现） |
| `root` | `data-invalid` | ''（条件成立时才出现） |
| `root` | `data-movable` | ''（条件成立时才出现） |
| `root` | `data-readonly` | ''（条件成立时才出现） |
| `item` | `data-first` | ''（条件成立时才出现） |
| `item` | `data-last` | ''（条件成立时才出现） |
| `add-trigger` | `data-disabled` | ''（条件成立时才出现） |
| `item-delete-trigger` | `data-disabled` | ''（条件成立时才出现） |

<!-- xh-component-tokens:start -->
### CSS 变量

本组件公开覆盖槽由独立皮肤的实际消费位生成；缺省来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 缺省来源 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `--xh-field-array-action-gap` | `add-trigger`<br>`item-action` | `gap` | `default` | `--xh-space-1` | field-array 的 add-trigger、item-action 部件 gap 覆盖槽。 |
| `--xh-field-array-add-bg` | `add-trigger` | `background` | `default` | `transparent` | field-array 的 add-trigger 部件 background 覆盖槽。 |
| `--xh-field-array-add-bg-active` | `add-trigger` | `background` | `active`<br>`not([aria-disabled='true'])` | `--xh-bg-subtle-active` | field-array 的 add-trigger 部件 background 覆盖槽。 |
| `--xh-field-array-add-bg-hover` | `add-trigger` | `background` | `hover`<br>`not([aria-disabled='true'])` | `--xh-bg-subtle-hover` | field-array 的 add-trigger 部件 background 覆盖槽。 |
| `--xh-field-array-add-border` | `add-trigger` | `border` | `default` | `--xh-border-control` | field-array 的 add-trigger 部件 border 覆盖槽。 |
| `--xh-field-array-add-border-disabled` | `add-trigger` | `border-color` | `default` | `--xh-border-subtle` | field-array 的 add-trigger 部件 border-color 覆盖槽。 |
| `--xh-field-array-add-border-hover` | `add-trigger` | `border-color` | `hover`<br>`not([aria-disabled='true'])` | `--xh-border-control-hover` | field-array 的 add-trigger 部件 border-color 覆盖槽。 |
| `--xh-field-array-add-fg` | `add-trigger` | `color` | `default` | `--xh-fg-brand` | field-array 的 add-trigger 部件 color 覆盖槽。 |
| `--xh-field-array-add-font-size` | `add-trigger` | `font-size` | `default` | `--xh-text-label-size` | field-array 的 add-trigger 部件 font-size 覆盖槽。 |
| `--xh-field-array-add-height` | `add-trigger` | `block-size` | `default` | `--xh-control-h-md` | field-array 的 add-trigger 部件 block-size 覆盖槽。 |
| `--xh-field-array-add-px` | `add-trigger` | `padding-inline` | `default` | `--xh-control-px-md` | field-array 的 add-trigger 部件 padding-inline 覆盖槽。 |
| `--xh-field-array-add-radius` | `add-trigger` | `border-radius` | `default` | `--xh-shape-control` | field-array 的 add-trigger 部件 border-radius 覆盖槽。 |
| `--xh-field-array-content-gap` | `item-content` | `gap` | `default` | `--xh-space-2` | field-array 的 item-content 部件 gap 覆盖槽。 |
| `--xh-field-array-gap` | `root` | `gap` | `default` | `--xh-space-2` | field-array 的 root 部件 gap 覆盖槽。 |
| `--xh-field-array-icon-size` | `root` | `--xh-icon-size` | `default` | `--xh-glyph-size-text` | field-array 的 root 部件 --xh-icon-size 覆盖槽。 |
| `--xh-field-array-item-delete-fg-hover` | `item-delete-trigger` | `color` | `hover`<br>`not([aria-disabled='true'])` | `--xh-fg-danger-hover` | field-array 的 item-delete-trigger 部件 color 覆盖槽。 |
| `--xh-field-array-item-gap` | `item` | `gap` | `default` | `--xh-space-2` | field-array 的 item 部件 gap 覆盖槽。 |
| `--xh-field-array-item-label-fg` | `item-label` | `color` | `default` | `--xh-fg-muted` | field-array 的 item-label 部件 color 覆盖槽。 |
| `--xh-field-array-item-label-font-size` | `item-label` | `font-size` | `default` | `--xh-text-secondary-size` | field-array 的 item-label 部件 font-size 覆盖槽。 |
| `--xh-field-array-item-padding` | `item` | `padding` | `default` | `--xh-space-0` | field-array 的 item 部件 padding 覆盖槽。 |
| `--xh-field-array-item-radius` | `item` | `border-radius` | `default` | `--xh-shape-surface` | field-array 的 item 部件 border-radius 覆盖槽。 |
| `--xh-field-array-trigger-bg` | `item-delete-trigger`<br>`move-down-trigger`<br>`move-up-trigger` | `background` | `default` | `transparent` | field-array 的 item-delete-trigger、move-down-trigger、move-up-trigger 部件 background 覆盖槽。 |
| `--xh-field-array-trigger-bg-active` | `item-delete-trigger`<br>`move-down-trigger`<br>`move-up-trigger` | `background` | `active`<br>`not([aria-disabled='true'])` | `--xh-bg-subtle-active` | field-array 的 item-delete-trigger、move-down-trigger、move-up-trigger 部件 background 覆盖槽。 |
| `--xh-field-array-trigger-bg-hover` | `item-delete-trigger`<br>`move-down-trigger`<br>`move-up-trigger` | `background` | `hover`<br>`not([aria-disabled='true'])` | `--xh-bg-subtle-hover` | field-array 的 item-delete-trigger、move-down-trigger、move-up-trigger 部件 background 覆盖槽。 |
| `--xh-field-array-trigger-fg` | `item-delete-trigger`<br>`move-down-trigger`<br>`move-up-trigger` | `color` | `default` | `--xh-fg-muted` | field-array 的 item-delete-trigger、move-down-trigger、move-up-trigger 部件 color 覆盖槽。 |
| `--xh-field-array-trigger-fg-hover` | `item-delete-trigger`<br>`move-down-trigger`<br>`move-up-trigger` | `color` | `hover`<br>`not([aria-disabled='true'])` | `--xh-fg-default` | field-array 的 item-delete-trigger、move-down-trigger、move-up-trigger 部件 color 覆盖槽。 |
| `--xh-field-array-trigger-font-size` | `item-delete-trigger`<br>`move-down-trigger`<br>`move-up-trigger` | `font-size` | `default` | `--xh-text-secondary-size` | field-array 的 item-delete-trigger、move-down-trigger、move-up-trigger 部件 font-size 覆盖槽。 |
| `--xh-field-array-trigger-radius` | `item-delete-trigger`<br>`move-down-trigger`<br>`move-up-trigger` | `border-radius` | `default` | `--xh-shape-control` | field-array 的 item-delete-trigger、move-down-trigger、move-up-trigger 部件 border-radius 覆盖槽。 |
| `--xh-field-array-trigger-size` | `item-delete-trigger`<br>`move-down-trigger`<br>`move-up-trigger` | `block-size`<br>`inline-size` | `default` | `--xh-control-action-size` | field-array 的 item-delete-trigger、move-down-trigger、move-up-trigger 部件 block-size、inline-size 覆盖槽。 |
<!-- xh-component-tokens:end -->

### 动效

`background` · `border-color` · `scale` 走 `transition` 过渡。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。

### RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像。
