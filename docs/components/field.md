# 表单字段 <Badge type="info" text="field" />

把标签、控件、说明与错误文本绑成一组，并把 `id` 与 ARIA 关联接好。

## 何时使用

- 任何一个需要标签的表单控件——这是所有录入组件的外壳。
- 需要说明文字或错误提示与控件正确关联时。

## 何时不用

- 控件在工具栏或表格里、没有可见标签：给控件本身写 `aria-label`。
- 需要整表的值管理与校验：外面再套[表单](./form)，字段只管一格。

## 特性

- 标签的 `for`、说明与错误文本的 `aria-describedby`、无效态的 `aria-invalid` 全部自动接上，作者不写 `id`。
- `disabled` / `readOnly` / `invalid` / `required` 沿字段流给里面的控件。
- 有错误文本时说明文字不会被顶掉，两者可以同时在。
- 默认把接线属性合到控件槽里唯一的子节点上，这条只适用于「子节点的根就是可聚焦控件」。控件藏在薄封装里时关掉 asChild，由封装内部自取——标签的 for 只对可标注元素生效，指到封装的根上会静默失效。

## 示例

### 基础用法

控件由自己写，Field 只把属性并上去：标题的 for、控件的 id 与描述链（aria-describedby）自动对齐

<XhDemo src="field/01-basic" />

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

## CSS 变量

本组件皮肤读的组件级令牌，写在组件自身或任意祖先上都生效。缺省值来自[设计令牌](../guide/theme)，不设即按缺省走。

`--xh-field-control-bg` · `--xh-field-control-bg-disabled` · `--xh-field-control-border` · `--xh-field-control-border-focus` · `--xh-field-control-border-invalid` · `--xh-field-control-fg` · `--xh-field-control-font-size` · `--xh-field-control-h` · `--xh-field-control-px` · `--xh-field-control-radius` · `--xh-field-description-fg` · `--xh-field-description-fg-disabled` · `--xh-field-description-font-size` · `--xh-field-error-fg` · `--xh-field-error-font-size` · `--xh-field-gap` · `--xh-field-label-fg` · `--xh-field-label-fg-disabled` · `--xh-field-label-font-size` · `--xh-field-label-font-weight` · `--xh-field-label-gap` · `--xh-field-label-leading` · `--xh-field-label-star`

## 动效

状态切换走 `transition`。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

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
