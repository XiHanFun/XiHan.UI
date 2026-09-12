# FieldArray <Badge type="info" text="字段数组" />

一组行数可变的录入行：可以加一行、删一行、换顺序。

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/field-array" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/field-array.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/field-array" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/field-array" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/field-array.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## 用法

加一行、删一行归组件管；行里放什么控件归作者，写在 item-content 里

<XhDemo src="field-array/01-basic" />

## 组件结构

加粗的是必需部件。

`data-scope="field-array"`：**`root`** · `item` · `item-label` · `item-content` · `item-action` · `add-trigger` · `item-delete-trigger` · `move-up-trigger` · `move-down-trigger`

## 示例

### 行数上下限

到 min 删除把手按不动、到 max 新增把手按不动；两者都转 aria-disabled，焦点留得住

<XhDemo src="field-array/02-min-max" />

### 换序

movable 开了才出上下把手；挪完焦点跟着这一行走，键盘可以连按一路挪到底

<XhDemo src="field-array/03-movable" />

### 一行多个字段

行数据是对象，createItem 造一个空项；改字段时整份重建数组，行号不跟着变

<XhDemo src="field-array/04-object-rows" />

### 禁用与程序化操作

禁用时三类把手全按不动；从外面加一条走同一条闸门，整份替换值则不受闸门约束

<XhDemo src="field-array/05-disabled-and-api" />

## 设计指引

### 何时使用

- 联系方式、规格参数、收件人这类"数量由用户决定"的重复字段。

### 何时不用

- 行数固定：直接写几行。
- 每一行是一个短词：用[标签输入](./tags-input)。

### 特性

- `min` / `max` 约束行数，到下限时删除按钮不可用。
- `movable` 给出上移下移。
- `createItem` 决定新增一行时的初值。
- 一行里可以放多个字段。
- `name` 是 `FormPath`。嵌套在 Form 里时自动读取该路径的数组值，每行经 `item.name`
  拿到显式数组路径；点号与方括号从不被猜成层级。
- 在 Form 内新增、删除、换序会一并迁移该数组子字段的 values、rules、errors、异步
  validation 与已验证错误标记；字符串字段绝不参与数组下标迁移。
- `readOnly` 让行数改不动，`invalid` 把校验状态传到每一行。
- `item-label` 承载行前的行号或名目。

### 组合

- 每行里放[表单字段](./field)与各类录入组件；整体放进[表单](./form)。

### 最佳实践

- 新增一行后把焦点移到这一行的第一个输入框。
- 删除按钮要说明删的是哪一行（`aria-label` 带上行号或内容）。

### 反模式

- 删除不给撤销，误删只能重填。
- 行数上限只在提交时才提示。

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
