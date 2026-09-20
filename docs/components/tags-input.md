# TagsInput 标签输入 <Badge type="info" text="alpha" />

在一个输入框内录入一串标签：回车或分隔符成词，每个词是一个可删除的标签。

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/tags-input" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/tags-input.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/tags-input" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/tags-input" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/tags-input.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## 用法

在框中输入后按 Enter 落下一个标签；标签由作者按当前值渲染，每个标签自带 value 标识身份，预览与删除按钮就是库内的 tag

<XhDemo src="tags-input/01-basic" />

## 组件结构

加粗的是必需部件。

`data-scope="tags-input"`：**`root`** · `label` · **`control`** · **`input`** · `item` · `item-input` · `clear-trigger` · `count` · `hidden-input`

## 示例

### 上限与粘贴拆分

add-on-paste 使粘贴进来的一串按分隔符拆为多个标签；达到 max 后再输入再粘贴都不能加入

<XhDemo src="tags-input/02-max-paste" />

### 就地编辑

editable 开启后双击任一标签改写它：Enter 提交、Escape 撤销，改为空白等于删除该标签

<XhDemo src="tags-input/03-editable" />

### 禁用与只读

disabled 整个控件退出 Tab 序列、标签一起置灰；read-only 仍可聚焦浏览，但不能加入也不能删除，删除按钮留在原地不可按下、标签不置灰

<XhDemo src="tags-input/04-disabled-readonly" />

### 变体

variant 只改变控件的颜色槽位，标签的形态按控件的面派生：subtle 控件中是描边标签，其余是淡底标签；落下标签与删除标签的行为三档一致

<XhDemo src="tags-input/05-variant" />

### 颜色

tone 决定使用哪族颜色，与 variant 正交；这里固定 outline 只查看语气的差别

<XhDemo src="tags-input/06-tone" />

### 尺寸

控件高度、胶囊与输入文字一起换档，不传 size 即默认档

<XhDemo src="tags-input/07-size" />

### 随表单提交

写了 name 与 hidden-input 才参与提交，整份标签按断词符拼接为一串；框中没有内容时回车留给表单

<XhDemo src="tags-input/08-form" />

### 入库前统一改写

提供 value 后由宿主决定：组件只发变更意图，写回什么形状在这里决定

<XhDemo src="tags-input/09-normalize" />

### 候选词一键添加

根插槽给出 addValue 与 atMax：输入框之外再开一条添加标签的路径，上限同样受控

<XhDemo src="tags-input/10-suggest" />

### 外部触发的输入会话

输入部件平时收起，按添加后才显示并聚焦；输入时提供候选，选中即落下标签，失焦按 blur-behavior 收尾

<XhDemo src="tags-input/11-custom-input" />

### 标签使用对象

组件中保存的是标识，显示哪一份由作者决定：条目文本渲染 label，提交仍按标识拼接

<XhDemo src="tags-input/12-option-value" />

## 设计指引

### 何时使用

- 关键词、收件人、技能等数量不定的短词集合。
- 需要粘贴整串并自动拆分。

### 何时不用

- 值来自固定清单时，使用[选择器](./select)的多选。
- 需要在候选中检索选择时，使用[组合框](./combobox)的多选。

### 特性

- `delimiter` 与 `addOnPaste` 一起处理粘贴拆分。
- 每个标签都是库内的 tag：预览、文字与删除按钮就是它的 root、label 与 close-trigger，语气与尺寸随控件，形态按控件的面派生。
- `editable` 让已有标签双击就地修改。
- `max` 与 `allowOverflow` 成对：超出上限时拒绝还是标记。
- 标签的值可以是对象，不限于字符串。
- `showCount` 显示计数部件，数字取 `count` 与 `max`，达到上限与越界各换一档颜色。
- `required` 经 `aria-required` 上报必填。

### 组合

- 外层放[表单字段](./field)；候选词一键添加时旁边放一排[按钮](./button)。

### 最佳实践

- 入库前统一规范化（去空白、转小写），否则同一个词会出现多份。
- 说明使用哪个键成词，否则用户会持续输入空格。

### 反模式

- 不去重，同一个标签可以重复添加。
- 标签无法删除。

## API 参考

### 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-tags-input>` |
| Vue 组件 | `XhTagsInputClearTrigger` `XhTagsInputControl` `XhTagsInputCount` `XhTagsInputHiddenInput` `XhTagsInputInput` `XhTagsInputItem` `XhTagsInputItemDeleteTrigger` `XhTagsInputItemInput` `XhTagsInputItemPreview` `XhTagsInputItemText` `XhTagsInputLabel` `XhTagsInputRoot` |
| 组合式函数 | `useTagsInput` |
| 状态机 | `tagsInputMachine` |
| 皮肤 | `@xihan-ui/styles/tags-input.css` |

### Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `value` | `string[]` |  | 受控标签集合；提供后由宿主决定，状态机不自行修改，只发 onValueChange。 |
| `defaultValue` | `string[]` |  | 非受控初始标签集合。 |
| `inputValue` | `string` |  | 受控输入文本；与 value 各自独立受控。 |
| `defaultInputValue` | `string` |  | 非受控初始输入文本。 |
| `max` | `number` |  | 标签数量上限。默认不限；写 0 表示不允许添加任何标签。 |
| `allowOverflow` | `boolean` |  | 允许超过 max。 关闭（默认）：到达上限后本次输入整体不生效，文本原样留在框中，不静默丢弃。 开启：照常添加，只在 root / control 上输出 data-overflowing 供样式与提示使用。 |
| `disabled` | `boolean` |  |  |
| `readOnly` | `boolean` |  |  |
| `required` | `boolean` |  | 必填标注：经 aria-required 上报，星号由外层的字段壳绘制。 |
| `invalid` | `boolean` |  |  |
| `showCount` | `boolean` |  | 显示计数部件：关闭时 count 部件带 hidden 收起。 |
| `name` | `string` |  | 表单字段名；提供后 hidden-input 才带 name，此时整份标签按 delimiter 拼接为一串提交。 |
| `placeholder` | `string` |  |  |
| `delimiter` | `string` |  | 断词符，默认逗号。输入它即断词为标签，粘贴时也按它拆分。 显式提供空串即关闭断词：此时只有 Enter 能把文本变为标签。 |
| `addOnPaste` | `boolean` |  | 粘贴时接管：按 delimiter 拆分为多个标签。默认关闭（交给浏览器照常粘贴进框中）。 |
| `editable` | `boolean` |  | 允许双击标签就地修改。默认关闭。 |
| `blurBehavior` | `TagsInputBlurBehavior \| null` |  | 焦点离开整个组件时输入框中残留文本的处置方式。 |
| `variant` | `ControlVariant` |  | 形态：outline / subtle / ghost，决定底色与描边的绘制方式。默认 outline。 |
| `tone` | `Tone` |  | 语气：brand / neutral / success / warning / danger / info，决定使用哪族颜色。 |
| `size` | `Size` |  | 尺寸：sm / md / lg。 |
| `translations` | `Partial<TagsInputTranslations>` |  |  |
| `onValueChange` | `(details: TagsInputValueChangeDetails) => void` |  |  |
| `onInputValueChange` | `(details: TagsInputInputValueChangeDetails) => void` |  |  |

### 事件

自定义元素将载荷放在 `detail`；Vue 使用同名 emit。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `value-change` | `TagsInputValueChangeDetails` | 标签集合变化；detail 为 `{ value: string[] }` |
| `input-value-change` | `TagsInputInputValueChangeDetails` | 输入文本变化；detail 为 `{ inputValue: string }` |

### 插槽

仅列出带载荷的插槽。

| Vue 组件 | 插槽 | 载荷 | 说明 |
| --- | --- | --- | --- |
| `XhTagsInputCount` | `default` | `TagsInputCountSlotProps` |  |
| `XhTagsInputRoot` | `default` | `TagsInputRootSlotProps` |  |

### 状态

以下名称仅用于内部状态机。

**状态**：`idle` · `navigating` · `editing`

**事件**：`VALUE.SET` · `TAG.ADD` · `VALUE.CLEAR` · `INPUT.CHANGE` · `INPUT.COMMIT` · `INPUT.BLUR` · `TAG.HIGHLIGHT` · `TAG.DELETE` · `TAG.EDIT` · `EDIT.CHANGE` · `EDIT.SUBMIT` · `EDIT.CANCEL` · `ITEM.FOCUS_LOST` · `FORM.RESET` · `PRESS.START` · `PRESS.END`

**判据**：`canEdit` · `canEditTag` · `canDeleteWithPrev` · `hasHighlightTarget` · `canPress`

### connect API

`getXxxProps()` 返回对应部件的宿主属性。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `value` | `string[]` |  |
| `count` | `number` | 标签个数，等于 value.length；作者常用它做「3 / 5」这类计数提示。 |
| `inputValue` | `string` |  |
| `empty` | `boolean` | 没有任何标签。 |
| `disabled` | `boolean` |  |
| `readOnly` | `boolean` |  |
| `required` | `boolean` |  |
| `invalid` | `boolean` |  |
| `max` | `number \| undefined` | 标签个数的上限；未设 max 时为 undefined，此时只渲染当前个数。 |
| `showCount` | `boolean` | 计数部件当前是否显示（开启了 showCount）。 |
| `atMax` | `boolean` | 已到达 max：无法再添加（allowOverflow 开启时只是提示，不拦截）。 |
| `overflow` | `boolean` | 已超过 max（只有 allowOverflow 开启时才可能为真）。 |
| `highlightedValue` | `string \| null` | 光标停留的标签；不在标签间移动时为 null。 |
| `editedValue` | `string \| null` | 正被就地改写的标签；不在编辑态时为 null。 |
| `canClear` | `boolean` | 清空按钮当前是否可用（可编辑，且标签或输入文本至少有一项）。 |
| `setValue` | `(next: string[]) => void` | 整份替换，去重去空白，不受 max 约束。 |
| `addValue` | `(next: string) => void` | 追加一个标签，受 max 与 allowOverflow 约束。 |
| `deleteValue` | `(value: string) => void` |  |
| `clear` | `() => void` |  |
| `setInputValue` | `(next: string) => void` |  |
| `highlight` | `(value: string \| null) => void` | 把光标移到某个标签上；传 null 即交回输入框。 |
| `edit` | `(value: string) => void` | 进入就地编辑；未开启 editable 时被守卫拦截。 |
| `getRootProps` | `() => T['element']` |  |
| `getLabelProps` | `() => T['label']` |  |
| `getControlProps` | `() => T['element']` |  |
| `getInputProps` | `() => T['input']` |  |
| `getItemProps` | `(item: TagsInputItemProps) => T['element']` |  |
| `getItemPreviewProps` | `(item: TagsInputItemProps) => T['element']` | 标签的预览：即库内 tag 的 root（data-scope="tag"），就地编辑时收起；双击进入编辑态。 |
| `getItemTextProps` | `(item: TagsInputItemProps) => T['element']` | 标签文字：tag 的 label，截断落在该层。 |
| `getItemDeleteTriggerProps` | `(item: TagsInputItemProps) => T['button']` | 删除按钮：所在标签那份 tag 的 close-trigger，不占 Tab 位；禁用与只读时保留位置、原生 disabled。 |
| `getItemInputProps` | `(item: TagsInputItemProps) => T['input']` |  |
| `getClearTriggerProps` | `() => T['button']` |  |
| `getCountProps` | `() => T['element']` | 计数部件：承载 count / max 两个数字，未开启 showCount 时带 hidden 收起。 |
| `getHiddenInputProps` | `() => T['input']` |  |

## 无障碍

### 键盘

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
| `Enter` | 已有标签被高亮, editable 开启 | 就地编辑这个标签，焦点进编辑框并整段选中 |
| `Enter` | focus in item-input（就地编辑中） | 提交改写；改成空白等于删掉这个标签，改成另一个已有标签则并成一个。焦点交回输入框 |
| `Escape` | focus in item-input（就地编辑中） | 撤销这次改写，标签保持原样，焦点交回输入框 |
| `Enter` / `Space` | held in clear-trigger, 有标签或框里有文本, not disabled/readOnly | 按住期间清空按钮投影 data-pressed，与指针 :active 同一副按压面；抬起或失焦撤下，清空后按钮藏起一并撤下。清空按钮不占 Tab 位，键盘这一路只在焦点落到它身上时有面 |

### ARIA

以下属性由 `connect` 生成。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `control` | `aria-disabled` | 'true' \| 'false' |
| `control` | `aria-labelledby` | `label` 部件的 id |
| `control` | `role` | 'group' |
| `input` | `aria-invalid` | 'true' \| 'false' |
| `input` | `aria-labelledby` | `label` 部件的 id |
| `input` | `aria-required` | 'true' \| 'false' |
| `item-input` | `aria-label` | label.editTagInput(item.value) |
| `clear-trigger` | `aria-label` | label.clearTrigger |
| `count` | `aria-hidden` | 'true' |

## 样式参考

### 皮肤

`@xihan-ui/styles/tags-input.css` 使用 `[data-scope="tags-input"][data-part="root"]` 部件选择器，位于 `xihan.components` 层。覆盖样式使用 `xihan.overrides`。

### 数据属性

由 `connect` 生成；条件不成立时不输出无值属性。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-at-max` | ''（条件成立时才出现） |
| `root` | `data-disabled` | ''（条件成立时才出现） |
| `root` | `data-empty` | ''（条件成立时才出现） |
| `root` | `data-invalid` | ''（条件成立时才出现） |
| `root` | `data-overflowing` | ''（条件成立时才出现） |
| `root` | `data-readonly` | ''（条件成立时才出现） |
| `root` | `data-required` | ''（条件成立时才出现） |
| `root` | `data-size` | props.size |
| `root` | `data-tone` | props.tone |
| `root` | `data-variant` | props.variant |
| `label` | `data-disabled` | ''（条件成立时才出现） |
| `control` | `data-at-max` | ''（条件成立时才出现） |
| `control` | `data-disabled` | ''（条件成立时才出现） |
| `control` | `data-empty` | ''（条件成立时才出现） |
| `control` | `data-invalid` | ''（条件成立时才出现） |
| `control` | `data-overflowing` | ''（条件成立时才出现） |
| `control` | `data-readonly` | ''（条件成立时才出现） |
| `control` | `data-variant` | props.variant |
| `control` | `data-xh-field-chrome` | '' |
| `control` | `data-xh-field-layout` | 'multi-tag' |
| `control` | `data-xh-field-size` | props.size |
| `input` | `data-disabled` | ''（条件成立时才出现） |
| `input` | `data-invalid` | ''（条件成立时才出现） |
| `input` | `data-readonly` | ''（条件成立时才出现） |
| `input` | `data-xh-field-input` | '' |
| `item` | `data-disabled` | ''（条件成立时才出现） |
| `item` | `data-editing` | ''（条件成立时才出现） |
| `item` | `data-highlighted` | ''（条件成立时才出现） |
| `item` | `data-readonly` | ''（条件成立时才出现） |
| `item-input` | `data-disabled` | ''（条件成立时才出现） |
| `item-input` | `data-editing` | ''（条件成立时才出现） |
| `item-input` | `data-highlighted` | ''（条件成立时才出现） |
| `item-input` | `data-readonly` | ''（条件成立时才出现） |
| `clear-trigger` | `data-pressed` | ''（条件成立时才出现） |
| `clear-trigger` | `data-xh-action-control` | '' |
| `clear-trigger` | `data-xh-action-display` | 'has-value' |
| `clear-trigger` | `data-xh-action-has-value` | ''（条件成立时才出现） |
| `clear-trigger` | `data-xh-action-profile` | 'field-inset' |
| `clear-trigger` | `data-xh-action-size` | props.size |
| `clear-trigger` | `data-xh-action-variant` | 'ghost' |
| `count` | `data-at-max` | ''（条件成立时才出现） |
| `count` | `data-disabled` | ''（条件成立时才出现） |

<!-- xh-component-tokens:start -->
### CSS 变量

本组件公开覆盖槽由独立皮肤的实际消费位生成；默认来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 默认来源 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `--xh-tags-input-action-bg` | `clear-trigger` | `background-color` | `default` | `--xh-_action-variant-bg-rest` | tags-input 的 clear-trigger 部件 background-color 覆盖槽。 |
| `--xh-tags-input-action-bg-active` | `clear-trigger` | `background-color` | `disabled`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-_action-variant-bg-pressed` | tags-input 的 clear-trigger 部件 background-color 覆盖槽。 |
| `--xh-tags-input-action-bg-hover` | `clear-trigger` | `background-color` | `disabled`<br>`hover`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])` | `--xh-_action-variant-bg-hover` | tags-input 的 clear-trigger 部件 background-color 覆盖槽。 |
| `--xh-tags-input-action-fg` | `clear-trigger` | `color` | `default` | `--xh-fg-muted` | tags-input 的 clear-trigger 部件 color 覆盖槽。 |
| `--xh-tags-input-action-fg-hover` | `clear-trigger` | `color` | `disabled`<br>`hover`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])` | `--xh-fg-default` | tags-input 的 clear-trigger 部件 color 覆盖槽。 |
| `--xh-tags-input-action-font-size` | `clear-trigger` | `font-size` | `default` | `--xh-text-secondary-size` | tags-input 的 clear-trigger 部件 font-size 覆盖槽。 |
| `--xh-tags-input-action-radius` | `clear-trigger` | `border-radius` | `default` | `--xh-shape-inset` | tags-input 的 clear-trigger 部件 border-radius 覆盖槽。 |
| `--xh-tags-input-action-size` | `clear-trigger` | `block-size`<br>`inline-size`<br>`min-inline-size` | `default`<br>`xh-action-profile=field-inset` | `--xh-_action-profile-visual-size` | tags-input 的 clear-trigger 部件 block-size、inline-size、min-inline-size 覆盖槽。 |
| `--xh-tags-input-control-bg` | `control` | `background-color` | `xh-field-chrome` | `--xh-_field-variant-bg-rest` | tags-input 的 control 部件 background-color 覆盖槽。 |
| `--xh-tags-input-control-bg-disabled` | `control` | `background-color` | `disabled`<br>`xh-field-chrome` | `--xh-_field-variant-bg-disabled` | tags-input 的 control 部件 background-color 覆盖槽。 |
| `--xh-tags-input-control-bg-hover` | `control` | `background-color` | `disabled`<br>`hover`<br>`invalid`<br>`loading`<br>`not([data-disabled])`<br>`not([data-invalid])`<br>`not([data-loading])`<br>`not([data-readonly])`<br>`readonly`<br>`xh-field-chrome` | `--xh-_field-variant-bg-hover` | tags-input 的 control 部件 background-color 覆盖槽。 |
| `--xh-tags-input-control-bg-readonly` | `control` | `background-color` | `readonly`<br>`xh-field-chrome` | `--xh-_field-variant-bg-read-only` | tags-input 的 control 部件 background-color 覆盖槽。 |
| `--xh-tags-input-control-border` | `control` | `border` | `xh-field-chrome` | `--xh-_field-variant-border-rest` | tags-input 的 control 部件 border 覆盖槽。 |
| `--xh-tags-input-control-border-at-max` | `control` | `border-color` | `at-max`<br>`invalid`<br>`not([data-invalid])` | `--xh-border-at-limit` | tags-input 的 control 部件 border-color 覆盖槽。 |
| `--xh-tags-input-control-border-focus` | `control` | `border-color` | `disabled`<br>`focus-within`<br>`not([data-disabled])`<br>`xh-field-chrome` | `--xh-_field-variant-border-focus` | tags-input 的 control 部件 border-color 覆盖槽。 |
| `--xh-tags-input-control-border-hover` | `control` | `border-color` | `disabled`<br>`hover`<br>`invalid`<br>`loading`<br>`not([data-disabled])`<br>`not([data-invalid])`<br>`not([data-loading])`<br>`not([data-readonly])`<br>`readonly`<br>`xh-field-chrome` | `--xh-_field-variant-border-hover` | tags-input 的 control 部件 border-color 覆盖槽。 |
| `--xh-tags-input-control-border-invalid` | `control` | `border-color` | `invalid`<br>`xh-field-chrome` | `--xh-_field-variant-border-invalid` | tags-input 的 control 部件 border-color 覆盖槽。 |
| `--xh-tags-input-control-fg` | `control` | `color` | `xh-field-chrome` | `--xh-fg-default` | tags-input 的 control 部件 color 覆盖槽。 |
| `--xh-tags-input-control-gap` | `control` | `gap` | `xh-field-chrome` | `--xh-_tags-input-control-gap` | tags-input 的 control 部件 gap 覆盖槽。 |
| `--xh-tags-input-control-h` | `control` | `block-size`<br>`min-block-size` | `has([data-xh-field-input][data-xh-field-layout='multi-tag'])`<br>`has([data-xh-field-input][data-xh-field-layout='single-line'])`<br>`has([data-xh-field-input][data-xh-field-layout='textarea'])`<br>`xh-field-chrome`<br>`xh-field-input`<br>`xh-field-layout=multi-tag`<br>`xh-field-layout=single-line`<br>`xh-field-layout=textarea` | `--xh-_tags-input-control-h` | tags-input 的 control 部件 block-size、min-block-size 覆盖槽。 |
| `--xh-tags-input-control-max-h` | `control` | `max-block-size` | `default` | `--xh-viewport-h-sm` | tags-input 的 control 部件 max-block-size 覆盖槽。 |
| `--xh-tags-input-control-min-w` | `control`<br>`root` | `min-inline-size` | `default`<br>`xh-field-chrome` | `--xh-control-min-w` | tags-input 的 control、root 部件 min-inline-size 覆盖槽。 |
| `--xh-tags-input-control-px` | `control` | `padding-inline` | `xh-field-chrome` | `--xh-_tags-input-control-px` | tags-input 的 control 部件 padding-inline 覆盖槽。 |
| `--xh-tags-input-control-radius` | `control` | `border-radius` | `xh-field-chrome` | `--xh-shape-control` | tags-input 的 control 部件 border-radius 覆盖槽。 |
| `--xh-tags-input-control-shadow` | `control` | `box-shadow` | `xh-field-chrome` | `none` | tags-input 的 control 部件 box-shadow 覆盖槽。 |
| `--xh-tags-input-count-fg` | `count` | `color` | `default` | `--xh-fg-muted` | tags-input 的 count 部件 color 覆盖槽。 |
| `--xh-tags-input-count-fg-at-max` | `count` | `color` | `at-max` | `--xh-fg-warning` | tags-input 的 count 部件 color 覆盖槽。 |
| `--xh-tags-input-count-fg-disabled` | `count` | `color` | `disabled` | `--xh-fg-disabled` | tags-input 的 count 部件 color 覆盖槽。 |
| `--xh-tags-input-count-font-size` | `count` | `font-size` | `default` | `--xh-_tags-input-item-font-size` | tags-input 的 count 部件 font-size 覆盖槽。 |
| `--xh-tags-input-gap` | `root` | `gap` | `default` | `--xh-space-1` | tags-input 的 root 部件 gap 覆盖槽。 |
| `--xh-tags-input-icon-size` | `control`<br>`root` | `--xh-icon-size` | `default`<br>`size=lg`<br>`size=sm`<br>`xh-field-chrome` | `--xh-_field-size-glyph-size`<br>`--xh-glyph-size-lg`<br>`--xh-glyph-size-md`<br>`--xh-glyph-size-sm` | tags-input 的 control、root 部件 --xh-icon-size 覆盖槽。 |
| `--xh-tags-input-input-autofill-bg` | `input` | `box-shadow` | `-webkit-autofill`<br>`autofill`<br>`xh-field-input` | `--xh-bg-canvas` | tags-input 的 input 部件 box-shadow 覆盖槽。 |
| `--xh-tags-input-input-autofill-fg` | `input` | `-webkit-text-fill-color` | `-webkit-autofill`<br>`autofill`<br>`xh-field-input` | `--xh-fg-default` | tags-input 的 input 部件 -webkit-text-fill-color 覆盖槽。 |
| `--xh-tags-input-input-basis` | `input` | `flex-basis` | `default` | `6rem` | tags-input 的 input 部件 flex-basis 覆盖槽。 |
| `--xh-tags-input-input-fg` | `input` | `color` | `xh-field-input` | `--xh-fg-default` | tags-input 的 input 部件 color 覆盖槽。 |
| `--xh-tags-input-input-font-size` | `input` | `font-size` | `xh-field-input` | `--xh-_tags-input-input-font-size` | tags-input 的 input 部件 font-size 覆盖槽。 |
| `--xh-tags-input-input-min-w` | `input` | `min-inline-size` | `default` | `4rem` | tags-input 的 input 部件 min-inline-size 覆盖槽。 |
| `--xh-tags-input-item-bg-highlight` | `item`<br>`root` | `background` | `disabled`<br>`highlighted`<br>`not([data-disabled])` | `--xh-_tags-input-accent` | tags-input 的 item、root 部件 background 覆盖槽。 |
| `--xh-tags-input-item-fg-highlight` | `item`<br>`root` | `color` | `disabled`<br>`highlighted`<br>`not([data-disabled])` | `--xh-_tags-input-accent-fg` | tags-input 的 item、root 部件 color 覆盖槽。 |
| `--xh-tags-input-item-font-size` | `item-input` | `font-size` | `default` | `--xh-_tags-input-item-font-size` | tags-input 的 item-input 部件 font-size 覆盖槽。 |
| `--xh-tags-input-item-input-bg` | `item-input` | `background` | `default` | `--xh-bg-canvas` | tags-input 的 item-input 部件 background 覆盖槽。 |
| `--xh-tags-input-item-input-border` | `item-input` | `border` | `default` | `--xh-border-control` | tags-input 的 item-input 部件 border 覆盖槽。 |
| `--xh-tags-input-item-input-fg` | `item-input` | `color` | `default` | `--xh-fg-default` | tags-input 的 item-input 部件 color 覆盖槽。 |
| `--xh-tags-input-item-px` | `item-input` | `padding-inline` | `default` | `--xh-_tags-input-item-px` | tags-input 的 item-input 部件 padding-inline 覆盖槽。 |
| `--xh-tags-input-item-py` | `item-input` | `padding-block` | `default` | `--xh-_tags-input-item-py` | tags-input 的 item-input 部件 padding-block 覆盖槽。 |
| `--xh-tags-input-item-radius` | `item-input` | `border-radius` | `default` | `--xh-shape-control` | tags-input 的 item-input 部件 border-radius 覆盖槽。 |
| `--xh-tags-input-label-fg` | `label` | `color` | `default` | `--xh-fg-default` | tags-input 的 label 部件 color 覆盖槽。 |
| `--xh-tags-input-label-fg-disabled` | `label` | `color` | `disabled` | `--xh-fg-subtle` | tags-input 的 label 部件 color 覆盖槽。 |
| `--xh-tags-input-label-font-size` | `label` | `font-size` | `default` | `--xh-text-label-size` | tags-input 的 label 部件 font-size 覆盖槽。 |
| `--xh-tags-input-label-font-weight` | `label` | `font-weight` | `default` | `--xh-text-label-weight` | tags-input 的 label 部件 font-weight 覆盖槽。 |
| `--xh-tags-input-placeholder-fg` | `input` | `color` | `placeholder`<br>`xh-field-input` | `--xh-fg-subtle` | tags-input 的 input 部件 color 覆盖槽。 |
<!-- xh-component-tokens:end -->

### 动效

本组件皮肤不含过渡与关键帧，也没有脚本驱动的动效：状态一变，外观立即到位。

### RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像。
