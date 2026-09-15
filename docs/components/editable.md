# Editable 就地编辑 <Badge type="info" text="alpha" />

用于在当前位置查看和编辑短文本。

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/editable" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/editable.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/editable" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/editable" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/editable.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## 用法

点击文本就地编辑

<XhDemo src="editable/01-basic" />

## 组件结构

加粗的是必需部件。

`data-scope="editable"`：**`root`** · `label` · `control` · **`preview`** · **`input`** · `edit-trigger` · `submit-trigger` · `cancel-trigger`

## 示例

### 提交方式

使用失焦或回车提交

<XhDemo src="editable/02-submit-mode" />

### 状态

禁用、只读与空值

<XhDemo src="editable/03-disabled" />

### 变体

设置编辑框外观

<XhDemo src="editable/04-variant-tone" />

## 设计指引

### 何时使用

- 编辑标题、昵称或简短备注。
- 在列表和表格中快速修改单个值。

### 何时不用

- 一次修改多个字段时，使用表单或[对话框](./dialog)。
- 值需要复杂校验或多步确认。

### 特性

- `submitMode` 设置回车、失焦或显式按钮提交。
- `activationMode` 设置单击、双击或按钮激活。
- 支持提交、取消、受控值和受控编辑状态。
- `autoResize` 让输入框随内容调整宽度。
- 标题在上；预览文字或输入框与右侧动作组共用一个字段边框和背景，不把动作按钮挂在编辑框外。预览态只显示编辑按钮，编辑态只显示确认与取消按钮。
- 三个动作使用图标呈现：编辑、确认、取消；图标按钮必须提供可访问名称。

### 组合

- 常放在[列表](./list)、[表格](./table)单元格或[页头](./page-header)标题中，就地修改一个值。
- 三个动作按钮可替换为自定义[图标](./icon)；需要修改多个字段时改用[表单](./form)加[对话框](./dialog)。

### 最佳实践

- 为展示态提供清晰的可编辑提示。
- 保持预览态和编辑态高度一致。
- 保留 Escape 取消并还原原值。
- 使用空按钮时由皮肤绘制默认图标，并通过 `aria-label` 写明编辑、确认与取消。

### 反模式

- 使用失焦提交但不提供取消方式。
- 用就地编辑处理长文本或复杂表单。

## API 参考

### 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-editable>` |
| Vue 组件 | `XhEditableCancelTrigger` `XhEditableControl` `XhEditableEditTrigger` `XhEditableInput` `XhEditableLabel` `XhEditablePreview` `XhEditableRoot` `XhEditableSubmitTrigger` |
| 组合式函数 | `useEditable` |
| 状态机 | `editableMachine` |
| 皮肤 | `@xihan-ui/styles/editable.css` |

### Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `value` | `string` |  | 受控值；提供后由宿主决定，状态机不自行修改（cell 原生受控，无影子事件）。 |
| `defaultValue` | `string` |  | 非受控初值。 |
| `edit` | `boolean` |  | 受控编辑态；提供后由宿主决定，用户交互只发 onEditChange。 |
| `defaultEdit` | `boolean` |  | 非受控初始编辑态。为真时挂载即进入编辑态并把焦点移入输入框。 |
| `placeholder` | `string` |  | 值为空时预览区显示它，输入框也将其用作占位。 |
| `disabled` | `boolean` |  | 禁用：无法进入编辑态，输入框带原生 disabled。 |
| `readOnly` | `boolean` |  | 只读：无法进入编辑态，但已在编辑态时仍能退出（撤销 / 提交都可用）。 |
| `invalid` | `boolean` |  | 校验失败标注。 |
| `maxLength` | `number` |  | 字符数上限；同时落为原生 maxlength 与状态机侧截断。 |
| `name` | `string` |  | 表单字段名；提供后输入框才参与提交。 |
| `submitMode` | `EditableSubmitMode` |  | 编辑态的收尾方式，默认 both。 |
| `activationMode` | `EditableActivationMode` |  | 预览区的激活方式，默认 click。 |
| `selectOnFocus` | `boolean` |  | 进入编辑态时全选已有内容，默认开启。关闭则光标停在原处。 |
| `autoResize` | `boolean` |  | 输入框宽度跟随内容：连接层把字符数写为原生 size 属性。 |
| `variant` | `ControlVariant` |  | 形态：outline / subtle / ghost，决定预览态与编辑态共用 control 的底色与描边。 |
| `tone` | `Tone` |  | 语气：brand / neutral / success / warning / danger / info，决定 control 的聚焦描边与焦点环颜色。 |
| `size` | `Size` |  | 尺寸：sm / md / lg，决定 control、预览区、输入框与三个动作按钮的几何档位。 |
| `onValueChange` | `(details: EditableValueChangeDetails) => void` |  | 值变化意图回调；编辑途中每次输入都发出，受控时是唯一出口。 |
| `onValueCommit` | `(details: EditableValueCommitDetails) => void` |  | 提交时才发出；编辑途中的输入不触发它。 |
| `onValueRevert` | `(details: EditableValueRevertDetails) => void` |  | 撤销时发出（Escape、取消按钮、不视为提交的离场）。 |
| `onEditChange` | `(details: EditableEditChangeDetails) => void` |  | 编辑态变化意图回调；受控时是唯一出口，非受控时随内部转移一并通知。 |

### 事件

自定义元素将载荷放在 `detail`；Vue 使用同名 emit。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `value-change` | `EditableValueChangeDetails` | 编辑途中的值变化；detail 为 `{ value: string }` |
| `value-commit` | `EditableValueCommitDetails` | 提交；detail 为 `{ value: string, previousValue: string }` |
| `value-revert` | `EditableValueRevertDetails` | 撤销；detail 为 `{ value: string, discardedValue: string }` |
| `edit-change` | `EditableEditChangeDetails` | 编辑态变化；detail 为 `{ edit: boolean }` |

### 插槽

仅列出带载荷的插槽。

| Vue 组件 | 插槽 | 载荷 | 说明 |
| --- | --- | --- | --- |
| `XhEditableRoot` | `default` | `EditableRootSlotProps` |  |

### 状态

公开状态写入 `data-state`。

| 部件 | 取值 |
| --- | --- |
| `root` | 'edit' \| 'preview' |
| `label` | 'edit' \| 'preview' |
| `control` | 'edit' \| 'preview' |
| `preview` | 'edit' \| 'preview' |
| `input` | 'edit' \| 'preview' |
| `edit-trigger` | 'edit' \| 'preview' |
| `submit-trigger` | 'edit' \| 'preview' |
| `cancel-trigger` | 'edit' \| 'preview' |

以下名称仅用于内部状态机。

**状态**：`preview` · `edit`

**事件**：`EDIT.START` · `EDIT.SUBMIT` · `EDIT.CANCEL` · `EDIT.LEAVE` · `VALUE.SET` · `CONTROLLED.EDIT` · `CONTROLLED.PREVIEW` · `FORM.RESET`

**判据**：`isEditControlled` · `canEdit` · `submitsOnLeave`

### connect API

`getXxxProps()` 返回对应部件的宿主属性。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `value` | `string` | 当前的值（编辑途中即输入框中的内容）。 |
| `committedValue` | `string` | 上一次提交的值，也是撤销的落点。 |
| `editing` | `boolean` | 处于编辑态。 |
| `empty` | `boolean` | 值为空串。 |
| `displayValue` | `string` | 预览区当前应显示的文字：值为空时回退为 placeholder。 |
| `disabled` | `boolean` |  |
| `readOnly` | `boolean` |  |
| `invalid` | `boolean` |  |
| `interactive` | `boolean` | 可以进入编辑态（既未禁用也不只读）。 |
| `setValue` | `(next: string) => void` | 直接写值，只受 disabled / readOnly 与 maxLength 约束，与编辑态无关。 |
| `edit` | `() => void` | 进入编辑态；禁用或只读时不生效。 |
| `submit` | `() => void` | 提交当前的值并回到预览态。 |
| `cancel` | `() => void` | 撤销回上一次提交的值并回到预览态。 |
| `getRootProps` | `() => T['element']` |  |
| `getLabelProps` | `() => T['label']` |  |
| `getPreviewProps` | `() => T['element']` |  |
| `getInputProps` | `() => T['input']` |  |
| `getEditTriggerProps` | `() => T['button']` |  |
| `getSubmitTriggerProps` | `() => T['button']` |  |
| `getCancelTriggerProps` | `() => T['button']` |  |
| `getControlProps` | `() => T['element']` |  |

## 无障碍

### 键盘

规格出处：[W3C APG](https://html.spec.whatwg.org/multipage/input.html#text-(type=text)-state-and-search-state-(type=search))

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `Enter` | focus in input, submitMode 为 enter 或 both | 提交当下的值并回到预览态；其余模式不接管该键，交回给浏览器与外层表单 |
| `Escape` | focus in input | 撤销回上一次提交的值并回到预览态 |
| `Tab` / `Shift+Tab` | focus in input | 按 submitMode 收尾（blur/both 提交，enter/none 撤销）；不拦默认行为，焦点照常移出 |

### ARIA

以下属性由 `connect` 生成。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `aria-labelledby` | `label` 部件的 id |
| `root` | `role` | 'group' |
| `preview` | `aria-disabled` | 'true' \| 'false' |
| `input` | `aria-invalid` | 'true' \| 'false' |
| `input` | `aria-labelledby` | `label` 部件的 id |
| `edit-trigger` | `aria-controls` | `input` 部件的 id |

## 样式参考

### 皮肤

`@xihan-ui/styles/editable.css` 使用 `[data-scope="editable"][data-part="root"]` 部件选择器，位于 `xihan.components` 层。覆盖样式使用 `xihan.overrides`。

### 数据属性

由 `connect` 生成；条件不成立时不输出无值属性。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-disabled` | ''（条件成立时才出现） |
| `root` | `data-empty` | ''（条件成立时才出现） |
| `root` | `data-invalid` | ''（条件成立时才出现） |
| `root` | `data-readonly` | ''（条件成立时才出现） |
| `root` | `data-size` | props.size |
| `root` | `data-state` | 'edit' \| 'preview' |
| `root` | `data-tone` | props.tone |
| `root` | `data-variant` | props.variant |
| `label` | `data-disabled` | ''（条件成立时才出现） |
| `label` | `data-state` | 'edit' \| 'preview' |
| `control` | `data-disabled` | ''（条件成立时才出现） |
| `control` | `data-invalid` | ''（条件成立时才出现） |
| `control` | `data-state` | 'edit' \| 'preview' |
| `preview` | `data-activation-mode` | props.activationMode |
| `preview` | `data-disabled` | ''（条件成立时才出现） |
| `preview` | `data-invalid` | ''（条件成立时才出现） |
| `preview` | `data-placeholder` | ''（条件成立时才出现） |
| `preview` | `data-readonly` | ''（条件成立时才出现） |
| `preview` | `data-state` | 'edit' \| 'preview' |
| `input` | `data-auto-resize` | ''（条件成立时才出现） |
| `input` | `data-disabled` | ''（条件成立时才出现） |
| `input` | `data-invalid` | ''（条件成立时才出现） |
| `input` | `data-state` | 'edit' \| 'preview' |
| `edit-trigger` | `data-disabled` | ''（条件成立时才出现） |
| `edit-trigger` | `data-state` | 'edit' \| 'preview' |
| `submit-trigger` | `data-disabled` | ''（条件成立时才出现） |
| `submit-trigger` | `data-state` | 'edit' \| 'preview' |
| `cancel-trigger` | `data-disabled` | ''（条件成立时才出现） |
| `cancel-trigger` | `data-state` | 'edit' \| 'preview' |

<!-- xh-component-tokens:start -->
### CSS 变量

本组件公开覆盖槽由独立皮肤的实际消费位生成；默认来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 默认来源 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `--xh-editable-control-bg` | `control` | `background` | `default` | `--xh-_editable-control-bg` | editable 的 control 部件 background 覆盖槽。 |
| `--xh-editable-control-bg-disabled` | `control` | `background` | `disabled` | `--xh-bg-subtle` | editable 的 control 部件 background 覆盖槽。 |
| `--xh-editable-control-bg-focus` | `control` | `background` | `disabled`<br>`focus-within`<br>`not([data-disabled])` | `--xh-_editable-control-bg-focus` | editable 的 control 部件 background 覆盖槽。 |
| `--xh-editable-control-bg-hover` | `control` | `background` | `disabled`<br>`hover`<br>`invalid`<br>`not([data-disabled], [data-invalid])` | `--xh-_editable-control-bg-hover` | editable 的 control 部件 background 覆盖槽。 |
| `--xh-editable-control-bg-invalid` | `control` | `background` | `invalid` | `--xh-_editable-control-bg-focus` | editable 的 control 部件 background 覆盖槽。 |
| `--xh-editable-control-bg-readonly` | `control`<br>`root` | `background` | `readonly` | `--xh-bg-subtle` | editable 的 control、root 部件 background 覆盖槽。 |
| `--xh-editable-control-border` | `control`<br>`root` | `border`<br>`border-color` | `default`<br>`readonly` | `--xh-_editable-control-border` | editable 的 control、root 部件 border、border-color 覆盖槽。 |
| `--xh-editable-control-border-disabled` | `control` | `border-color` | `disabled` | `--xh-border-subtle` | editable 的 control 部件 border-color 覆盖槽。 |
| `--xh-editable-control-border-focus` | `control` | `border-color` | `disabled`<br>`focus-within`<br>`not([data-disabled])` | `--xh-_editable-control-border-focus` | editable 的 control 部件 border-color 覆盖槽。 |
| `--xh-editable-control-border-hover` | `control` | `border-color` | `disabled`<br>`hover`<br>`invalid`<br>`not([data-disabled], [data-invalid])` | `--xh-_editable-control-border-hover` | editable 的 control 部件 border-color 覆盖槽。 |
| `--xh-editable-control-border-invalid` | `control` | `border-color` | `invalid` | `--xh-border-invalid` | editable 的 control 部件 border-color 覆盖槽。 |
| `--xh-editable-control-gap` | `control` | `gap` | `default` | `--xh-_editable-control-gap` | editable 的 control 部件 gap 覆盖槽。 |
| `--xh-editable-control-h` | `control` | `block-size` | `default` | `--xh-_editable-h` | editable 的 control 部件 block-size 覆盖槽。 |
| `--xh-editable-control-min-w` | `control`<br>`root` | `min-inline-size` | `default` | `--xh-control-min-w` | editable 的 control、root 部件 min-inline-size 覆盖槽。 |
| `--xh-editable-control-radius` | `control` | `border-radius` | `default` | `--xh-shape-control` | editable 的 control 部件 border-radius 覆盖槽。 |
| `--xh-editable-control-shadow` | `control` | `box-shadow` | `default` | `--xh-_editable-control-shadow` | editable 的 control 部件 box-shadow 覆盖槽。 |
| `--xh-editable-gap` | `root` | `gap` | `default` | `--xh-space-1` | editable 的 root 部件 gap 覆盖槽。 |
| `--xh-editable-icon-size` | `root` | `--xh-icon-size` | `default`<br>`size=lg`<br>`size=sm` | `--xh-glyph-size-lg`<br>`--xh-glyph-size-md`<br>`--xh-glyph-size-sm` | editable 的 root 部件 --xh-icon-size 覆盖槽。 |
| `--xh-editable-input-autofill-bg` | `input` | `box-shadow` | `-webkit-autofill`<br>`autofill` | `--xh-bg-canvas` | editable 的 input 部件 box-shadow 覆盖槽。 |
| `--xh-editable-input-autofill-fg` | `input` | `-webkit-text-fill-color` | `-webkit-autofill`<br>`autofill` | `--xh-fg-default` | editable 的 input 部件 -webkit-text-fill-color 覆盖槽。 |
| `--xh-editable-input-fg` | `input` | `color` | `default` | `--xh-fg-default` | editable 的 input 部件 color 覆盖槽。 |
| `--xh-editable-input-font-size` | `input` | `font-size` | `default` | `--xh-_editable-font-size` | editable 的 input 部件 font-size 覆盖槽。 |
| `--xh-editable-input-h` | `input` | `block-size` | `default` | `--xh-_editable-h` | editable 的 input 部件 block-size 覆盖槽。 |
| `--xh-editable-input-px` | `input` | `padding-inline` | `default` | `--xh-_editable-px` | editable 的 input 部件 padding-inline 覆盖槽。 |
| `--xh-editable-label-fg` | `label` | `color` | `default` | `--xh-fg-default` | editable 的 label 部件 color 覆盖槽。 |
| `--xh-editable-label-fg-disabled` | `label` | `color` | `disabled` | `--xh-fg-subtle` | editable 的 label 部件 color 覆盖槽。 |
| `--xh-editable-label-font-size` | `label` | `font-size` | `default` | `--xh-_editable-label-font-size` | editable 的 label 部件 font-size 覆盖槽。 |
| `--xh-editable-label-font-weight` | `label` | `font-weight` | `default` | `--xh-text-label-weight` | editable 的 label 部件 font-weight 覆盖槽。 |
| `--xh-editable-placeholder-fg` | `input`<br>`preview` | `color` | `placeholder` | `--xh-fg-subtle` | editable 的 input、preview 部件 color 覆盖槽。 |
| `--xh-editable-preview-fg` | `preview` | `color` | `default` | `--xh-fg-default` | editable 的 preview 部件 color 覆盖槽。 |
| `--xh-editable-preview-font-size` | `preview` | `font-size` | `default` | `--xh-_editable-font-size` | editable 的 preview 部件 font-size 覆盖槽。 |
| `--xh-editable-preview-min-h` | `preview` | `min-block-size` | `default` | `--xh-_editable-h` | editable 的 preview 部件 min-block-size 覆盖槽。 |
| `--xh-editable-preview-px` | `preview` | `padding-inline` | `default` | `--xh-_editable-px` | editable 的 preview 部件 padding-inline 覆盖槽。 |
| `--xh-editable-touch-target-size` | `cancel-trigger`<br>`control`<br>`edit-trigger`<br>`submit-trigger` | `min-block-size`<br>`min-inline-size` | `@media (pointer: coarse)` | `--xh-control-box-lg` | editable 的 cancel-trigger、control、edit-trigger、submit-trigger 部件 min-block-size、min-inline-size 覆盖槽。 |
| `--xh-editable-trigger-bg` | `cancel-trigger`<br>`edit-trigger`<br>`submit-trigger` | `background` | `default` | `transparent` | editable 的 cancel-trigger、edit-trigger、submit-trigger 部件 background 覆盖槽。 |
| `--xh-editable-trigger-bg-active` | `cancel-trigger`<br>`edit-trigger`<br>`submit-trigger` | `background` | `active`<br>`not(:disabled)` | `--xh-_editable-trigger-bg-active` | editable 的 cancel-trigger、edit-trigger、submit-trigger 部件 background 覆盖槽。 |
| `--xh-editable-trigger-bg-disabled` | `cancel-trigger`<br>`edit-trigger`<br>`submit-trigger` | `background` | `disabled` | `transparent` | editable 的 cancel-trigger、edit-trigger、submit-trigger 部件 background 覆盖槽。 |
| `--xh-editable-trigger-bg-hover` | `cancel-trigger`<br>`edit-trigger`<br>`submit-trigger` | `background` | `hover`<br>`not(:disabled)` | `transparent` | editable 的 cancel-trigger、edit-trigger、submit-trigger 部件 background 覆盖槽。 |
| `--xh-editable-trigger-divider` | `edit-trigger`<br>`submit-trigger` | `border-inline-start` | `default` | `--xh-material-soft-separator` | editable 的 edit-trigger、submit-trigger 部件 border-inline-start 覆盖槽。 |
| `--xh-editable-trigger-divider-h` | `edit-trigger`<br>`submit-trigger` | `block-size`<br>`inset-block-start` | `default` | `--xh-_editable-divider-h` | editable 的 edit-trigger、submit-trigger 部件 block-size、inset-block-start 覆盖槽。 |
| `--xh-editable-trigger-fg` | `cancel-trigger`<br>`edit-trigger`<br>`submit-trigger` | `color` | `default` | `--xh-fg-default` | editable 的 cancel-trigger、edit-trigger、submit-trigger 部件 color 覆盖槽。 |
| `--xh-editable-trigger-fg-hover` | `cancel-trigger`<br>`edit-trigger`<br>`submit-trigger` | `color` | `hover`<br>`not(:disabled)` | `--xh-fg-default` | editable 的 cancel-trigger、edit-trigger、submit-trigger 部件 color 覆盖槽。 |
| `--xh-editable-trigger-font-size` | `cancel-trigger`<br>`edit-trigger`<br>`submit-trigger` | `font-size` | `default` | `--xh-text-secondary-size` | editable 的 cancel-trigger、edit-trigger、submit-trigger 部件 font-size 覆盖槽。 |
| `--xh-editable-trigger-size` | `cancel-trigger`<br>`edit-trigger`<br>`submit-trigger` | `block-size`<br>`inline-size` | `default` | `--xh-_editable-trigger-size` | editable 的 cancel-trigger、edit-trigger、submit-trigger 部件 block-size、inline-size 覆盖槽。 |
<!-- xh-component-tokens:end -->

### 动效

`background` · `border-color` · `outline-color` · `scale` 走 `transition` 过渡。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。

### 响应式

皮肤另按输入能力分档：`pointer: coarse`：同一份皮肤在触屏与带指针的设备上不一样，与视口宽度无关。

### RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像。
