来源：https://ui.docs.xihanfun.com/components/editable

# Editable 就地编辑 `alpha`

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

```vue
<script setup lang="ts">
import {
  XhEditableCancelTrigger,
  XhEditableControl,
  XhEditableEditTrigger,
  XhEditableInput,
  XhEditableLabel,
  XhEditablePreview,
  XhEditableRoot,
  XhEditableSubmitTrigger,
} from "@xihan-ui/vue";
</script>

<template>
  <XhEditableRoot default-value="曦寒" placeholder="未填写">
    <XhEditableLabel>昵称</XhEditableLabel>
    <XhEditableControl>
      <XhEditablePreview />
      <XhEditableInput />
      <XhEditableEditTrigger>编辑</XhEditableEditTrigger>
      <XhEditableSubmitTrigger>保存</XhEditableSubmitTrigger>
      <XhEditableCancelTrigger>取消</XhEditableCancelTrigger>
    </XhEditableControl>
  </XhEditableRoot>
</template>
```

```html
<xh-editable default-value="曦寒" placeholder="未填写">
  <div data-xh-part="root">
    <label data-xh-part="label">昵称</label>
    <div data-xh-part="control">
      <span data-xh-part="preview"></span>
      <input data-xh-part="input" />
      <button data-xh-part="edit-trigger">编辑</button>
      <button data-xh-part="submit-trigger">保存</button>
      <button data-xh-part="cancel-trigger">取消</button>
    </div>
  </div>
</xh-editable>
```

## 组件结构

加粗的是必需部件。

`data-scope="editable"`：**`root`** · `label` · `control` · **`preview`** · **`input`** · `edit-trigger` · `submit-trigger` · `cancel-trigger`

## 示例

### 提交方式

使用失焦或回车提交

```vue
<script setup lang="ts">
import {
  XhEditableCancelTrigger,
  XhEditableControl,
  XhEditableEditTrigger,
  XhEditableInput,
  XhEditableLabel,
  XhEditablePreview,
  XhEditableRoot,
  XhEditableSubmitTrigger,
} from "@xihan-ui/vue";
</script>

<template>
  <XhEditableRoot
    default-value="失焦即提交"
    placeholder="未填写"
    submit-mode="blur"
  >
    <XhEditableLabel>submitMode = blur</XhEditableLabel>
    <XhEditableControl>
      <XhEditablePreview />
      <XhEditableInput />
      <XhEditableEditTrigger>编辑</XhEditableEditTrigger>
      <XhEditableSubmitTrigger>保存</XhEditableSubmitTrigger>
      <XhEditableCancelTrigger>取消</XhEditableCancelTrigger>
    </XhEditableControl>
  </XhEditableRoot>

  <XhEditableRoot
    default-value="回车才提交"
    placeholder="未填写"
    submit-mode="enter"
  >
    <XhEditableLabel>submitMode = enter</XhEditableLabel>
    <XhEditableControl>
      <XhEditablePreview />
      <XhEditableInput />
      <XhEditableEditTrigger>编辑</XhEditableEditTrigger>
      <XhEditableSubmitTrigger>保存</XhEditableSubmitTrigger>
      <XhEditableCancelTrigger>取消</XhEditableCancelTrigger>
    </XhEditableControl>
  </XhEditableRoot>
</template>
```

```html
<xh-editable default-value="失焦即提交" placeholder="未填写" submit-mode="blur">
  <div data-xh-part="root">
    <label data-xh-part="label">submitMode = blur</label>
    <div data-xh-part="control">
      <span data-xh-part="preview"></span>
      <input data-xh-part="input" />
      <button data-xh-part="edit-trigger">编辑</button>
      <button data-xh-part="submit-trigger">保存</button>
      <button data-xh-part="cancel-trigger">取消</button>
    </div>
  </div>
</xh-editable>

<xh-editable default-value="回车才提交" placeholder="未填写" submit-mode="enter">
  <div data-xh-part="root">
    <label data-xh-part="label">submitMode = enter</label>
    <div data-xh-part="control">
      <span data-xh-part="preview"></span>
      <input data-xh-part="input" />
      <button data-xh-part="edit-trigger">编辑</button>
      <button data-xh-part="submit-trigger">保存</button>
      <button data-xh-part="cancel-trigger">取消</button>
    </div>
  </div>
</xh-editable>
```

### 状态

禁用、只读与空值

```vue
<script setup lang="ts">
import {
  XhEditableControl,
  XhEditableEditTrigger,
  XhEditableInput,
  XhEditableLabel,
  XhEditablePreview,
  XhEditableRoot,
} from "@xihan-ui/vue";
</script>

<template>
  <XhEditableRoot default-value="改不动" placeholder="未填写" disabled>
    <XhEditableLabel>禁用</XhEditableLabel>
    <XhEditableControl>
      <XhEditablePreview />
      <XhEditableInput />
      <XhEditableEditTrigger>编辑</XhEditableEditTrigger>
    </XhEditableControl>
  </XhEditableRoot>

  <XhEditableRoot default-value="只能看" placeholder="未填写" read-only>
    <XhEditableLabel>只读</XhEditableLabel>
    <XhEditableControl>
      <XhEditablePreview />
      <XhEditableInput />
      <XhEditableEditTrigger>编辑</XhEditableEditTrigger>
    </XhEditableControl>
  </XhEditableRoot>

  <XhEditableRoot placeholder="未填写">
    <XhEditableLabel>空值占位</XhEditableLabel>
    <XhEditableControl>
      <XhEditablePreview />
      <XhEditableInput />
      <XhEditableEditTrigger>编辑</XhEditableEditTrigger>
    </XhEditableControl>
  </XhEditableRoot>
</template>
```

```html
<xh-editable default-value="改不动" placeholder="未填写" disabled>
  <div data-xh-part="root">
    <label data-xh-part="label">禁用</label>
    <div data-xh-part="control">
      <span data-xh-part="preview"></span>
      <input data-xh-part="input" />
      <button data-xh-part="edit-trigger">编辑</button>
    </div>
  </div>
</xh-editable>

<xh-editable default-value="只能看" placeholder="未填写" read-only>
  <div data-xh-part="root">
    <label data-xh-part="label">只读</label>
    <div data-xh-part="control">
      <span data-xh-part="preview"></span>
      <input data-xh-part="input" />
      <button data-xh-part="edit-trigger">编辑</button>
    </div>
  </div>
</xh-editable>

<xh-editable placeholder="未填写">
  <div data-xh-part="root">
    <label data-xh-part="label">空值占位</label>
    <div data-xh-part="control">
      <span data-xh-part="preview"></span>
      <input data-xh-part="input" />
      <button data-xh-part="edit-trigger">编辑</button>
    </div>
  </div>
</xh-editable>
```

### 变体

设置编辑框外观

```vue
<script setup lang="ts">
import {
  XhEditableCancelTrigger,
  XhEditableControl,
  XhEditableEditTrigger,
  XhEditableInput,
  XhEditableLabel,
  XhEditablePreview,
  XhEditableRoot,
  XhEditableSubmitTrigger,
} from "@xihan-ui/vue";
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 12px">
    <XhEditableRoot
      v-for="row in [
        { variant: 'outline', label: '描边' },
        { variant: 'subtle', label: '浅色' },
        { variant: 'ghost', label: '幽灵' },
      ]"
      :key="row.label"
      :variant="row.variant"
      default-value="曦寒"
      placeholder="未填写"
    >
      <XhEditableLabel>{{ row.label }}</XhEditableLabel>
      <XhEditableControl>
        <XhEditablePreview />
        <XhEditableInput />
        <XhEditableEditTrigger>编辑</XhEditableEditTrigger>
        <XhEditableSubmitTrigger>保存</XhEditableSubmitTrigger>
        <XhEditableCancelTrigger>取消</XhEditableCancelTrigger>
      </XhEditableControl>
    </XhEditableRoot>
  </div>
</template>
```

```html
<div style="display: flex; flex-direction: column; gap: 12px">
  <xh-editable variant="outline" default-value="曦寒" placeholder="未填写">
    <div data-xh-part="root">
      <label data-xh-part="label">描边</label>
      <div data-xh-part="control">
        <span data-xh-part="preview"></span>
        <input data-xh-part="input" />
        <button data-xh-part="edit-trigger">编辑</button>
        <button data-xh-part="submit-trigger">保存</button>
        <button data-xh-part="cancel-trigger">取消</button>
      </div>
    </div>
  </xh-editable>

  <xh-editable variant="subtle" default-value="曦寒" placeholder="未填写">
    <div data-xh-part="root">
      <label data-xh-part="label">浅色</label>
      <div data-xh-part="control">
        <span data-xh-part="preview"></span>
        <input data-xh-part="input" />
        <button data-xh-part="edit-trigger">编辑</button>
        <button data-xh-part="submit-trigger">保存</button>
        <button data-xh-part="cancel-trigger">取消</button>
      </div>
    </div>
  </xh-editable>

  <xh-editable variant="ghost" default-value="曦寒" placeholder="未填写">
    <div data-xh-part="root">
      <label data-xh-part="label">幽灵</label>
      <div data-xh-part="control">
        <span data-xh-part="preview"></span>
        <input data-xh-part="input" />
        <button data-xh-part="edit-trigger">编辑</button>
        <button data-xh-part="submit-trigger">保存</button>
        <button data-xh-part="cancel-trigger">取消</button>
      </div>
    </div>
  </xh-editable>

</div>
```

## 设计指引

### 何时使用

- 编辑标题、昵称或简短备注。
- 在列表和表格中快速修改单个值。

### 何时不用

- 一次修改多个字段：使用表单或[对话框](./dialog)。
- 值需要复杂校验或多步确认。

### 特性

- `submitMode` 设置回车、失焦或显式按钮提交。
- `activationMode` 设置单击、双击或按钮激活。
- 支持提交、取消、受控值和受控编辑状态。
- `autoResize` 让输入框随内容调整宽度。

### 最佳实践

- 为展示态提供清晰的可编辑提示。
- 保持预览态和编辑态高度一致。
- 保留 Escape 取消并还原原值。

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
| `value` | `string` |  | 受控值；给了就由宿主说了算，机器不自改（cell 原生受控，无影子事件）。 |
| `defaultValue` | `string` |  | 非受控初值。 |
| `edit` | `boolean` |  | 受控编辑态；给了就由宿主说了算，用户交互只发 onEditChange。 |
| `defaultEdit` | `boolean` |  | 非受控初始编辑态。为真时挂载即进编辑态并把焦点搬进输入框。 |
| `placeholder` | `string` |  | 值为空时预览区显示它，输入框也拿它当占位。 |
| `disabled` | `boolean` |  | 禁用：进不了编辑态，输入框带原生 disabled。 |
| `readOnly` | `boolean` |  | 只读：进不了编辑态，但已在编辑态时仍能退出（撤销/提交都通）。 |
| `invalid` | `boolean` |  | 校验失败标注。 |
| `maxLength` | `number` |  | 字符数上限；同时落成原生 maxlength 与机器侧截断。 |
| `name` | `string` |  | 表单字段名；给了输入框才参与提交。 |
| `submitMode` | `EditableSubmitMode` |  | 编辑态的收尾方式，默认 both。 |
| `activationMode` | `EditableActivationMode` |  | 预览区的激活方式，默认 click。 |
| `selectOnFocus` | `boolean` |  | 进编辑态时全选已有内容，默认开。关掉则光标停在原处。 |
| `autoResize` | `boolean` |  | 输入框宽度跟着内容走：连接层把字符数落成原生 size 属性。 |
| `variant` | `ControlVariant` |  | 形态：outline / subtle / ghost，决定编辑态输入框的底与描边怎么画。 |
| `tone` | `Tone` |  | 语气：brand / neutral / success / warning / danger / info，决定聚焦描边与提交钮用哪族颜色。 |
| `size` | `Size` |  | 尺寸：sm / md / lg，决定预览区、输入框与三颗按钮的几何档位。 |
| `onValueChange` | `(details: EditableValueChangeDetails) => void` |  | 值变化意图回调；编辑途中每次输入都发，受控时是唯一出口。 |
| `onValueCommit` | `(details: EditableValueCommitDetails) => void` |  | 提交那一刻才发；编辑途中的输入不会惊动它。 |
| `onValueRevert` | `(details: EditableValueRevertDetails) => void` |  | 撤销那一刻发（Escape、取消按钮、不算提交的离场）。 |
| `onEditChange` | `(details: EditableEditChangeDetails) => void` |  | 编辑态变化意图回调；受控时是唯一出口，非受控随内部转移一并通知。 |

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
| `value` | `string` | 当下的值（编辑途中就是输入框里的那串）。 |
| `committedValue` | `string` | 上一次提交的值，也是撤销的落点。 |
| `editing` | `boolean` | 正处在编辑态。 |
| `empty` | `boolean` | 值为空串。 |
| `displayValue` | `string` | 预览区当下该显示的文字：值为空时退回 placeholder。 |
| `disabled` | `boolean` |  |
| `readOnly` | `boolean` |  |
| `invalid` | `boolean` |  |
| `interactive` | `boolean` | 进得了编辑态（既没禁用也不只读）。 |
| `setValue` | `(next: string) => void` | 直接写值，只受 disabled/readOnly 与 maxLength 约束，与编辑态无关。 |
| `edit` | `() => void` | 进编辑态；禁用或只读时不动。 |
| `submit` | `() => void` | 提交当下的值并回到预览态。 |
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

本组件公开覆盖槽由独立皮肤的实际消费位生成；缺省来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 缺省来源 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `--xh-editable-control-gap` | `control` | `gap` | `default` | `--xh-space-1` | editable 的 control 部件 gap 覆盖槽。 |
| `--xh-editable-control-min-h` | `control` | `min-block-size` | `default` | `--xh-_editable-h` | editable 的 control 部件 min-block-size 覆盖槽。 |
| `--xh-editable-control-min-w` | `control` | `min-inline-size` | `default` | `6ch` | editable 的 control 部件 min-inline-size 覆盖槽。 |
| `--xh-editable-gap` | `root` | `gap` | `default` | `--xh-space-2` | editable 的 root 部件 gap 覆盖槽。 |
| `--xh-editable-input-autofill-bg` | `input` | `box-shadow` | `-webkit-autofill`<br>`autofill` | `--xh-bg-canvas` | editable 的 input 部件 box-shadow 覆盖槽。 |
| `--xh-editable-input-autofill-fg` | `input` | `-webkit-text-fill-color` | `-webkit-autofill`<br>`autofill` | `--xh-fg-default` | editable 的 input 部件 -webkit-text-fill-color 覆盖槽。 |
| `--xh-editable-input-bg` | `input` | `background` | `default`<br>`hover`<br>`invalid`<br>`not(:disabled, [readonly], [data-invalid])` | `--xh-_editable-input-bg` | editable 的 input 部件 background 覆盖槽。 |
| `--xh-editable-input-bg-disabled` | `input` | `background` | `disabled` | `--xh-bg-subtle` | editable 的 input 部件 background 覆盖槽。 |
| `--xh-editable-input-bg-hover` | `input` | `background` | `hover`<br>`invalid`<br>`not(:disabled, [readonly], [data-invalid])` | `--xh-bg-subtle` | editable 的 input 部件 background 覆盖槽。 |
| `--xh-editable-input-bg-readonly` | `input` | `background` | `default` | `--xh-bg-subtle` | editable 的 input 部件 background 覆盖槽。 |
| `--xh-editable-input-border` | `input` | `border` | `default` | `--xh-_editable-input-border` | editable 的 input 部件 border 覆盖槽。 |
| `--xh-editable-input-border-focus` | `input` | `border-color` | `focus-visible` | `--xh-_tone` | editable 的 input 部件 border-color 覆盖槽。 |
| `--xh-editable-input-border-hover` | `input` | `border-color` | `hover`<br>`invalid`<br>`not(:disabled, [readonly], [data-invalid])` | `--xh-_editable-input-border-hover` | editable 的 input 部件 border-color 覆盖槽。 |
| `--xh-editable-input-border-invalid` | `input` | `border-color` | `invalid` | `--xh-border-invalid` | editable 的 input 部件 border-color 覆盖槽。 |
| `--xh-editable-input-fg` | `input` | `color` | `default` | `--xh-fg-default` | editable 的 input 部件 color 覆盖槽。 |
| `--xh-editable-input-font-size` | `input` | `font-size` | `default` | `--xh-_editable-font-size` | editable 的 input 部件 font-size 覆盖槽。 |
| `--xh-editable-input-h` | `input` | `block-size` | `default` | `--xh-_editable-h` | editable 的 input 部件 block-size 覆盖槽。 |
| `--xh-editable-input-px` | `input` | `padding-inline` | `default` | `--xh-_editable-px` | editable 的 input 部件 padding-inline 覆盖槽。 |
| `--xh-editable-input-radius` | `input` | `border-radius` | `default` | `--xh-shape-control` | editable 的 input 部件 border-radius 覆盖槽。 |
| `--xh-editable-input-shadow` | `input` | `box-shadow` | `-webkit-autofill`<br>`autofill`<br>`default` | `--xh-_editable-input-shadow`<br>`--xh-elevation-raised` | editable 的 input 部件 box-shadow 覆盖槽。 |
| `--xh-editable-label-fg` | `label` | `color` | `default` | `--xh-fg-default` | editable 的 label 部件 color 覆盖槽。 |
| `--xh-editable-label-fg-disabled` | `label` | `color` | `disabled` | `--xh-fg-subtle` | editable 的 label 部件 color 覆盖槽。 |
| `--xh-editable-label-font-size` | `label` | `font-size` | `default` | `--xh-_editable-label-font-size` | editable 的 label 部件 font-size 覆盖槽。 |
| `--xh-editable-label-font-weight` | `label` | `font-weight` | `default` | `--xh-text-label-weight` | editable 的 label 部件 font-weight 覆盖槽。 |
| `--xh-editable-placeholder-fg` | `input`<br>`preview` | `color` | `placeholder` | `--xh-fg-subtle` | editable 的 input、preview 部件 color 覆盖槽。 |
| `--xh-editable-preview-bg-hover` | `preview` | `background` | `activation-mode=none`<br>`disabled`<br>`hover`<br>`not([data-activation-mode='none'], [data-disabled], [data-readonly])`<br>`readonly` | `--xh-bg-subtle-hover` | editable 的 preview 部件 background 覆盖槽。 |
| `--xh-editable-preview-fg` | `preview` | `color` | `default` | `--xh-fg-default` | editable 的 preview 部件 color 覆盖槽。 |
| `--xh-editable-preview-font-size` | `preview` | `font-size` | `default` | `--xh-_editable-font-size` | editable 的 preview 部件 font-size 覆盖槽。 |
| `--xh-editable-preview-min-h` | `preview` | `min-block-size` | `default` | `--xh-_editable-h` | editable 的 preview 部件 min-block-size 覆盖槽。 |
| `--xh-editable-preview-px` | `preview` | `padding-inline` | `default` | `--xh-_editable-px` | editable 的 preview 部件 padding-inline 覆盖槽。 |
| `--xh-editable-preview-radius` | `preview` | `border-radius` | `default` | `--xh-shape-control` | editable 的 preview 部件 border-radius 覆盖槽。 |
| `--xh-editable-submit-bg` | `submit-trigger` | `background` | `not(:disabled)` | `--xh-_tone` | editable 的 submit-trigger 部件 background 覆盖槽。 |
| `--xh-editable-submit-bg-active` | `submit-trigger` | `background`<br>`border-color` | `active`<br>`not(:disabled)` | `--xh-_tone-active` | editable 的 submit-trigger 部件 background、border-color 覆盖槽。 |
| `--xh-editable-submit-bg-hover` | `submit-trigger` | `background`<br>`border-color` | `hover`<br>`not(:disabled)` | `--xh-_tone-hover` | editable 的 submit-trigger 部件 background、border-color 覆盖槽。 |
| `--xh-editable-submit-border` | `submit-trigger` | `border-color` | `not(:disabled)` | `--xh-_tone` | editable 的 submit-trigger 部件 border-color 覆盖槽。 |
| `--xh-editable-submit-border-active` | `submit-trigger` | `border-color` | `active`<br>`not(:disabled)` | `--xh-editable-submit-bg-active` | editable 的 submit-trigger 部件 border-color 覆盖槽。 |
| `--xh-editable-submit-border-hover` | `submit-trigger` | `border-color` | `hover`<br>`not(:disabled)` | `--xh-editable-submit-bg-hover` | editable 的 submit-trigger 部件 border-color 覆盖槽。 |
| `--xh-editable-submit-fg` | `submit-trigger` | `color` | `not(:disabled)` | `--xh-_tone-on` | editable 的 submit-trigger 部件 color 覆盖槽。 |
| `--xh-editable-submit-shadow` | `submit-trigger` | `box-shadow` | `not(:disabled)` | `--xh-_editable-submit-highlight` | editable 的 submit-trigger 部件 box-shadow 覆盖槽。 |
| `--xh-editable-trigger-bg` | `cancel-trigger`<br>`edit-trigger`<br>`submit-trigger` | `background` | `default` | `--xh-bg-subtle` | editable 的 cancel-trigger、edit-trigger、submit-trigger 部件 background 覆盖槽。 |
| `--xh-editable-trigger-bg-active` | `cancel-trigger`<br>`edit-trigger`<br>`submit-trigger` | `background` | `active`<br>`not(:disabled)` | `--xh-bg-subtle-active` | editable 的 cancel-trigger、edit-trigger、submit-trigger 部件 background 覆盖槽。 |
| `--xh-editable-trigger-bg-disabled` | `cancel-trigger`<br>`edit-trigger`<br>`submit-trigger` | `background` | `disabled` | `--xh-bg-muted` | editable 的 cancel-trigger、edit-trigger、submit-trigger 部件 background 覆盖槽。 |
| `--xh-editable-trigger-bg-hover` | `cancel-trigger`<br>`edit-trigger`<br>`submit-trigger` | `background` | `hover`<br>`not(:disabled)` | `--xh-bg-subtle-hover` | editable 的 cancel-trigger、edit-trigger、submit-trigger 部件 background 覆盖槽。 |
| `--xh-editable-trigger-border` | `cancel-trigger`<br>`edit-trigger`<br>`submit-trigger` | `border` | `default` | `--xh-border-control` | editable 的 cancel-trigger、edit-trigger、submit-trigger 部件 border 覆盖槽。 |
| `--xh-editable-trigger-border-disabled` | `cancel-trigger`<br>`edit-trigger`<br>`submit-trigger` | `border-color` | `disabled` | `--xh-border-subtle` | editable 的 cancel-trigger、edit-trigger、submit-trigger 部件 border-color 覆盖槽。 |
| `--xh-editable-trigger-border-hover` | `cancel-trigger`<br>`edit-trigger`<br>`submit-trigger` | `border-color` | `hover`<br>`not(:disabled)` | `--xh-border-control-hover` | editable 的 cancel-trigger、edit-trigger、submit-trigger 部件 border-color 覆盖槽。 |
| `--xh-editable-trigger-fg` | `cancel-trigger`<br>`edit-trigger`<br>`submit-trigger` | `color` | `default` | `--xh-fg-default` | editable 的 cancel-trigger、edit-trigger、submit-trigger 部件 color 覆盖槽。 |
| `--xh-editable-trigger-font-size` | `cancel-trigger`<br>`edit-trigger`<br>`submit-trigger` | `font-size` | `default` | `--xh-text-secondary-size` | editable 的 cancel-trigger、edit-trigger、submit-trigger 部件 font-size 覆盖槽。 |
| `--xh-editable-trigger-h` | `cancel-trigger`<br>`edit-trigger`<br>`submit-trigger` | `block-size` | `default` | `--xh-control-h-sm` | editable 的 cancel-trigger、edit-trigger、submit-trigger 部件 block-size 覆盖槽。 |
| `--xh-editable-trigger-px` | `cancel-trigger`<br>`edit-trigger`<br>`submit-trigger` | `padding-inline` | `default` | `--xh-control-px-sm` | editable 的 cancel-trigger、edit-trigger、submit-trigger 部件 padding-inline 覆盖槽。 |
| `--xh-editable-trigger-radius` | `cancel-trigger`<br>`edit-trigger`<br>`submit-trigger` | `border-radius` | `default` | `--xh-shape-control` | editable 的 cancel-trigger、edit-trigger、submit-trigger 部件 border-radius 覆盖槽。 |
<!-- xh-component-tokens:end -->

### 动效

`background` · `border-color` · `box-shadow` · `scale` 走 `transition` 过渡。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。

### RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像。
