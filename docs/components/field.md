# Field 表单字段

为表单控件提供标签、说明、错误信息和状态关联。

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/field" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/field.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/field" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/field" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/field.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## 用法

为控件添加标签与说明

<XhDemo src="field/01-basic" />

## 组件结构

加粗的是必需部件。

`data-scope="field"`：**`root`** · `label` · **`control`** · `description` · `error-text`

## 示例

### 必填与校验

显示字段错误

<XhDemo src="field/02-invalid" />

### 禁用

禁止编辑字段

<XhDemo src="field/03-disabled" />

### 标签左置

将标签放在控件左侧

<XhDemo src="field/04-label-left" />

## 设计指引

### 何时使用

- 表单控件需要可见标签、说明或错误信息。
- 需要统一管理必填、禁用、只读和无效状态。

### 何时不用

- 无需可见标签的紧凑控件：直接提供 `aria-label`。
- 需要管理整张表单的值和提交：使用[表单](./form)。

### 特性

- 自动关联标签、说明、错误信息与控件。
- `disabled`、`readOnly`、`invalid` 和 `required` 可传递给内部控件。
- 说明和错误信息可以同时显示。
- `FieldControl` 默认将属性合并到唯一子节点。

### 最佳实践

- 使用持续可见的明确标签。
- 说明文字简短且补充必要信息。
- 错误信息应说明如何修正。

### 反模式

- 用占位符代替标签。
- 同时手写并覆盖组件生成的 ARIA 关联。

## API 参考

### 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-field>` |
| Vue 组件 | `XhFieldControl` `XhFieldDescription` `XhFieldErrorText` `XhFieldLabel` `XhFieldRoot` |
| 组合式函数 | `useField` |
| 状态机 | 无，`connect` 直接由 props 算属性 |
| 皮肤 | `@xihan-ui/styles/field.css` |

### Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `controlId` | `string` |  | 控件 id；作者接管时以它为准。 |
| `disabled` | `boolean` |  |  |
| `invalid` | `boolean` |  | 校验失败态：控件上 aria-invalid=true，错误文案接入描述链并显出。 |
| `readOnly` | `boolean` |  | 只读：控件上 aria-readonly=true。与 disabled 不同，只读仍可聚焦、仍参与提交。 |
| `required` | `boolean` |  | 必填：控件上 aria-required=true。 |

### 插槽

仅列出带载荷的插槽。

| Vue 组件 | 插槽 | 载荷 | 说明 |
| --- | --- | --- | --- |
| `XhFieldControl` | `default` | `FieldControlSlotProps` |  |

### connect API

`getXxxProps()` 返回对应部件的宿主属性。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `invalid` | `boolean` |  |
| `required` | `boolean` |  |
| `disabled` | `boolean` |  |
| `readOnly` | `boolean` |  |
| `controlId` | `string` | 控件实际使用的 id，label 的 for 与它一致。 |
| `labelId` | `string` | 标签节点的 id。复合控件把它并进自己的名字链，字段的标签才念得到。 |
| `getRootProps` | `() => T['element']` |  |
| `getLabelProps` | `() => T['label']` |  |
| `getControlProps` | `() => T['element']` | 控件本身由作者渲染，这里只产出要合并上去的属性。 |
| `getDescriptionProps` | `() => T['element']` |  |
| `getErrorTextProps` | `() => T['element']` |  |

## 无障碍

### 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/practices/names-and-descriptions/)

无键盘交互（不接收焦点，或焦点行为完全由原生元素提供）。

### ARIA

以下属性由 `connect` 生成。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `control` | `aria-describedby` | `description` 部件的 id `error-text` 部件的 id \| `description` 部件的 id |
| `control` | `aria-invalid` | 'true' \| 'false' |
| `control` | `aria-labelledby` | `label` 部件的 id |
| `control` | `aria-readonly` | 'true' \| 'false' |
| `control` | `aria-required` | 'true' \| 'false' |
| `error-text` | `aria-atomic` | 'true' |
| `error-text` | `aria-live` | 'polite' |
| `error-text` | `role` | 'status' |

## 样式参考

### 皮肤

`@xihan-ui/styles/field.css` 使用 `[data-scope="field"][data-part="root"]` 部件选择器，位于 `xihan.components` 层。覆盖样式使用 `xihan.overrides`。

### 数据属性

由 `connect` 生成；条件不成立时不输出无值属性。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-disabled` | ''（条件成立时才出现） |
| `root` | `data-invalid` | ''（条件成立时才出现） |
| `root` | `data-readonly` | ''（条件成立时才出现） |
| `root` | `data-required` | ''（条件成立时才出现） |
| `label` | `data-disabled` | ''（条件成立时才出现） |
| `label` | `data-readonly` | ''（条件成立时才出现） |
| `control` | `data-disabled` | ''（条件成立时才出现） |
| `control` | `data-invalid` | ''（条件成立时才出现） |
| `control` | `data-readonly` | ''（条件成立时才出现） |
| `description` | `data-disabled` | ''（条件成立时才出现） |

<!-- xh-component-tokens:start -->
### CSS 变量

本组件公开覆盖槽由独立皮肤的实际消费位生成；缺省来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 缺省来源 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `--xh-field-control-bg` | `control` | `background` | `default` | `--xh-bg-canvas` | field 的 control 部件 background 覆盖槽。 |
| `--xh-field-control-bg-disabled` | `control` | `background` | `disabled` | `--xh-bg-subtle` | field 的 control 部件 background 覆盖槽。 |
| `--xh-field-control-border` | `control` | `border` | `default` | `--xh-border-control` | field 的 control 部件 border 覆盖槽。 |
| `--xh-field-control-border-focus` | `control` | `border-color` | `focus-visible` | `--xh-_tone` | field 的 control 部件 border-color 覆盖槽。 |
| `--xh-field-control-border-invalid` | `control` | `border-color` | `invalid` | `--xh-border-invalid` | field 的 control 部件 border-color 覆盖槽。 |
| `--xh-field-control-fg` | `control` | `color` | `default` | `--xh-fg-default` | field 的 control 部件 color 覆盖槽。 |
| `--xh-field-control-font-size` | `control` | `font-size` | `default` | `--xh-text-body-size` | field 的 control 部件 font-size 覆盖槽。 |
| `--xh-field-control-h` | `control`<br>`label`<br>`root` | `block-size`<br>`padding-block` | `default`<br>`layout=horizontal` | `--xh-control-h-md` | field 的 control、label、root 部件 block-size、padding-block 覆盖槽。 |
| `--xh-field-control-px` | `control` | `padding-inline` | `default` | `--xh-control-px-md` | field 的 control 部件 padding-inline 覆盖槽。 |
| `--xh-field-control-radius` | `control` | `border-radius` | `default` | `--xh-shape-control` | field 的 control 部件 border-radius 覆盖槽。 |
| `--xh-field-description-fg` | `description` | `color` | `default` | `--xh-fg-muted` | field 的 description 部件 color 覆盖槽。 |
| `--xh-field-description-fg-disabled` | `description` | `color` | `disabled` | `--xh-fg-subtle` | field 的 description 部件 color 覆盖槽。 |
| `--xh-field-description-font-size` | `description` | `font-size` | `default` | `--xh-text-secondary-size` | field 的 description 部件 font-size 覆盖槽。 |
| `--xh-field-error-fg` | `error-text` | `color` | `default` | `--xh-fg-danger` | field 的 error-text 部件 color 覆盖槽。 |
| `--xh-field-error-font-size` | `description`<br>`error-text`<br>`root` | `block-size`<br>`font-size` | `default`<br>`has(> [data-scope='field'][data-part='error-text'][hidden])`<br>`not(:has(> [data-scope='field'][data-part='description']:not([hidden])` | `--xh-text-secondary-size` | field 的 description、error-text、root 部件 block-size、font-size 覆盖槽。 |
| `--xh-field-gap` | `label`<br>`root` | `gap`<br>`margin-block-end` | `default` | `--xh-space-1` | field 的 label、root 部件 gap、margin-block-end 覆盖槽。 |
| `--xh-field-label-fg` | `label` | `color` | `default` | `--xh-fg-default` | field 的 label 部件 color 覆盖槽。 |
| `--xh-field-label-fg-disabled` | `label` | `color` | `disabled` | `--xh-fg-subtle` | field 的 label 部件 color 覆盖槽。 |
| `--xh-field-label-font-size` | `label`<br>`root` | `font-size`<br>`padding-block` | `default`<br>`layout=horizontal` | `--xh-text-label-size` | field 的 label、root 部件 font-size、padding-block 覆盖槽。 |
| `--xh-field-label-font-weight` | `label` | `font-weight` | `default` | `--xh-text-label-weight` | field 的 label 部件 font-weight 覆盖槽。 |
| `--xh-field-label-gap` | `root` | `column-gap` | `layout=horizontal` | `--xh-space-3` | field 的 root 部件 column-gap 覆盖槽。 |
| `--xh-field-label-gap-block` | `label` | `margin-block-end` | `default` | `--xh-field-gap` | field 的 label 部件 margin-block-end 覆盖槽。 |
| `--xh-field-label-leading` | `label`<br>`root` | `line-height`<br>`padding-block` | `layout=horizontal` | `--xh-leading-normal` | field 的 label、root 部件 line-height、padding-block 覆盖槽。 |
| `--xh-field-label-star` | `label`<br>`root` | `color` | `required` | `--xh-fg-danger` | field 的 label、root 部件 color 覆盖槽。 |
<!-- xh-component-tokens:end -->

### 动效

`background` · `border-color` · `color` 走 `transition` 过渡。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。

### RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像。
