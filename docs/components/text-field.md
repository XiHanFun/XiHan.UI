# 文本输入 <Badge type="info" text="text-field" />

单行或多行的自由文本输入。

## 何时使用

- 姓名、标题、描述、搜索词这类没有固定候选的文本。

## 何时不用

- 值来自一份已知清单：用[选择器](./select)或[组合框](./combobox)。
- 输入的是数字并需要加减：用[数字输入](./number-field)。
- 输入的是日期或时间：用[日期输入](./date-field)、[时间输入](./time-field)。

## 特性

- `type` 覆盖 `text` / `password` / `email` / `tel` / `url` / `search`。
- `clearable` 给出清空按钮，`maxLength` 给出字数上限。
- 多行时可自动长高。
- 框内前后缀、输入组、限制可输入字符都由作者组合，组件不预设。

## 示例

### 基础用法

root 持有状态，label 与 input 各自向它取属性；不传 value 即为非受控，组件自己维护值

<XhDemo src="text-field/01-basic" />

### 受控

传了 value 就由宿主说了算，组件自己不再改状态；变化经 value-change 报出来，写不写回由宿主定

<XhDemo src="text-field/02-controlled" />

### 可清空与字数上限

Control 把输入框与清空按钮圈进同一个框，clearable 让清空按钮可用并把 Escape 接管过来，maxLength 同时落成原生 maxlength 与机器侧截断

<XhDemo src="text-field/03-clearable" />

### 禁用与校验态

disabled 与 readOnly 都改不动值，invalid 只把 aria-invalid 标出来、不拦输入

<XhDemo src="text-field/04-states" />

### 形态

variant 决定底与描边怎么画：描边、淡色填底、无框；输入框没有实心档

<XhDemo src="text-field/05-variant" />

### 语气

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

前后缀压在输入框上，输入框自己让出内边距，两者共用同一份边框与底色

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

## 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-text-field>` |
| Vue 组件 | `XhTextFieldClearTrigger` `XhTextFieldControl` `XhTextFieldInput` `XhTextFieldLabel` `XhTextFieldRoot` |
| 组合式函数 | `useTextField` |
| 状态机 | `textFieldMachine` |
| 皮肤 | `@xihan-ui/styles/text-field.css` |

## 解剖

部件名即 `data-part` 属性值，也是皮肤的选择器。加粗的是必备部件，不渲染它组件不工作（Web Components 适配器会在诊断通道上报 `wc.missing-part`）。

`data-scope="text-field"`：**`root`** · `label` · `control` · **`input`** · `clear-trigger`

## Props

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
| `autoSize` | `boolean \| TextFieldAutoSize` |  | 多行宿主的自动高度：跟内容长高；对象形态钉行数上下限，顶到 maxRows 后内部滚动。 |
| `variant` | `ControlVariant` |  | 形态：outline / subtle / ghost，决定输入框的底与描边怎么画。 |
| `tone` | `Tone` |  | 语气：brand / neutral / success / warning / danger / info，决定聚焦强调用哪族颜色。 |
| `size` | `Size` |  | 尺寸：sm / md / lg，决定输入框与清空按钮的几何档位。 |
| `translations` | `Partial<TextFieldTranslations>` |  | 读屏文案；缺省英文。 |
| `onValueChange` | `(details: TextFieldValueChangeDetails) => void` |  |  |

## 事件

自定义元素派发这些事件，Vue 组件对应同名 emit；载荷都在 `detail` 上。可双向绑定的值另有 `update:xxx`，见 Props。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `value-change` | `TextFieldValueChangeDetails` | 值变化；detail 为 `{ value: string }` |

## 插槽

作者能拿到载荷的插槽。只转发内容、不带载荷的默认插槽不在此列——那类直接写子节点即可。

| Vue 组件 | 插槽 | 载荷 | 说明 |
| --- | --- | --- | --- |
| `XhTextFieldRoot` | `default` | `TextFieldRootSlotProps` |  |

## 状态

状态机内部转移，写样式与业务都用不到；要监听变化请看上面的「事件」。

**状态**：`idle`

**事件**：`VALUE.SET` · `VALUE.CLEAR` · `FORM.RESET`

**判据**：`canEdit` · `canClear`

## connect API

`useTextField` 产出的对象。`getXxxProps()` 铺到对应部件的宿主元素上，其余是可读状态与操作入口。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `value` | `string` |  |
| `empty` | `boolean` | 值为空串。作者据此显示占位说明一类的东西。 |
| `disabled` | `boolean` |  |
| `readOnly` | `boolean` |  |
| `invalid` | `boolean` |  |
| `clearable` | `boolean` |  |
| `atLimit` | `boolean` | 已顶到 maxLength：再敲也进不去，作者据此把字数提示标红。 |
| `canClear` | `boolean` | 清空按钮此刻是否可用（开了 clearable、可编辑、且有值）。 |
| `setValue` | `(next: string) => void` | 直接写值，只受 disabled/readOnly 与 maxLength 约束，与 clearable 无关。 |
| `clear` | `() => void` | 走清空意图，受 canClear 约束；无条件清空请用 setValue('')。 |
| `autoSize` | `boolean \| TextFieldAutoSize` | 自动高度配置的原样透传；适配器在程序化写值后据此补量一次。 |
| `getRootProps` | `() => T['element']` |  |
| `getControlProps` | `() => T['element']` | 视觉盒；写了它就由它画描边与聚焦环，不写时输入框自己当盒。 |
| `getLabelProps` | `() => T['label']` |  |
| `getInputProps` | `(props?: TextFieldInputProps) => T['input']` | 传 as: 'textarea' 即多行宿主：撤掉 type、接上自动高度。 |
| `getClearTriggerProps` | `() => T['button']` |  |

## 键盘

规格出处：[W3C APG](https://html.spec.whatwg.org/multipage/input.html#text-(type=text)-state-and-search-state-(type=search))

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `Escape` | focus in input, clearable 且值非空, not disabled/readOnly | 清空值；三个条件缺一即不接管该键，交回给外层与浏览器 |

## 无障碍

下面这些由 `connect` 铺到部件上，作者不必自己写；重复写反而会覆盖掉正确值。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `input` | `aria-invalid` | 'true' \| 'false' |
| `input` | `aria-labelledby` | `label` 部件的 id |
| `clear-trigger` | `aria-label` | label.clearTrigger |

## 样式

默认皮肤 `@xihan-ui/styles/text-field.css` 按部件选择：`[data-scope="text-field"][data-part="root"]`。它落在 `xihan.components` 层；业务样式不写进 `@layer` 即高于全部库层，要按层压过来就写进 `xihan.overrides`。

## 数据属性

由 `connect` 产出并铺到部件上，皮肤与测试都据此选择；`data-disabled` 这类无值属性在条件不成立时整个不出现。

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
| `label` | `data-disabled` | ''（条件成立时才出现） |
| `control` | `data-at-max` | ''（条件成立时才出现） |
| `control` | `data-disabled` | ''（条件成立时才出现） |
| `control` | `data-invalid` | ''（条件成立时才出现） |
| `control` | `data-readonly` | ''（条件成立时才出现） |
| `input` | `data-at-max` | ''（条件成立时才出现） |
| `input` | `data-auto-resize` | ''（条件成立时才出现） |
| `input` | `data-disabled` | ''（条件成立时才出现） |
| `input` | `data-invalid` | ''（条件成立时才出现） |
| `input` | `data-multiline` | ''（条件成立时才出现） |

## CSS 变量

本组件皮肤读的组件级令牌，写在组件自身或任意祖先上都生效。缺省值来自[设计令牌](../guide/theme)，不设即按缺省走。

`--xh-text-field-action-bg` · `--xh-text-field-action-bg-active` · `--xh-text-field-action-bg-hover` · `--xh-text-field-action-fg` · `--xh-text-field-action-fg-hover` · `--xh-text-field-action-font-size` · `--xh-text-field-action-radius` · `--xh-text-field-action-size` · `--xh-text-field-control-bg` · `--xh-text-field-control-bg-disabled` · `--xh-text-field-control-bg-readonly` · `--xh-text-field-control-border` · `--xh-text-field-control-border-at-max` · `--xh-text-field-control-border-focus` · `--xh-text-field-control-border-hover` · `--xh-text-field-control-border-invalid` · `--xh-text-field-control-fg` · `--xh-text-field-control-gap` · `--xh-text-field-control-h` · `--xh-text-field-control-min-w` · `--xh-text-field-control-px` · `--xh-text-field-control-radius` · `--xh-text-field-control-shadow` · `--xh-text-field-gap` · `--xh-text-field-icon-size` · `--xh-text-field-input-autofill-bg` · `--xh-text-field-input-autofill-fg` · `--xh-text-field-input-bg` · `--xh-text-field-input-bg-disabled` · `--xh-text-field-input-bg-readonly` · `--xh-text-field-input-border` · `--xh-text-field-input-border-at-max` · `--xh-text-field-input-border-focus` · `--xh-text-field-input-border-hover` · `--xh-text-field-input-border-invalid` · `--xh-text-field-input-fg` · `--xh-text-field-input-font-size` · `--xh-text-field-input-h` · `--xh-text-field-input-min-w` · `--xh-text-field-input-px` · `--xh-text-field-input-radius` · `--xh-text-field-input-shadow` · `--xh-text-field-label-fg` · `--xh-text-field-label-fg-disabled` · `--xh-text-field-label-font-size` · `--xh-text-field-label-font-weight` · `--xh-text-field-placeholder-fg` · `--xh-text-field-textarea-py`

## 动效

状态切换走 `transition`。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。

## RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像。

## 组合

- 外面套[表单字段](./field)拿标签与错误文本；与[按钮](./button)拼成输入组。

## 最佳实践

- `type` 要写对：移动端的软键盘按它切换，写错会让用户多按很多次。
- 密码框的明暗切换按钮要有可及名字，并在切换后更新它。

## 反模式

- 用它收集固定格式的分段值（日期、验证码）：用[日期输入](./date-field)、[分格输入](./pin-input)。
- 输入时就报格式错误。
