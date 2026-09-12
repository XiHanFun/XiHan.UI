# TextField 文本输入

单行或多行的自由文本输入。

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/text-field" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/text-field.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/text-field" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/text-field" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/text-field.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## 用法

root 持有状态，label 与 control 里的 input 各自向它取属性；不传 value 即为非受控，组件自己维护值

<XhDemo src="text-field/01-basic" />

## 组件结构

加粗的是必需部件。

`data-scope="text-field"`：**`root`** · `label` · `control` · `prefix` · **`input`** · `suffix` · `clear-trigger` · `count`

## 示例

### 受控

传了 value 就由宿主说了算，组件自己不再改状态；变化经 value-change 报出来，写不写回由宿主定

<XhDemo src="text-field/02-controlled" />

### 可清空与字数上限

Control 把输入框与清空按钮圈进同一个框，clearable 让清空按钮可用并把 Escape 接管过来，maxLength 同时落成原生 maxlength 与机器侧截断

<XhDemo src="text-field/03-clearable" />

### 禁用与校验态

disabled 与 readOnly 都改不动值，invalid 只把 aria-invalid 标出来、不拦输入

<XhDemo src="text-field/04-states" />

### 变体

variant 决定底与描边怎么画：描边、淡色填底、无框；输入框没有实心档

<XhDemo src="text-field/05-variant" />

### 颜色

tone 决定用哪族颜色，与 variant 正交；这里固定 subtle 形态，语气的底色差别不必聚焦就看得见

<XhDemo src="text-field/06-tone" />

### 尺寸

size 只改高度、内边距与字号，标签与清空按钮一起跟着换档；不写就是缺省档

<XhDemo src="text-field/07-size" />

### 程序化改值

setValue 直接写值，只受禁用、只读与字数上限约束；clear 走清空意图，canClear 不成立时按兵不动

<XhDemo src="text-field/08-programmatic" />

### 原生属性

写在 input 部件上的属性直接落到真正的输入框，自动填充与移动端键盘类型由它们决定

<XhDemo src="text-field/09-native-attrs" />

### 事件

值的变化走组件的 value-change，聚焦失焦这类原生事件直接写在 input 部件上

<XhDemo src="text-field/10-events" />

### 框内前后缀

前后缀与输入框同在 control 这一个框里排成一行，共用它的描边与底色

<XhDemo src="text-field/11-affix" />

### 密码与明暗切换

写在 input 部件上的 type 盖过默认的 text，明暗由宿主的一个布尔翻转

<XhDemo src="text-field/12-password" />

### 限制可输入的字符

beforeinput 直接写在 input 部件上，非法字符进不了框，值与框里的内容始终一致

<XhDemo src="text-field/13-filter" />

### 聚焦与选区

input 部件就是一个原生 input，拿到它的节点就能聚焦、全选、把光标挪到末尾

<XhDemo src="text-field/14-focus" />

### 输入组

圆角槽换成只留外侧的一组值，中缝用负外边距叠掉一条描边，相邻控件拼成一体

<XhDemo src="text-field/15-input-group" />

### 多行与自动长高

input 部件写成 textarea 即多行宿主；autoSize 让高度跟内容走，对象形态钉行数上下限（顶到 maxRows 后内部滚动）

<XhDemo src="text-field/16-multiline" />

## 设计指引

### 何时使用

- 姓名、标题、描述、搜索词这类没有固定候选的文本。

### 何时不用

- 值来自一份已知清单：用[选择器](./select)或[组合框](./combobox)。
- 输入的是数字并需要加减：用[数字输入](./number-field)。
- 输入的是日期或时间：用[日期输入](./date-field)、[时间输入](./time-field)。

### 特性

- `type` 覆盖 `text` / `password` / `email` / `tel` / `url` / `search`。
- `clearable` 给出清空按钮，`maxLength` 给出字数上限。
- 输入部件用 `as="textarea"` 切到多行；`autoSize` 为 `true` 时随内容长高，也可用
  `{ minRows, maxRows }` 限定行数。两个边界给值时必须是大于等于 1 的有限整数，且
  `minRows` 不得大于 `maxRows`；无效配置会明确失败，不会夹取或沿用旧配置。
- 自动高度会跟随输入、程序化写值与运行期配置变化重新测量。关闭 `autoSize`、换回单行、
  替换输入节点或卸载组件时，会归还启用前的 `block-size` 与 `overflow-y` 内联声明及其 priority；
  作者原本没有写的声明才会被移除。
- 自动高度把一只隐藏 textarea 临时挂到输入框所属 Document，以复制后的排版与宽度计算值取得真实
  内容高度和单行高度，换算 `minRows` / `maxRows`；`line-height: normal` 不按字号猜测。`content-box` 与 `border-box`
  分别按自己的声明盒计算内距和边框。量高要求 textarea 已连接到带 Window 的 Document，且当前只接受
  `writing-mode: horizontal-tb`；其他书写模式会明确失败，不会把物理纵向滚动尺寸误当成逻辑块尺寸。
- `prefix` / `suffix` 在框内摆货币符、单位或图标，两段对读屏隐藏。
- 默认皮肤把控件接入 Field Chrome：Headless 在真实视觉盒、输入、装饰段上分别投影
  `data-xh-field-chrome`、`data-xh-field-input`、`data-xh-field-affix`，单行与 textarea 由
  `data-xh-field-layout` 明确区分。旧 `data-multiline` / `data-auto-resize` 视觉钩子已删除，
  自定义皮肤应读取新的家族角色，不提供双写兼容。
- 默认字段使用 HeroUI 式无边框实体面、轻阴影与表面圆角；需要显式边界时使用 `outline`，
  需要中性填充或透明底时分别使用 `subtle` / `ghost`。
- 清空按钮复用 Action Control 的 `field-inset` profile 和 `has-value` 显示策略；粗指针命中区、
  pressed/focus/forced-colors 均由家族配方提供，适配器不另算尺寸或可见性。
- `showCount` 显出字数部件，数字取 `count` 与 `maxLength`，顶到上限时换色。
- 放在 FormFieldGroup 里时，未声明的 `disabled` / `readOnly` / `required` / `invalid` 会从最近的
  Field 或 Form 继承；实例显式写 `false` 仍以实例为准。Field 的标签、说明和错误描述链保持挂到 input。
- 输入组、限制可输入字符由作者组合，组件不预设。

### 组合

- 外面套[表单字段](./field)拿标签与错误文本；与[按钮](./button)拼成输入组。

### 最佳实践

- `type` 要写对：移动端的软键盘按它切换，写错会让用户多按很多次。
- 密码框的明暗切换按钮要有可及名字，并在切换后更新它。

### 反模式

- 用它收集固定格式的分段值（日期、验证码）：用[日期输入](./date-field)、[分格输入](./pin-input)。
- 输入时就报格式错误。

## API 参考

### 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-text-field>` |
| Vue 组件 | `XhTextFieldClearTrigger` `XhTextFieldControl` `XhTextFieldCount` `XhTextFieldInput` `XhTextFieldLabel` `XhTextFieldPrefix` `XhTextFieldRoot` `XhTextFieldSuffix` |
| 组合式函数 | `useTextField` |
| 状态机 | `textFieldMachine` |
| 皮肤 | `@xihan-ui/styles/text-field.css` |

### Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `value` | `string` |  | 受控值；给了就由宿主说了算，机器不自改。 |
| `defaultValue` | `string` |  | 非受控初值。 |
| `type` | `TextFieldType` |  | 单行宿主的输入类型，缺省 text；as 为 textarea 时不发这条属性。 |
| `placeholder` | `string` |  |  |
| `disabled` | `boolean` |  |  |
| `readOnly` | `boolean` |  |  |
| `required` | `boolean` |  |  |
| `invalid` | `boolean` |  |  |
| `name` | `string` |  | 表单字段名；给了才参与提交。 |
| `maxLength` | `number` |  | 字符数上限。同时落成原生 maxlength 与机器侧的截断，两道都要。 |
| `clearable` | `boolean` |  | 开启清空能力：有值时显出清空按钮、Escape 接管。关掉时按钮带 hidden 收起。 |
| `showCount` | `boolean` |  | 显出字数部件：关掉时 count 部件带 hidden 收起。 |
| `autoSize` | `boolean \| TextFieldAutoSize` |  | 多行宿主的自动高度：按横向书写的真实行盒跟内容长高；对象形态钉行数上下限。 |
| `variant` | `ControlVariant` |  | 形态：outline / subtle / ghost，决定输入框的底与描边怎么画。 |
| `tone` | `Tone` |  | 语气：brand / neutral / success / warning / danger / info，决定聚焦强调用哪族颜色。 |
| `size` | `Size` |  | 尺寸：sm / md / lg，决定输入框与清空按钮的几何档位。 |
| `translations` | `Partial<TextFieldTranslations>` |  | 读屏文案；缺省英文。 |
| `onValueChange` | `(details: TextFieldValueChangeDetails) => void` |  |  |

### 事件

自定义元素将载荷放在 `detail`；Vue 使用同名 emit。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `value-change` | `TextFieldValueChangeDetails` | 值变化；detail 为 `{ value: string }` |

### 插槽

仅列出带载荷的插槽。

| Vue 组件 | 插槽 | 载荷 | 说明 |
| --- | --- | --- | --- |
| `XhTextFieldCount` | `default` | `TextFieldCountSlotProps` |  |
| `XhTextFieldRoot` | `default` | `TextFieldRootSlotProps` |  |

### 状态

以下名称仅用于内部状态机。

**状态**：`idle`

**事件**：`VALUE.SET` · `VALUE.CLEAR` · `FORM.RESET`

**判据**：`canEdit` · `canClear`

### connect API

`getXxxProps()` 返回对应部件的宿主属性。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `value` | `string` |  |
| `empty` | `boolean` | 值为空串。作者据此显示占位说明一类的东西。 |
| `disabled` | `boolean` |  |
| `readOnly` | `boolean` |  |
| `invalid` | `boolean` |  |
| `clearable` | `boolean` |  |
| `atLimit` | `boolean` | 已顶到 maxLength：再敲也进不去，作者据此把字数提示标红。 |
| `count` | `number` | 当前字数，即 value 的长度。作者拿它渲染 count 部件里的数字。 |
| `maxLength` | `number \| undefined` | 字数上限的原样透传；没设上限时是 undefined，此时只渲当前字数。 |
| `showCount` | `boolean` | 字数部件此刻是否显出（开了 showCount）。 |
| `canClear` | `boolean` | 清空按钮此刻是否可用（开了 clearable、可编辑、且有值）。 |
| `setValue` | `(next: string) => void` | 直接写值，只受 disabled/readOnly 与 maxLength 约束，与 clearable 无关。 |
| `clear` | `() => void` | 走清空意图，受 canClear 约束；无条件清空请用 setValue('')。 |
| `autoSize` | `boolean \| TextFieldAutoSize` | 自动高度配置的原样透传；适配器在程序化写值后据此补量一次。 |
| `getRootProps` | `() => T['element']` |  |
| `getControlProps` | `() => T['element']` | 视觉盒；写了它就由它画描边与聚焦环，不写时输入框自己当盒。 |
| `getLabelProps` | `() => T['label']` |  |
| `getInputProps` | `(props?: TextFieldInputProps) => T['input']` | 传 as: 'textarea' 即多行宿主：撤掉 type、接上自动高度。 |
| `getPrefixProps` | `() => T['element']` | 输入框前的装饰段（货币符、单位、图标）；对读屏隐藏，不参与名字链。 |
| `getSuffixProps` | `() => T['element']` | 输入框后的装饰段；对读屏隐藏，不参与名字链。 |
| `getClearTriggerProps` | `() => T['button']` |  |
| `getCountProps` | `() => T['element']` | 字数部件：承载 count / maxLength 两个数字，没开 showCount 时带 hidden 收起。 |

## 无障碍

### 键盘

规格出处：[W3C APG](https://html.spec.whatwg.org/multipage/input.html#text-(type=text)-state-and-search-state-(type=search))

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `Escape` | focus in input, clearable 且值非空, not disabled/readOnly | 清空值；三个条件缺一即不接管该键，交回给外层与浏览器 |

### ARIA

以下属性由 `connect` 生成。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `prefix` | `aria-hidden` | 'true' |
| `input` | `aria-invalid` | 'true' \| 'false' |
| `input` | `aria-labelledby` | `label` 部件的 id |
| `input` | `aria-readonly` | 'true' \| 'false' |
| `input` | `aria-required` | 'true' \| 'false' |
| `suffix` | `aria-hidden` | 'true' |
| `clear-trigger` | `aria-label` | label.clearTrigger |
| `count` | `aria-hidden` | 'true' |

## 样式参考

### 皮肤

`@xihan-ui/styles/text-field.css` 使用 `[data-scope="text-field"][data-part="root"]` 部件选择器，位于 `xihan.components` 层。覆盖样式使用 `xihan.overrides`。

### 数据属性

由 `connect` 生成；条件不成立时不输出无值属性。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-at-max` | ''（条件成立时才出现） |
| `root` | `data-disabled` | ''（条件成立时才出现） |
| `root` | `data-empty` | ''（条件成立时才出现） |
| `root` | `data-invalid` | ''（条件成立时才出现） |
| `root` | `data-readonly` | ''（条件成立时才出现） |
| `root` | `data-size` | props.size |
| `root` | `data-tone` | props.tone |
| `root` | `data-variant` | props.variant |
| `root` | `data-xh-action-owner` | '' |
| `label` | `data-disabled` | ''（条件成立时才出现） |
| `control` | `data-at-max` | ''（条件成立时才出现） |
| `control` | `data-disabled` | ''（条件成立时才出现） |
| `control` | `data-empty` | ''（条件成立时才出现） |
| `control` | `data-invalid` | ''（条件成立时才出现） |
| `control` | `data-readonly` | ''（条件成立时才出现） |
| `control` | `data-xh-field-chrome` | '' |
| `control` | `data-xh-field-size` | props.size |
| `prefix` | `data-disabled` | ''（条件成立时才出现） |
| `prefix` | `data-xh-field-affix` | 'prefix' |
| `input` | `data-at-max` | ''（条件成立时才出现） |
| `input` | `data-disabled` | ''（条件成立时才出现） |
| `input` | `data-empty` | ''（条件成立时才出现） |
| `input` | `data-invalid` | ''（条件成立时才出现） |
| `input` | `data-xh-field-auto-size` | ''（条件成立时才出现） |
| `input` | `data-xh-field-input` | '' |
| `input` | `data-xh-field-layout` | 'textarea' \| 'single-line' |
| `suffix` | `data-disabled` | ''（条件成立时才出现） |
| `suffix` | `data-xh-field-affix` | 'suffix' |
| `clear-trigger` | `data-xh-action-control` | '' |
| `clear-trigger` | `data-xh-action-display` | 'has-value' |
| `clear-trigger` | `data-xh-action-has-value` | ''（条件成立时才出现） |
| `clear-trigger` | `data-xh-action-profile` | 'field-inset' |
| `clear-trigger` | `data-xh-action-size` | props.size |
| `count` | `data-at-max` | ''（条件成立时才出现） |
| `count` | `data-disabled` | ''（条件成立时才出现） |

<!-- xh-component-tokens:start -->
### CSS 变量

本组件公开覆盖槽由独立皮肤的实际消费位生成；缺省来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 缺省来源 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `--xh-text-field-action-bg` | `clear-trigger` | `background-color` | `default` | `transparent` | text-field 的 clear-trigger 部件 background-color 覆盖槽。 |
| `--xh-text-field-action-bg-active` | `clear-trigger` | `background-color` | `active`<br>`disabled`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])` | `--xh-bg-subtle-active` | text-field 的 clear-trigger 部件 background-color 覆盖槽。 |
| `--xh-text-field-action-bg-hover` | `clear-trigger` | `background-color` | `disabled`<br>`hover`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])` | `--xh-bg-subtle-hover` | text-field 的 clear-trigger 部件 background-color 覆盖槽。 |
| `--xh-text-field-action-fg` | `clear-trigger` | `color` | `default` | `--xh-fg-muted` | text-field 的 clear-trigger 部件 color 覆盖槽。 |
| `--xh-text-field-action-fg-hover` | `clear-trigger` | `color` | `disabled`<br>`hover`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])` | `--xh-fg-default` | text-field 的 clear-trigger 部件 color 覆盖槽。 |
| `--xh-text-field-action-font-size` | `clear-trigger` | `font-size` | `default` | `--xh-_text-field-action-font-size` | text-field 的 clear-trigger 部件 font-size 覆盖槽。 |
| `--xh-text-field-action-radius` | `clear-trigger` | `border-radius` | `default` | `--xh-shape-inset` | text-field 的 clear-trigger 部件 border-radius 覆盖槽。 |
| `--xh-text-field-action-size` | `clear-trigger` | `block-size`<br>`inline-size`<br>`min-inline-size` | `default`<br>`xh-action-profile=field-inset` | `--xh-_action-profile-visual-size` | text-field 的 clear-trigger 部件 block-size、inline-size、min-inline-size 覆盖槽。 |
| `--xh-text-field-affix-fg` | `prefix`<br>`suffix` | `color` | `xh-field-affix` | `--xh-fg-muted` | text-field 的 prefix、suffix 部件 color 覆盖槽。 |
| `--xh-text-field-affix-fg-disabled` | `prefix`<br>`suffix` | `color` | `disabled`<br>`xh-field-affix` | `--xh-fg-disabled` | text-field 的 prefix、suffix 部件 color 覆盖槽。 |
| `--xh-text-field-affix-font-size` | `prefix`<br>`suffix` | `font-size` | `xh-field-affix` | `--xh-_text-field-font-size` | text-field 的 prefix、suffix 部件 font-size 覆盖槽。 |
| `--xh-text-field-control-bg` | `control` | `background-color` | `xh-field-chrome` | `--xh-_text-field-bg` | text-field 的 control 部件 background-color 覆盖槽。 |
| `--xh-text-field-control-bg-disabled` | `control` | `background-color` | `disabled`<br>`xh-field-chrome` | `--xh-bg-subtle` | text-field 的 control 部件 background-color 覆盖槽。 |
| `--xh-text-field-control-bg-hover` | `control` | `background-color` | `disabled`<br>`hover`<br>`invalid`<br>`loading`<br>`not([data-disabled])`<br>`not([data-invalid])`<br>`not([data-loading])`<br>`not([data-readonly])`<br>`readonly`<br>`xh-field-chrome` | `--xh-_text-field-bg-hover` | text-field 的 control 部件 background-color 覆盖槽。 |
| `--xh-text-field-control-bg-readonly` | `control` | `background-color` | `readonly`<br>`xh-field-chrome` | `--xh-bg-subtle` | text-field 的 control 部件 background-color 覆盖槽。 |
| `--xh-text-field-control-border` | `control` | `border` | `xh-field-chrome` | `--xh-_text-field-border` | text-field 的 control 部件 border 覆盖槽。 |
| `--xh-text-field-control-border-at-max` | `control` | `border-color` | `at-max`<br>`invalid`<br>`not([data-invalid])` | `--xh-border-at-limit` | text-field 的 control 部件 border-color 覆盖槽。 |
| `--xh-text-field-control-border-focus` | `control` | `border-color` | `disabled`<br>`focus-within`<br>`not([data-disabled])`<br>`xh-field-chrome` | `--xh-_text-field-border-focus` | text-field 的 control 部件 border-color 覆盖槽。 |
| `--xh-text-field-control-border-hover` | `control` | `border-color` | `disabled`<br>`hover`<br>`invalid`<br>`loading`<br>`not([data-disabled])`<br>`not([data-invalid])`<br>`not([data-loading])`<br>`not([data-readonly])`<br>`readonly`<br>`xh-field-chrome` | `--xh-_text-field-border-hover` | text-field 的 control 部件 border-color 覆盖槽。 |
| `--xh-text-field-control-border-invalid` | `control` | `border-color` | `invalid`<br>`xh-field-chrome` | `--xh-border-invalid` | text-field 的 control 部件 border-color 覆盖槽。 |
| `--xh-text-field-control-fg` | `control` | `color` | `xh-field-chrome` | `--xh-fg-default` | text-field 的 control 部件 color 覆盖槽。 |
| `--xh-text-field-control-gap` | `control` | `gap` | `xh-field-chrome` | `--xh-_text-field-gap` | text-field 的 control 部件 gap 覆盖槽。 |
| `--xh-text-field-control-h` | `control` | `block-size`<br>`min-block-size` | `has([data-xh-field-input][data-xh-field-layout='multi-tag'])`<br>`has([data-xh-field-input][data-xh-field-layout='single-line'])`<br>`has([data-xh-field-input][data-xh-field-layout='textarea'])`<br>`xh-field-chrome`<br>`xh-field-input`<br>`xh-field-layout=multi-tag`<br>`xh-field-layout=single-line`<br>`xh-field-layout=textarea` | `--xh-_text-field-h` | text-field 的 control 部件 block-size、min-block-size 覆盖槽。 |
| `--xh-text-field-control-max-h` | `control` | `max-block-size` | `has([data-xh-field-input][data-xh-field-auto-size])`<br>`xh-field-auto-size`<br>`xh-field-input` | `--xh-viewport-h-sm` | text-field 的 control 部件 max-block-size 覆盖槽。 |
| `--xh-text-field-control-min-w` | `control`<br>`root` | `min-inline-size` | `default`<br>`xh-field-chrome` | `--xh-control-min-w` | text-field 的 control、root 部件 min-inline-size 覆盖槽。 |
| `--xh-text-field-control-px` | `control` | `padding-inline` | `xh-field-chrome` | `--xh-_text-field-px` | text-field 的 control 部件 padding-inline 覆盖槽。 |
| `--xh-text-field-control-radius` | `control` | `border-radius` | `xh-field-chrome` | `--xh-shape-surface` | text-field 的 control 部件 border-radius 覆盖槽。 |
| `--xh-text-field-control-shadow` | `control` | `box-shadow` | `xh-field-chrome` | `--xh-_text-field-shadow` | text-field 的 control 部件 box-shadow 覆盖槽。 |
| `--xh-text-field-count-fg` | `count` | `color` | `default` | `--xh-fg-muted` | text-field 的 count 部件 color 覆盖槽。 |
| `--xh-text-field-count-fg-at-max` | `count` | `color` | `at-max` | `--xh-fg-warning` | text-field 的 count 部件 color 覆盖槽。 |
| `--xh-text-field-count-fg-disabled` | `count` | `color` | `disabled` | `--xh-fg-disabled` | text-field 的 count 部件 color 覆盖槽。 |
| `--xh-text-field-count-font-size` | `count` | `font-size` | `default` | `--xh-_text-field-action-font-size` | text-field 的 count 部件 font-size 覆盖槽。 |
| `--xh-text-field-gap` | `root` | `gap` | `default` | `--xh-space-1` | text-field 的 root 部件 gap 覆盖槽。 |
| `--xh-text-field-icon-size` | `root` | `--xh-icon-size` | `default`<br>`size=lg`<br>`size=sm` | `--xh-glyph-size-lg`<br>`--xh-glyph-size-md`<br>`--xh-glyph-size-sm` | text-field 的 root 部件 --xh-icon-size 覆盖槽。 |
| `--xh-text-field-input-autofill-bg` | `input` | `box-shadow` | `-webkit-autofill`<br>`autofill`<br>`xh-field-input` | `--xh-bg-canvas` | text-field 的 input 部件 box-shadow 覆盖槽。 |
| `--xh-text-field-input-autofill-fg` | `input` | `-webkit-text-fill-color` | `-webkit-autofill`<br>`autofill`<br>`xh-field-input` | `--xh-fg-default` | text-field 的 input 部件 -webkit-text-fill-color 覆盖槽。 |
| `--xh-text-field-input-fg` | `input` | `color` | `xh-field-input` | `--xh-fg-default` | text-field 的 input 部件 color 覆盖槽。 |
| `--xh-text-field-input-font-size` | `input` | `font-size` | `xh-field-input` | `--xh-_text-field-font-size` | text-field 的 input 部件 font-size 覆盖槽。 |
| `--xh-text-field-label-fg` | `label` | `color` | `default` | `--xh-fg-default` | text-field 的 label 部件 color 覆盖槽。 |
| `--xh-text-field-label-fg-disabled` | `label` | `color` | `disabled` | `--xh-fg-subtle` | text-field 的 label 部件 color 覆盖槽。 |
| `--xh-text-field-label-font-size` | `label` | `font-size` | `default` | `--xh-_text-field-label-font-size` | text-field 的 label 部件 font-size 覆盖槽。 |
| `--xh-text-field-label-font-weight` | `label` | `font-weight` | `default` | `--xh-text-label-weight` | text-field 的 label 部件 font-weight 覆盖槽。 |
| `--xh-text-field-placeholder-fg` | `input` | `color` | `placeholder`<br>`xh-field-input` | `--xh-fg-subtle` | text-field 的 input 部件 color 覆盖槽。 |
| `--xh-text-field-textarea-py` | `input` | `padding-block` | `xh-field-input`<br>`xh-field-layout=textarea` | `--xh-space-2` | text-field 的 input 部件 padding-block 覆盖槽。 |
<!-- xh-component-tokens:end -->

### 动效

本组件皮肤不含过渡与关键帧，也没有脚本驱动的动效：状态一变，外观立即到位。

### RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像。
