# 就地编辑 <Badge type="info" text="editable" />

一段文本平时是只读的展示，点一下就地变成输入框。

## 何时使用

- 标题、备注这类偶尔才改的单值，不值得为它单开一个表单。
- 表格单元格的快速修改。

## 何时不用

- 一次要改很多字段：打开表单或[对话框](./dialog)。
- 值需要复杂校验或多步确认。

## 特性

- `submitMode` 决定回车、失焦还是显式按钮提交。
- `activationMode` 决定单击、双击还是只能按编辑按钮进编辑态。
- 三个回调分开：提交、还原、编辑态变化。
- `autoResize` 让输入框跟着内容长。

## 示例

### 基础用法

预览与编辑两态轮流上场：点预览区或按「编辑」进编辑态，preview 不写内容、显示什么由组件填

<XhDemo src="editable/01-basic" />

### 提交方式

submitMode 决定编辑态怎么收尾，不算提交的那些出口一律按撤销处理，值还回上一次提交的那个

<XhDemo src="editable/02-submit-mode" />

### 受控

value 与 edit 都能受控，传了就由宿主说了算，用户交互只发出意图；外部按钮同样进得了编辑态

<XhDemo src="editable/03-controlled" />

### 禁用与只读

两者都进不了编辑态；值为空时预览区退回压淡的占位文字

<XhDemo src="editable/04-disabled" />

### 表格里的单元格

一格一个就地编辑：点开就是输入框，收尾即写回行数据；autoResize 让输入框按内容宽窄走，不把列撑变形

<XhDemo src="editable/05-table-cell" />

### 整表进出编辑态

edit 受控就由宿主统一调度：一个开关把整张表切进编辑，放弃时宿主拿自己留的底稿还原

<XhDemo src="editable/06-switchable" />

## 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-editable>` |
| Vue 组件 | `XhEditableArea` `XhEditableCancelTrigger` `XhEditableControl` `XhEditableEditTrigger` `XhEditableInput` `XhEditableLabel` `XhEditablePreview` `XhEditableRoot` `XhEditableSubmitTrigger` |
| 组合式函数 | `useEditable` |
| 状态机 | `editableMachine` |
| 皮肤 | `@xihan-ui/styles/editable.css` |

## 解剖

部件名即 `data-part` 属性值，也是皮肤的选择器。加粗的是必备部件，不渲染它组件不工作（Web Components 适配器会在诊断通道上报 `wc.missing-part`）。

`data-scope="editable"`：**`root`** · `label` · `area` · **`preview`** · **`input`** · `edit-trigger` · `submit-trigger` · `cancel-trigger` · `control`

## Props

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
| `onValueChange` | `(details: EditableValueChangeDetails) => void` |  | 值变化意图回调；编辑途中每次输入都发，受控时是唯一出口。 |
| `onValueCommit` | `(details: EditableValueCommitDetails) => void` |  | 提交那一刻才发；编辑途中的输入不会惊动它。 |
| `onValueRevert` | `(details: EditableValueRevertDetails) => void` |  | 撤销那一刻发（Escape、取消按钮、不算提交的离场）。 |
| `onEditChange` | `(details: EditableEditChangeDetails) => void` |  | 编辑态变化意图回调；受控时是唯一出口，非受控随内部转移一并通知。 |

## 事件

自定义元素派发这些事件，Vue 组件对应同名 emit；载荷都在 `detail` 上。可双向绑定的值另有 `update:xxx`，见 Props。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `value-change` | `EditableValueChangeDetails` | 编辑途中的值变化；detail 为 `{ value: string }` |
| `value-commit` | `EditableValueCommitDetails` | 提交；detail 为 `{ value: string, previousValue: string }` |
| `value-revert` | `EditableValueRevertDetails` | 撤销；detail 为 `{ value: string, discardedValue: string }` |
| `edit-change` | `EditableEditChangeDetails` | 编辑态变化；detail 为 `{ edit: boolean }` |

## 插槽

作者能拿到载荷的插槽。只转发内容、不带载荷的默认插槽不在此列——那类直接写子节点即可。

| Vue 组件 | 插槽 | 载荷 | 说明 |
| --- | --- | --- | --- |
| `XhEditableRoot` | `default` | `EditableRootSlotProps` |  |

## 状态

对外可见的状态落在 `data-state` 上，写样式与断言都读它：

| 部件 | 取值 |
| --- | --- |
| `root` | 'edit' \| 'preview' |
| `label` | 'edit' \| 'preview' |
| `area` | 'edit' \| 'preview' |
| `preview` | 'edit' \| 'preview' |
| `input` | 'edit' \| 'preview' |
| `edit-trigger` | 'edit' \| 'preview' |
| `submit-trigger` | 'edit' \| 'preview' |
| `cancel-trigger` | 'edit' \| 'preview' |
| `control` | 'edit' \| 'preview' |

状态机内部转移，写样式与业务都用不到；要监听变化请看上面的「事件」。

**状态**：`preview` · `edit`

**事件**：`EDIT.START` · `EDIT.SUBMIT` · `EDIT.CANCEL` · `EDIT.LEAVE` · `VALUE.SET` · `CONTROLLED.EDIT` · `CONTROLLED.PREVIEW` · `FORM.RESET`

**判据**：`isEditControlled` · `canEdit` · `submitsOnLeave`

## connect API

`useEditable` 产出的对象。`getXxxProps()` 铺到对应部件的宿主元素上，其余是可读状态与操作入口。

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
| `getAreaProps` | `() => T['element']` |  |
| `getPreviewProps` | `() => T['element']` |  |
| `getInputProps` | `() => T['input']` |  |
| `getEditTriggerProps` | `() => T['button']` |  |
| `getSubmitTriggerProps` | `() => T['button']` |  |
| `getCancelTriggerProps` | `() => T['button']` |  |
| `getControlProps` | `() => T['element']` |  |

## 键盘

规格出处：[W3C APG](https://html.spec.whatwg.org/multipage/input.html#text-(type=text)-state-and-search-state-(type=search))

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `Enter` | focus in input, submitMode 为 enter 或 both | 提交当下的值并回到预览态；其余模式不接管该键，交回给浏览器与外层表单 |
| `Escape` | focus in input | 撤销回上一次提交的值并回到预览态 |
| `Tab` / `Shift+Tab` | focus in input | 按 submitMode 收尾（blur/both 提交，enter/none 撤销）；不拦默认行为，焦点照常移出 |

## 无障碍

下面这些由 `connect` 铺到部件上，作者不必自己写；重复写反而会覆盖掉正确值。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `aria-labelledby` | `label` 部件的 id |
| `root` | `role` | 'group' |
| `preview` | `aria-disabled` | 'true' \| 'false' |
| `input` | `aria-invalid` | 'true' \| 'false' |
| `input` | `aria-labelledby` | `label` 部件的 id |
| `edit-trigger` | `aria-controls` | `input` 部件的 id |

## 样式

默认皮肤 `@xihan-ui/styles/editable.css` 按部件选择：`[data-scope="editable"][data-part="root"]`。它落在 `xihan.components` 层；业务样式不写进 `@layer` 即高于全部库层，要按层压过来就写进 `xihan.overrides`。

## 数据属性

由 `connect` 产出并铺到部件上，皮肤与测试都据此选择；`data-disabled` 这类无值属性在条件不成立时整个不出现。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-disabled` | ''（条件成立时才出现） |
| `root` | `data-empty` | ''（条件成立时才出现） |
| `root` | `data-invalid` | ''（条件成立时才出现） |
| `root` | `data-readonly` | ''（条件成立时才出现） |
| `root` | `data-state` | 'edit' \| 'preview' |
| `label` | `data-disabled` | ''（条件成立时才出现） |
| `label` | `data-state` | 'edit' \| 'preview' |
| `area` | `data-disabled` | ''（条件成立时才出现） |
| `area` | `data-invalid` | ''（条件成立时才出现） |
| `area` | `data-state` | 'edit' \| 'preview' |
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
| `control` | `data-disabled` | ''（条件成立时才出现） |
| `control` | `data-state` | 'edit' \| 'preview' |

## CSS 变量

本组件皮肤读的组件级令牌，写在组件自身或任意祖先上都生效。缺省值来自[设计令牌](../guide/theme)，不设即按缺省走。

`--xh-editable-area-min-h` · `--xh-editable-area-min-w` · `--xh-editable-control-gap` · `--xh-editable-gap` · `--xh-editable-input-bg` · `--xh-editable-input-bg-disabled` · `--xh-editable-input-bg-readonly` · `--xh-editable-input-border` · `--xh-editable-input-border-hover` · `--xh-editable-input-border-invalid` · `--xh-editable-input-fg` · `--xh-editable-input-font-size` · `--xh-editable-input-h` · `--xh-editable-input-px` · `--xh-editable-input-radius` · `--xh-editable-label-fg` · `--xh-editable-label-fg-disabled` · `--xh-editable-label-font-size` · `--xh-editable-label-font-weight` · `--xh-editable-placeholder-fg` · `--xh-editable-preview-bg-hover` · `--xh-editable-preview-fg` · `--xh-editable-preview-font-size` · `--xh-editable-preview-min-h` · `--xh-editable-preview-px` · `--xh-editable-preview-radius` · `--xh-editable-submit-bg` · `--xh-editable-submit-bg-active` · `--xh-editable-submit-bg-hover` · `--xh-editable-submit-border` · `--xh-editable-submit-border-active` · `--xh-editable-submit-border-hover` · `--xh-editable-submit-fg` · `--xh-editable-trigger-bg` · `--xh-editable-trigger-bg-active` · `--xh-editable-trigger-bg-disabled` · `--xh-editable-trigger-bg-hover` · `--xh-editable-trigger-border` · `--xh-editable-trigger-border-disabled` · `--xh-editable-trigger-border-hover` · `--xh-editable-trigger-fg` · `--xh-editable-trigger-font-size` · `--xh-editable-trigger-h` · `--xh-editable-trigger-px` · `--xh-editable-trigger-radius`

## 动效

状态切换走 `transition`。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。

## RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像。

## 组合

- 放进[表格](./table)的单元格；与[表单](./form)配合做整表进出编辑态。

## 最佳实践

- 展示态要有可编辑的暗示（悬停时的底色或一枚铅笔），否则没人知道能点。
- Escape 一定要能取消，且还原成原值。

## 反模式

- 失焦即提交却没有撤销：用户点到别处就把改动落库了。
- 展示态和编辑态的行高不一样，进出编辑时整行跳动。
