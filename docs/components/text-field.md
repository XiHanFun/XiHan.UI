# 文本输入 <Badge type="info" text="text-field" />

数据录入组件。三层同源：无头内核给出解剖与状态机，Vue 组件与自定义元素只是它的两层外壳，行为完全一致。

## 示例

### 基础用法

root 持有状态，label 与 input 各自向它取属性；不传 value 即为非受控，组件自己维护值

<XhDemo src="text-field/01-basic" />

### 受控

传了 value 就由宿主说了算，组件自己不再改状态；v-model:value 是它的语法糖

<XhDemo src="text-field/02-controlled" />

### 可清空与字数上限

clearable 让清空按钮可用并把 Escape 接管过来，maxLength 同时落成原生 maxlength 与机器侧截断

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

值的变化走 root 的 value-change，聚焦失焦这类原生事件直接写在 input 部件上

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

input 部件渲染出来就是一个 input，拿到它的节点就能聚焦、全选、把光标挪到末尾

<XhDemo src="text-field/14-focus" />

### 输入组

圆角槽换成只留外侧的一组值，中缝用负外边距叠掉一条描边，相邻控件拼成一体

<XhDemo src="text-field/15-input-group" />

### 多行与自动长高

XhTextFieldInput 写 as="textarea" 即多行宿主；autoSize 让高度跟内容走，对象形态钉行数上下限（顶到 maxRows 后内部滚动）

<XhDemo src="text-field/16-multiline" />

## 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-text-field>` |
| Vue 组件 | `XhTextFieldClearTrigger` `XhTextFieldInput` `XhTextFieldLabel` `XhTextFieldRoot` |
| 组合式函数 | `useTextField` |
| 状态机 | `textFieldMachine` |
| 皮肤 | `@xihan-ui/styles/text-field.css` |

## 解剖

部件名即 `data-part` 属性值，也是皮肤的选择器。加粗的是必备部件，不渲染它组件不工作（Web Components 适配器会在诊断通道上报 `wc.missing-part`）。

`data-scope="text-field"`：**`root`** · `label` · **`input`** · `clear-trigger`

## Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `value` | `string` |  | 受控值；给了就由宿主说了算，机器不自改。 |
| `defaultValue` | `string` |  | 非受控初值。 |
| `placeholder` | `string` |  |  |
| `disabled` | `boolean` |  |  |
| `readOnly` | `boolean` |  |  |
| `required` | `boolean` |  |  |
| `invalid` | `boolean` |  |  |
| `name` | `string` |  | 表单字段名；给了才参与提交。 |
| `maxLength` | `number` |  | 字符数上限。同时落成原生 maxlength 与机器侧的截断，两道都要。 |
| `clearable` | `boolean` |  | 开启清空能力：清空按钮可用、Escape 接管。关掉时按钮带 hidden 收起。 |
| `autoSize` | `boolean \| TextFieldAutoSize` |  | 多行宿主的自动高度：跟内容长高；对象形态钉行数上下限，顶到 maxRows 后内部滚动。 |
| `variant` | `ControlVariant` |  | 形态：outline / subtle / ghost，决定输入框的底与描边怎么画。 |
| `tone` | `Tone` |  | 语气：brand / neutral / success / warning / danger / info，决定聚焦强调用哪族颜色。 |
| `size` | `Size` |  | 尺寸：sm / md / lg，决定输入框与清空按钮的几何档位。 |
| `onValueChange` | `(details: TextFieldValueChangeDetails) => void` |  |  |

## 状态机

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
| `getLabelProps` | `() => T['label']` |  |
| `getInputProps` | `(props?: TextFieldInputProps) => T['input']` | 传 as: 'textarea' 即多行宿主：撤掉 type、接上自动高度。 |
| `getClearTriggerProps` | `() => T['button']` |  |

## 键盘

规格出处：[W3C APG](https://html.spec.whatwg.org/multipage/input.html#text-(type=text)-state-and-search-state-(type=search))

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `Escape` | focus in input, clearable 且值非空, not disabled/readOnly | 清空值；三个条件缺一即不接管该键，交回给外层与浏览器 |
