# Field <Badge type="info" text="表单字段" />

把标签、控件、说明与错误文本绑成一组，并把 `id` 与 ARIA 关联接好。

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/field" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/field.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/field" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/field" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/field.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## 用法

控件由自己写，Field 只把属性并上去：标题的 for、控件的 id 与描述链（aria-describedby）自动对齐

<XhDemo src="field/01-basic" />

## 示例

### 无效与必填

invalid 一翻，错误文案接入描述链并显出，控件上同时落 aria-invalid；required 只落 aria-required，校验仍归宿主

<XhDemo src="field/02-invalid" />

### 禁用

Field 的 disabled 只把 data-disabled 铺到各部件上；真正改不动还得在自己的控件上落原生 disabled

<XhDemo src="field/03-disabled" />

### 标签左置

各部件都是独立节点，把根节点改成两列网格就能把标题挪到控件左边，说明与错误文案跟着对齐到控件那一列

<XhDemo src="field/04-label-left" />

### 字段横排

一行里摆多个字段：每个字段自成一块，谁跟谁排一行是外层容器的事

<XhDemo src="field/05-inline" />

### 提示、警告与错误

三档语气各归各的部件：提示与警告都写在描述里，控件的 aria-invalid 保持 false；只有真出错才翻 invalid、错误文案才接进描述链

<XhDemo src="field/06-warning" />

### 控件在薄封装里

封装的根不是可聚焦元素时，关掉 asChild、让封装内部用 useFieldControl 自取

<XhDemo src="field/07-wrapper" />

## 设计指引

### 何时使用

- 任何一个需要标签的表单控件——这是所有录入组件的外壳。
- 需要说明文字或错误提示与控件正确关联时。

### 何时不用

- 控件在工具栏或表格里、没有可见标签：给控件本身写 `aria-label`。
- 需要整表的值管理与校验：外面再套[表单](./form)，字段只管一格。

### 特性

- 标签的 `for`、说明与错误文本的 `aria-describedby`、无效态的 `aria-invalid` 全部自动接上，作者不写 `id`。
- `disabled` / `readOnly` / `invalid` / `required` 沿字段流给里面的控件。控件实例没写才继承；
  显式 `false` 顶掉最近的 Field/Form 状态。TextField 收到后会把行为与 ARIA 写到真正的 input，
  不只停在包装根。
- 有错误文本时说明文字不会被顶掉，两者可以同时在。
- 默认把接线属性合到控件槽里唯一的子节点上，这条只适用于「子节点的根就是可聚焦控件」。控件藏在薄封装里时关掉 asChild，由封装内部自取——标签的 for 只对可标注元素生效，指到封装的根上会静默失效。
- `FieldControl` 的默认 `asChild` 必须提供唯一可挂载子节点，允许包在 Fragment 中；零节点、多个节点或并列非空文本明确报错，不再静默丢失标签和 ARIA 接线。需要手工组织多个节点时显式设置 `asChild=false`，并通过插槽载荷或 `useFieldControl` 绑定真控件。

## 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-field>` |
| Vue 组件 | `XhFieldControl` `XhFieldDescription` `XhFieldErrorText` `XhFieldLabel` `XhFieldRoot` |
| 组合式函数 | `useField` |
| 状态机 | 无，`connect` 直接由 props 算属性 |
| 皮肤 | `@xihan-ui/styles/field.css` |

## 解剖

部件名即 `data-part` 属性值，也是皮肤的选择器。加粗的是必备部件，不渲染它组件不工作（Web Components 适配器会在诊断通道上报 `wc.missing-part`）。

`data-scope="field"`：**`root`** · `label` · **`control`** · `description` · `error-text`

## Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `controlId` | `string` |  | 控件 id；作者接管时以它为准。 |
| `disabled` | `boolean` |  |  |
| `invalid` | `boolean` |  | 校验失败态：控件上 aria-invalid=true，错误文案接入描述链并显出。 |
| `readOnly` | `boolean` |  | 只读：控件上 aria-readonly=true。与 disabled 不同，只读仍可聚焦、仍参与提交。 |
| `required` | `boolean` |  | 必填：控件上 aria-required=true。 |

## 插槽

作者能拿到载荷的插槽。只转发内容、不带载荷的默认插槽不在此列——那类直接写子节点即可。

| Vue 组件 | 插槽 | 载荷 | 说明 |
| --- | --- | --- | --- |
| `XhFieldControl` | `default` | `FieldControlSlotProps` |  |

## connect API

`useField` 产出的对象。`getXxxProps()` 铺到对应部件的宿主元素上，其余是可读状态与操作入口。

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

## 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/practices/names-and-descriptions/)

无键盘交互（不接收焦点，或焦点行为完全由原生元素提供）。

## 无障碍

下面这些由 `connect` 铺到部件上，作者不必自己写；重复写反而会覆盖掉正确值。

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

## 样式

默认皮肤 `@xihan-ui/styles/field.css` 按部件选择：`[data-scope="field"][data-part="root"]`。它落在 `xihan.components` 层；业务样式不写进 `@layer` 即高于全部库层，要按层压过来就写进 `xihan.overrides`。

## 数据属性

由 `connect` 产出并铺到部件上，皮肤与测试都据此选择；`data-disabled` 这类无值属性在条件不成立时整个不出现。

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
## CSS 变量

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

## 动效

`background` · `border-color` · `color` 走 `transition` 过渡。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。

## RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像。

## 组合

- 里面放任何一个录入组件；外面用[栅格](./grid)排成两列。

## 最佳实践

- 标签写完整的名词短语，别写占位符当标签——占位符一输入就消失。
- 错误文本说清楚怎么改，不只说"格式不对"。

## 反模式

- 用占位符代替标签。
- 自己手写 `aria-describedby`，与组件生成的那份互相覆盖。
