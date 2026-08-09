# 标签输入 <Badge type="info" text="tags-input" />

数据录入组件。三层同源：无头内核给出解剖与状态机，Vue 组件与自定义元素只是它的两层外壳，行为完全一致。

## 示例

### 基础用法

框里打字按 Enter 落一个标签；标签由作者按当前值渲染，v-for 的 key 必须给

<XhDemo src="tags-input/01-basic" />

### 上限与粘贴拆分

add-on-paste 让粘进来的一串按分隔符拆成多个标签；顶到 max 后再打再粘都进不去

<XhDemo src="tags-input/02-max-paste" />

### 就地编辑

editable 打开后双击任一标签改写它：Enter 提交、Escape 撤销，改成空白等于删掉这个标签

<XhDemo src="tags-input/03-editable" />

### 禁用与只读

disabled 整个控件退出 Tab 序列；read-only 仍可聚焦浏览，但加不进也删不掉

<XhDemo src="tags-input/04-disabled-readonly" />

## 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-tags-input>` |
| Vue 组件 | `XhTagsInputClearTrigger` `XhTagsInputControl` `XhTagsInputHiddenInput` `XhTagsInputInput` `XhTagsInputItem` `XhTagsInputItemDeleteTrigger` `XhTagsInputItemInput` `XhTagsInputItemPreview` `XhTagsInputItemText` `XhTagsInputLabel` `XhTagsInputRoot` |
| 组合式函数 | `useTagsInput` |
| 状态机 | `tagsInputMachine` |
| 皮肤 | `@xihan-ui/styled/tags-input.css` |

## 解剖

部件名即 `data-part` 属性值，也是皮肤的选择器。加粗的是必备部件，不渲染它组件不工作（Web Components 适配器会在诊断通道上报 `wc.missing-part`）。

`data-scope="tags-input"`：**`root`** · `label` · **`control`** · **`input`** · `item` · `item-preview` · `item-text` · `item-delete-trigger` · `item-input` · `clear-trigger` · `hidden-input`

## Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `value` | `string[]` |  | 受控标签集合；给了就由宿主说了算，机器不自改，只发 onValueChange。 |
| `defaultValue` | `string[]` |  | 非受控初始标签集合。 |
| `inputValue` | `string` |  | 受控输入文本；与 value 各自独立受控。 |
| `defaultInputValue` | `string` |  | 非受控初始输入文本。 |
| `max` | `number` |  | 最多几个标签。缺省不限；写 0 表示一个也不许加。 |
| `allowOverflow` | `boolean` |  | 允许越过 max。 关（默认）：顶到上限后这一次输入整体不生效，文本原样留在框里，绝不悄悄吞掉。 开：照加不误，只在 root / control 上打出 data-overflow 供样式与提示使用。 |
| `disabled` | `boolean` |  |  |
| `readOnly` | `boolean` |  |  |
| `invalid` | `boolean` |  |  |
| `name` | `string` |  | 表单字段名；给了 hidden-input 才带 name，此时整份标签按 delimiter 拼成一串提交。 |
| `placeholder` | `string` |  |  |
| `delimiter` | `string` |  | 断词符，默认逗号。打字打出它即断词成标签，粘贴时也按它拆。 显式给空串即关掉断词：此时只有 Enter 能把文本变成标签。 |
| `addOnPaste` | `boolean` |  | 粘贴时接管：按 delimiter 拆成多个标签。默认关（交给浏览器照常粘进框里）。 |
| `editable` | `boolean` |  | 允许双击标签就地改。默认关。 |
| `blurBehavior` | `TagsInputBlurBehavior | null` |  | 焦点离开整个组件时怎么处置输入框里的残留文本。 |
| `variant` | `string` |  | 形态：outline / subtle / ghost，决定颜色怎么用。 |
| `tone` | `string` |  | 语气：brand / neutral / success / warning / danger / info，决定用哪族颜色。 |
| `size` | `string` |  | 尺寸：sm / md / lg。 |
| `translations` | `Partial<TagsInputTranslations>` |  |  |
| `onValueChange` | `(details: TagsInputValueChangeDetails) => void` |  |  |
| `onInputValueChange` | `(details: TagsInputInputValueChangeDetails) => void` |  |  |

## 状态机

**状态**：`idle` · `navigating` · `editing`

**事件**：`VALUE.SET` · `TAG.ADD` · `VALUE.CLEAR` · `INPUT.CHANGE` · `INPUT.COMMIT` · `INPUT.BLUR` · `TAG.HIGHLIGHT` · `TAG.DELETE` · `TAG.EDIT` · `EDIT.CHANGE` · `EDIT.SUBMIT` · `EDIT.CANCEL` · `ITEM.FOCUS_LOST`

**判据**：`canEdit` · `canEditTag` · `canDeleteWithPrev` · `hasHighlightTarget`

## connect API

`useTagsInput` 产出的对象。`getXxxProps()` 铺到对应部件的宿主元素上，其余是可读状态与操作入口。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `value` | `string[]` |  |
| `count` | `number` | 标签个数，等于 value.length；作者常拿它做"3 / 5"这类计数提示。 |
| `inputValue` | `string` |  |
| `empty` | `boolean` | 一个标签都没有。 |
| `disabled` | `boolean` |  |
| `readOnly` | `boolean` |  |
| `invalid` | `boolean` |  |
| `atMax` | `boolean` | 已顶到 max：再加进不去（allowOverflow 开时只是提示，不拦）。 |
| `overflow` | `boolean` | 已经越过 max（只有 allowOverflow 开着才可能为真）。 |
| `highlightedValue` | `string | null` | 光标停着的标签；没在标签间走时为 null。 |
| `editedValue` | `string | null` | 正被就地改写的标签；不在编辑态时为 null。 |
| `canClear` | `boolean` | 清空按钮此刻是否可用（可编辑，且标签或输入文本至少有一样）。 |
| `setValue` | `(next: string[]) => void` | 整份替换，去重去空白，不受 max 约束。 |
| `addValue` | `(next: string) => void` | 追加一个标签，受 max 与 allowOverflow 约束。 |
| `deleteValue` | `(value: string) => void` |  |
| `clear` | `() => void` |  |
| `setInputValue` | `(next: string) => void` |  |
| `highlight` | `(value: string | null) => void` | 把光标挪到某个标签上；传 null 即交回输入框。 |
| `edit` | `(value: string) => void` | 进入就地编辑；未开 editable 时被守卫挡下。 |
| `getRootProps` | `() => T['element']` |  |
| `getLabelProps` | `() => T['label']` |  |
| `getControlProps` | `() => T['element']` |  |
| `getInputProps` | `() => T['input']` |  |
| `getItemProps` | `(item: TagsInputItemProps) => T['element']` |  |
| `getItemPreviewProps` | `(item: TagsInputItemProps) => T['element']` |  |
| `getItemTextProps` | `(item: TagsInputItemProps) => T['element']` |  |
| `getItemDeleteTriggerProps` | `(item: TagsInputItemProps) => T['button']` |  |
| `getItemInputProps` | `(item: TagsInputItemProps) => T['input']` |  |
| `getClearTriggerProps` | `() => T['button']` |  |
| `getHiddenInputProps` | `() => T['input']` |  |

## 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/practices/names-and-descriptions/)

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `Enter` | focus in input, 框里有能成标签的内容, not disabled/readOnly | 把输入框里的文本变成标签（含 delimiter 时一次进多个）；框里只有空白时不接管，Enter 留给表单提交 |
| `delimiter（默认 ,）` | focus in input, not disabled/readOnly | 断词：分隔符之前的每一段各成一个标签，最后一段留在框里接着打 |
| `Backspace` | 输入框为空且没有标签被高亮, 至少有一个标签 | 高亮最后一个标签（这一下不删任何东西） |
| `Backspace` | 输入框为空且已有标签被高亮 | 删掉高亮的标签，光标落到前一个上；删的是第一个就交回输入框 |
| `Delete` | 已有标签被高亮 | 同上，删掉高亮的标签 |
| `ArrowLeft` | focus in input 且光标贴着最左端（无选区）, 至少有一个标签 | 往左走一格；还没走进标签时从最后一个起步，已经在第一个就停住 |
| `ArrowRight` | 已有标签被高亮 | 往右走一格；走出末尾即交回输入框。光标还在框里时不接管 |
| `Home` | 已有标签被高亮 | 跳到第一个标签 |
| `End` | 已有标签被高亮 | 交回输入框 |
| `Escape` | 已有标签被高亮 | 取消高亮，光标交回输入框；没在标签间走时不接管该键 |
| `Enter` | 已有标签被高亮, editable 开着 | 就地编辑这个标签，焦点进编辑框并整段选中 |
| `Enter` | focus in item-input（就地编辑中） | 提交改写；改成空白等于删掉这个标签，改成另一个已有标签则并成一个。焦点交回输入框 |
| `Escape` | focus in item-input（就地编辑中） | 撤销这次改写，标签保持原样，焦点交回输入框 |
