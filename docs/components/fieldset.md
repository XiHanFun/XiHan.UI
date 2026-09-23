# Fieldset 字段集

把若干相关字段收成一组，组标题由 `legend` 提供，禁用与无效沿这一组下发。

根节点是原生 `<fieldset>`：整组禁用只需写一个属性，浏览器会停用组内所有表单控件。这是本组件存在的理由，换成 `<div>` 只剩一层灰色样式。

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/fieldset" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/fieldset.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/fieldset" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/fieldset" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/fieldset.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## 用法

一组字段收进原生 fieldset：legend 是该组的名字，说明文案自动派生 id 并接入 aria-describedby

<XhDemo src="fieldset/01-basic" />

## 组件结构

加粗的是必需部件。

`data-scope="fieldset"`：**`root`** · **`legend`** · `description` · `field-group` · `actions` · `error-text`

## 示例

### 整组禁用

disabled 写为原生 fieldset[disabled]，组内每个控件一并禁用，不必逐个写 disabled

<XhDemo src="fieldset/02-disabled" />

### 无效态

invalid 切换后，错误文案接入描述链并显示；它带 role=alert，切换时读屏立即播报

<XhDemo src="fieldset/03-invalid" />

### 必填标记

required 写为 data-required，皮肤据此为组标题加星号；星号只是视觉冗余，必填这一信息要一并写进文案

<XhDemo src="fieldset/04-required" />

### 总开关放进 legend

按 HTML 规范，首个 legend 中的控件不受 fieldset[disabled] 连带影响，总开关因此始终可点击

<XhDemo src="fieldset/05-legend-switch" />

## 设计指引

### 何时使用

- 表单中有几段主题相同的字段（收货信息、发票抬头、通知偏好），需要一个组标题。
- 需要一次禁用一整段字段，而不是逐个控件写 `disabled`。
- 一组单选或复选选项需要共用一个问句作为组名。

### 何时不用

- 只有一个控件加一个标签时，使用[表单字段](./field)；字段负责单个控件，字段集负责一组。
- 需要整表的值管理与校验时，外层使用[表单](./form)，字段集只负责分组。
- 只在视觉上分段、没有共同的组名与禁用语义时，使用[分隔线](./separator)或[卡片](./card)。

### 特性

- `disabled` 落为原生 `fieldset[disabled]`，组内控件不可聚焦、不可编辑、不参与提交，不需要逐个控件接线。
- 说明文字与错误文案自动派生 `id` 并接入根节点的 `aria-describedby`，作者不需要写 `id`。
- 错误文案带 `role="status"` + `aria-live="polite"`，节点常驻、通过 `hidden` 显隐，`invalid` 翻转时读屏排队播报，不打断当前朗读。整表提交失败时的打断式播报只由 Form 的错误摘要发出。
- `invalid` 落为根与组标题上的 `data-invalid`，组标题据此转为警示色，同时把错误文案接入描述链并显示。
- `required` 落为根与组标题上的 `data-required`，组标题的星号由 label 公共层按组标题自己的这一位画。
- `field-group` 把并排的几个字段圈成一段（宽度足够时自动分栏），`actions` 承载组末尾的按钮行。
- `disabled` 只作用于原生表单控件：组内 `div` 型控件（滑块、评分等）需要各自接 `disabled`。

### 组合

- 内部按顺序放若干[表单字段](./field)，每个字段自行管理标签与错误文案。
- 一组单选放[单选组](./radio-group)、一组多选放[复选框组](./checkbox-group)。这两个组仍要写自己的 `label` 部件：字段集的标题命名的是外层这一段，内层的组需要自己的名称，legend 不会向下传递。
- 外层放[表单](./form)统一收集值与校验，字段集只承担分组与整段禁用。

### 最佳实践

- 组标题写成可读通的名词短语或问句（“通知方式”而不是“选项”），读屏进组时读的就是它。
- 整段停用优先写在字段集上，不逐个控件写 `disabled`，避免遗漏。
- 错误文案说明整组哪里不满足（“至少填写一种联系方式”），单个字段的错误留给该字段。

### 反模式

- 用 `<div>` 替代字段集：禁用不再联动，读屏也无法识别为一组。
- 把 `<legend>` 移到中间或包一层容器：它不是首个子节点时就不再是组名。
- 只用一条分割线和一行加粗文字表示分组：视觉上像一组，无障碍树中仍是分散的。
- 一个字段集内放入多个互不相关的主题，标题只能写成“其他”。
- 开启 `invalid` 却不渲染错误文案：屏幕上只有组标题变色，读屏用户无法得知这一组有问题。

## API 参考

### 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-fieldset>` |
| Vue 组件 | `XhFieldsetActions` `XhFieldsetDescription` `XhFieldsetErrorText` `XhFieldsetFieldGroup` `XhFieldsetLegend` `XhFieldsetRoot` |
| 组合式函数 | `useFieldset` |
| 状态机 | 无，`connect` 直接由 props 算属性 |
| 皮肤 | `@xihan-ui/styles/fieldset.css` |

### Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `disabled` | `boolean` |  | 整组禁用。root 是原生 `&lt;fieldset&gt;`，该条落为原生 disabled 属性， 浏览器会把组内每个表单控件一并禁用（首个 `&lt;legend&gt;` 中的控件按 HTML 规范除外）。 |
| `invalid` | `boolean` |  | 校验失败态：root 上写 data-invalid，错误文案接入描述链并显示。 |
| `required` | `boolean` |  | 必填标记：落为 data-required，供皮肤给组标题加星号，校验仍由宿主负责。 不产出 aria-required：该属性在 group 角色上不受支持，写入也不进入无障碍树。 |
| `translations` | `Partial<FieldsetTranslations>` |  | 文案覆盖。本组件当前没有外露文案，保留该位，接全局配置的通道由适配器铺设。 |

### React 适配器 props

只列各组件自己声明的那些：继承自 `ComponentPropsWithRef` 的 DOM 属性不在其中，根组件上与上面 Props 表同名的也不重复列。Vue 的对应物是上面的插槽表。

| React 组件 | 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- | --- |
| `XhFieldsetRoot` | `children` | `ReactNode` |  |  |

### connect API

`getXxxProps()` 返回对应部件的宿主属性。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `disabled` | `boolean` |  |
| `invalid` | `boolean` |  |
| `required` | `boolean` |  |
| `getRootProps` | `() => T['element']` |  |
| `getLegendProps` | `() => T['element']` |  |
| `getDescriptionProps` | `() => T['element']` |  |
| `getFieldGroupProps` | `() => T['element']` | 把并排的几个字段划为一段；纯排版，不承担分组语义（组名与描述归 root）。 |
| `getActionsProps` | `() => T['element']` | 组末尾的按钮行；纯排版。 |
| `getErrorTextProps` | `() => T['element']` |  |

## 无障碍

### 键盘

规格出处：[W3C APG](https://html.spec.whatwg.org/multipage/form-elements.html#the-fieldset-element)

无键盘交互（不接收焦点，或焦点行为完全由原生元素提供）。

### ARIA

以下属性由 `connect` 生成。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `aria-describedby` | `description` 部件的 id `error-text` 部件的 id \| `description` 部件的 id |
| `error-text` | `aria-atomic` | 'true' |
| `error-text` | `aria-live` | 'polite' |
| `error-text` | `role` | 'status' |

- 组名来自原生 `<legend>`，它必须是 `<fieldset>` 的首个子节点，否则浏览器不将其视为组名。
- 组标题不另发 `aria-labelledby`：多一份名称来源会与原生名称叠加，读屏会读两遍。
- 根节点不产出 `aria-invalid` / `aria-required`：这两个属性在 `group` 角色上不受支持，写了也不进入无障碍树；无效与必填的读屏出口是错误文案与描述链。
- 只要 `invalid` 可能为真，就必须渲染错误文案部件。它是该状态唯一的读屏出口：组标题变色只是视觉提示，无障碍树不会变化。
- 必填要写进组标题的可见文字或说明文案（“通知方式（必填）”“以下三项至少填一项”）。皮肤的星号是 CSS 生成内容，用户自定义样式表关闭 `content` 或读屏不朗读生成内容时它不存在，只能作为视觉冗余。
- 按 HTML 规范，首个 `<legend>` 内的控件不受 `fieldset[disabled]` 影响。需要让某个开关在整组停用时仍可操作（例如“启用本段”的总开关），把它放进 `<legend>`。

## 样式参考

### 皮肤

`@xihan-ui/styles/fieldset.css` 使用 `[data-scope="fieldset"][data-part="root"]` 部件选择器，位于 `xihan.components` 层。覆盖样式使用 `xihan.overrides`。

### 数据属性

由 `connect` 生成；条件不成立时不输出无值属性。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-disabled` | ''（条件成立时才出现） |
| `root` | `data-invalid` | ''（条件成立时才出现） |
| `root` | `data-required` | ''（条件成立时才出现） |
| `legend` | `data-disabled` | ''（条件成立时才出现） |
| `legend` | `data-invalid` | ''（条件成立时才出现） |
| `legend` | `data-required` | ''（条件成立时才出现） |
| `description` | `data-disabled` | ''（条件成立时才出现） |
| `field-group` | `data-disabled` | ''（条件成立时才出现） |
| `actions` | `data-disabled` | ''（条件成立时才出现） |

<!-- xh-component-tokens:start -->
### CSS 变量

本组件公开覆盖槽由独立皮肤的实际消费位生成；默认来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 默认来源 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `--xh-fieldset-actions-gap` | `actions` | `gap` | `default` | `--xh-space-2` | fieldset 的 actions 部件 gap 覆盖槽。 |
| `--xh-fieldset-description-fg` | `description` | `color` | `default` | `--xh-fg-muted` | fieldset 的 description 部件 color 覆盖槽。 |
| `--xh-fieldset-description-fg-disabled` | `description` | `color` | `disabled` | `--xh-fg-subtle` | fieldset 的 description 部件 color 覆盖槽。 |
| `--xh-fieldset-description-font-size` | `description` | `font-size` | `default` | `--xh-text-secondary-size` | fieldset 的 description 部件 font-size 覆盖槽。 |
| `--xh-fieldset-error-fg` | `error-text` | `color` | `default` | `--xh-fg-danger` | fieldset 的 error-text 部件 color 覆盖槽。 |
| `--xh-fieldset-error-font-size` | `error-text` | `font-size` | `default` | `--xh-text-secondary-size` | fieldset 的 error-text 部件 font-size 覆盖槽。 |
| `--xh-fieldset-field-group-col-w` | `field-group` | `grid-template-columns` | `default` | `--xh-layout-col-min-sm` | fieldset 的 field-group 部件 grid-template-columns 覆盖槽。 |
| `--xh-fieldset-field-group-gap` | `field-group` | `gap` | `default` | `--xh-space-3` | fieldset 的 field-group 部件 gap 覆盖槽。 |
| `--xh-fieldset-gap` | `root` | `gap` | `default` | `--xh-space-4` | fieldset 的 root 部件 gap 覆盖槽。 |
| `--xh-fieldset-legend-fg` | `legend` | `color` | `default` | `--xh-fg-muted` | fieldset 的 legend 部件 color 覆盖槽。 |
| `--xh-fieldset-legend-fg-disabled` | `legend`<br>`root` | `color` | `disabled` | `--xh-fg-subtle` | fieldset 的 legend、root 部件 color 覆盖槽。 |
| `--xh-fieldset-legend-fg-invalid` | `legend` | `color` | `invalid` | `--xh-fg-danger` | fieldset 的 legend 部件 color 覆盖槽。 |
| `--xh-fieldset-legend-font-size` | `legend` | `font-size` | `default` | `--xh-text-label-size` | fieldset 的 legend 部件 font-size 覆盖槽。 |
| `--xh-fieldset-legend-font-weight` | `legend` | `font-weight` | `default` | `--xh-text-label-weight` | fieldset 的 legend 部件 font-weight 覆盖槽。 |
| `--xh-fieldset-legend-gap` | `legend` | `margin-block-end` | `default` | `--xh-space-2` | fieldset 的 legend 部件 margin-block-end 覆盖槽。 |
| `--xh-fieldset-legend-star` | `legend` | `color` | `required` | `--xh-fg-danger` | fieldset 的 legend 部件 color 覆盖槽。 |
<!-- xh-component-tokens:end -->

### 动效

`color` 走 `transition` 过渡。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。
