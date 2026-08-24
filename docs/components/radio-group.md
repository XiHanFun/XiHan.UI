# 单选组 <Badge type="info" text="radio-group" />

一组互斥选项共一个值，所有选项同时可见。单个单选钮是这里的 `item` 部件，不另立组件——它脱离组既没有互斥对象，也无法取消选中。

## 何时使用

- 二到五个互斥选项，且各选项的文字值得同时摊开让用户比较。

## 何时不用

- 选项超过五六个：用[选择器](./select)。
- 选项是并列的视图切换：用[切换按钮组](./toggle-group)或[标签页](./tabs)。
- 可以多选：用[复选框组](./checkbox-group)。

## 特性

- 整组只占一个 Tab 位，组内靠方向键走——这是原生单选组的行为。
- `hidden-input` 承担表单参与。
- `collection` 可数据驱动，也可以逐项写。
- 与[复选框](./checkbox)的不对称是有意的：一个复选框自己就成立（勾选同意条款），一个单选钮自己不成立，所以复选框另有独立组件、单选钮没有。

## 示例

### 基础用法

组内只有一个 Tab 停靠点，进组后四个方向键都能切换

<XhDemo src="radio-group/01-basic" />

### 受控

传了 value 就由宿主说了算；值可以是 null，表示一项都没选中

<XhDemo src="radio-group/02-controlled" />

### 横向排布

orientation 只影响排版与 aria-orientation，方向键四个方向照样都能切换

<XhDemo src="radio-group/03-horizontal" />

### 禁用

单项禁用后点不动，方向键也跳过它；整组禁用则每一项都跟着禁用

<XhDemo src="radio-group/04-disabled" />

### 语气

tone 决定选中圆点用哪族颜色，六种语气各一组

<XhDemo src="radio-group/05-tone" />

### 尺寸

size 改条目间距与字号，不写即缺省中档

<XhDemo src="radio-group/06-size" />

### 数据驱动

自家字段叫什么由数据定，映射成条目的值、文本与禁用即可

<XhDemo src="radio-group/07-options" />

## 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-radio-group>` |
| Vue 组件 | `XhRadioGroupItem` `XhRadioGroupItemText` `XhRadioGroupLabel` `XhRadioGroupRoot` |
| 组合式函数 | `useRadioGroup` |
| 状态机 | `radioGroupMachine` |
| 皮肤 | `@xihan-ui/styles/radio-group.css` |

## 解剖

部件名即 `data-part` 属性值，也是皮肤的选择器。加粗的是必备部件，不渲染它组件不工作（Web Components 适配器会在诊断通道上报 `wc.missing-part`）。

`data-scope="radio-group"`：`root` · `label` · **`item`** · `item-text` · `indicator` · `hidden-input`

## Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `collection` | `RadioGroupNode[]` |  | 条目数据，显示文本与禁用的事实源。给了它，条目部件只需报 value。 缺省即回到「文本与禁用都写在条目部件上」的老路。 |
| `value` | `string \| null` |  |  |
| `defaultValue` | `string \| null` |  |  |
| `disabled` | `boolean` |  |  |
| `readOnly` | `boolean` |  | 只读：选不动，但仍可聚焦、方向键照常移焦点，对比度不降。 |
| `invalid` | `boolean` |  | 校验失败：只改呈现，不挡交互。 |
| `required` | `boolean` |  | 必填：随表单校验一起用，只发无障碍属性，不自行拦提交。 |
| `orientation` | `Orientation` |  |  |
| `dir` | `Direction` |  | 文字方向，缺省 'ltr'。 |
| `name` | `string` |  | 表单字段名。 |
| `tone` | `Tone` |  | 语气：brand / neutral / success / warning / danger / info，决定用哪族颜色。 |
| `size` | `Size` |  | 尺寸：sm / md / lg。 |
| `onValueChange` | `(details: RadioGroupValueChangeDetails) => void` |  | value 变化回调。 |

## 事件

自定义元素派发这些事件，Vue 组件对应同名 emit；载荷都在 `detail` 上。可双向绑定的值另有 `update:xxx`，见 Props。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `value-change` | `RadioGroupValueChangeDetails` | 选中值变化；detail 为 `{ value: string \| null }` |

## 状态

状态机内部转移，写样式与业务都用不到；要监听变化请看上面的「事件」。

**状态**：`idle`

**事件**：`VALUE.SET` · `ITEM.SELECT` · `ITEM.FOCUS` · `GROUP.BLUR` · `FORM.RESET`

## connect API

`useRadioGroup` 产出的对象。`getXxxProps()` 铺到对应部件的宿主元素上，其余是可读状态与操作入口。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `value` | `string \| null` |  |
| `collection` | `readonly RadioGroupNodeMeta[]` | collection 推出的条目元信息，按数据顺序排列；没给 collection 即空数组。 |
| `focusedValue` | `string \| null` | 焦点在组外时为 null。 |
| `setValue` | `(next: string) => void` |  |
| `getRootProps` | `() => T['element']` |  |
| `getLabelProps` | `() => T['element']` |  |
| `getItemProps` | `(props: RadioGroupItemProps) => T['element']` |  |
| `getItemTextProps` | `(props: RadioGroupItemProps) => T['element']` |  |
| `getIndicatorProps` | `(props: RadioGroupItemProps) => T['element']` |  |
| `getHiddenInputProps` | `(props: RadioGroupItemProps) => T['input']` | 条目对应的隐藏原生 radio 输入，用于表单提交。 |

## 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/radio/#keyboardinteraction)

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `Tab` / `Shift+Tab` | focus outside the group | 整组只占一个 Tab 位：焦点进入锚点条目（即选中项）；落到容器上时由容器转投锚点条目，锚点缺席或被禁用才落首个可停留项 |
| `ArrowDown` / `ArrowRight` | focus in group, group not disabled | 焦点移到下一个可停留条目并选中，末项回绕到首项；dir=rtl 时改由 ArrowLeft 承担 |
| `ArrowUp` / `ArrowLeft` | focus in group, group not disabled | 焦点移到上一个可停留条目并选中，首项回绕到末项；dir=rtl 时改由 ArrowRight 承担 |
| `Space` | focus on item, item not disabled | 选中当前条目 |

## 无障碍

下面这些由 `connect` 铺到部件上，作者不必自己写；重复写反而会覆盖掉正确值。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `aria-invalid` | 'true' \| 'false' |
| `root` | `aria-labelledby` | `label` 部件的 id |
| `root` | `aria-orientation` | props.orientation |
| `root` | `aria-readonly` | 'true' \| 'false' |
| `root` | `aria-required` | 'true' \| 'false' |
| `root` | `role` | 'radiogroup' |
| `item` | `aria-checked` | 'true' \| 'false' |
| `item` | `aria-disabled` | 'true' \| 'false' |
| `item` | `role` | 'radio' |
| `indicator` | `aria-hidden` | 'true' |
| `hidden-input` | `aria-hidden` | 'true' |

## 样式

默认皮肤 `@xihan-ui/styles/radio-group.css` 按部件选择：`[data-scope="radio-group"][data-part="root"]`。它落在 `xihan.components` 层；业务样式不写进 `@layer` 即高于全部库层，要按层压过来就写进 `xihan.overrides`。

## 数据属性

由 `connect` 产出并铺到部件上，皮肤与测试都据此选择；`data-disabled` 这类无值属性在条件不成立时整个不出现。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-disabled` | ''（条件成立时才出现） |
| `root` | `data-invalid` | ''（条件成立时才出现） |
| `root` | `data-orientation` | props.orientation |
| `root` | `data-readonly` | ''（条件成立时才出现） |
| `root` | `data-required` | ''（条件成立时才出现） |
| `root` | `data-size` | props.size |
| `root` | `data-tone` | props.tone |

## CSS 变量

本组件皮肤读的组件级令牌，写在组件自身或任意祖先上都生效。缺省值来自[设计令牌](../guide/theme)，不设即按缺省走。

`--xh-radio-group-gap` · `--xh-radio-group-indicator-bg` · `--xh-radio-group-indicator-border` · `--xh-radio-group-indicator-border-checked` · `--xh-radio-group-indicator-border-invalid` · `--xh-radio-group-indicator-dot` · `--xh-radio-group-indicator-radius` · `--xh-radio-group-indicator-size` · `--xh-radio-group-item-fg` · `--xh-radio-group-item-fg-disabled` · `--xh-radio-group-item-font-size` · `--xh-radio-group-item-gap` · `--xh-radio-group-item-radius` · `--xh-radio-group-label-fg` · `--xh-radio-group-label-font-size` · `--xh-radio-group-label-font-weight`

## 动效

状态切换走 `transition`。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。

## 组合

- 外面套[表单字段](./field)；每项下面的补充说明放进选项内容里。

## 最佳实践

- 给出默认选中项，除非"未选"本身有意义。
- 选项文字写完整，别靠共同前缀省略。

## 反模式

- 单选组只有一个选项：用户选不了别的，等于什么都没问。
- 选项能被取消选中：单选组一旦选中就不该回到空值，需要空值就加一项"不指定"。
