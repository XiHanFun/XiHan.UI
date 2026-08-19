# 评分 <Badge type="info" text="rating" />

数据录入组件。三层同源：无头内核给出解剖与状态机，Vue 组件与自定义元素只是它的两层外壳，行为完全一致。

## 示例

### 基础用法

不传 value 即为非受控，组件自己维护评分；default-value 只决定初始那一档

<XhDemo src="rating/01-basic" />

### 半星与悬停预览

allow-half 让落点分左右半边；划过只发 hover-change，评分要点下去才改

<XhDemo src="rating/02-half" />

### 自定义档数

count 决定几颗星，星星按 1..count 逐颗写出

<XhDemo src="rating/03-count" />

### 只读与禁用

read-only 仍进 Tab 序列、读屏念得出但改不动；disabled 整条退出 Tab 序列

<XhDemo src="rating/04-readonly-disabled" />

### 语气

tone 决定点亮的星用哪族颜色，不写时沿用警示色

<XhDemo src="rating/05-tone" />

### 尺寸

size 改星的大小与间距，不写即缺省中档

<XhDemo src="rating/06-size" />

### 自定义图案

星形由作者写，条目自带这颗的点亮状态，点亮与未点亮可以画成两个字形

<XhDemo src="rating/07-icon" />

### 自定义颜色

点亮色与未点亮色各是一个组件令牌，写在行内即可脱开语气档

<XhDemo src="rating/08-color" />

### 再点一次清空

allowClear 缺省就开：点中当前那一档清回“还没评”，键盘在最低档再往下走一步同样清零；设为 false 关掉

<XhDemo src="rating/09-clearable" />

## 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-rating>` |
| Vue 组件 | `XhRatingControl` `XhRatingHiddenInput` `XhRatingItem` `XhRatingLabel` `XhRatingRoot` |
| 组合式函数 | `useRating` |
| 状态机 | `ratingMachine` |
| 皮肤 | `@xihan-ui/styles/rating.css` |

## 解剖

部件名即 `data-part` 属性值，也是皮肤的选择器。加粗的是必备部件，不渲染它组件不工作（Web Components 适配器会在诊断通道上报 `wc.missing-part`）。

`data-scope="rating"`：**`root`** · `label` · **`control`** · **`item`** · `hidden-input`

## Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `value` | `number` |  | 受控评分。给定即受控：内部不再自行落值，只发 onValueChange。 |
| `defaultValue` | `number` |  | 非受控初值，缺省 0（还没评）。 |
| `count` | `number` |  | 星星颗数，默认 5。 |
| `allowHalf` | `boolean` |  | 允许半颗星：档位从 1 变成 0.5。 |
| `allowClear` | `boolean` |  | 再点当前档位即清零，键盘在最低档再往下走一步同样清零；默认开。 |
| `disabled` | `boolean` |  | 整个不可交互：退出 Tab 序列，指针与键盘都不认。 |
| `readOnly` | `boolean` |  | 只读：仍可聚焦、仍能被读屏念出，但改不动，也不给悬停预览。 |
| `required` | `boolean` |  |  |
| `name` | `string` |  | 表单字段名；给了表单影子才带 name 并参与提交。 |
| `dir` | `Direction` |  | 文字方向，缺省 'ltr'。只改写左右方向键与"指针落在哪半边"的语义。 |
| `tone` | `Tone` |  | 语气：brand / neutral / success / warning / danger / info，决定用哪族颜色。 |
| `size` | `Size` |  | 尺寸：sm / md / lg。 |
| `onValueChange` | `(details: RatingValueChangeDetails) => void` |  |  |
| `onHoverChange` | `(details: RatingHoverChangeDetails) => void` |  | 悬停预览变化；指针离开时带 null。它不代表值变了。 |

## 事件

自定义元素派发这些事件，Vue 组件对应同名 emit；载荷都在 `detail` 上。可双向绑定的值另有 `update:xxx`，见 Props。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `value-change` | `RatingValueChangeDetails` | 评分变化；detail 为 `{ value: number }` |
| `hover-change` | `RatingHoverChangeDetails` | 悬停预览变化；detail 为 `{ value: number \| null }`，指针离开时带 null |

## 插槽

作者能拿到载荷的插槽。只转发内容、不带载荷的默认插槽不在此列——那类直接写子节点即可。

| Vue 组件 | 插槽 | 载荷 | 说明 |
| --- | --- | --- | --- |
| `XhRatingItem` | `default` | `RatingItemSlotProps` |  |
| `XhRatingRoot` | `default` | `RatingRootSlotProps` |  |

## 状态机

内部转移，写样式与业务都用不到；要监听变化请看上面的「事件」。

**状态**：`idle`

**事件**：`VALUE.SET` · `VALUE.STEP` · `VALUE.TO_MIN` · `VALUE.TO_MAX` · `ITEM.SELECT` · `ITEM.FOCUS` · `ITEM.HOVER` · `HOVER.CLEAR` · `CONTROL.BLUR` · `FORM.RESET`

**判据**：`canInteract`

## connect API

`useRating` 产出的对象。`getXxxProps()` 铺到对应部件的宿主元素上，其余是可读状态与操作入口。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `value` | `number` | 已归一化的评分：非法与越界的宿主输入在这里就被夹回来了。 |
| `hoveredValue` | `number \| null` | 指针预览值；没有预览（或不可交互）时为 null。 |
| `highlightedValue` | `number` | 当前该点亮到哪：有预览就是预览值，否则就是评分。样式与 data-highlighted 用的都是它。 |
| `count` | `number` |  |
| `empty` | `boolean` | 还没评（value 为 0）。 |
| `disabled` | `boolean` |  |
| `readOnly` | `boolean` |  |
| `items` | `readonly number[]` | 1..count 的序号表，作者直接遍历它渲染星星。 |
| `getItemState` | `(props: RatingItemProps) => RatingItemState` |  |
| `setValue` | `(next: number) => void` |  |
| `getRootProps` | `() => T['element']` |  |
| `getLabelProps` | `() => T['element']` |  |
| `getControlProps` | `() => T['element']` |  |
| `getItemProps` | `(props: RatingItemProps) => T['element']` |  |
| `getHiddenInputProps` | `() => T['input']` | 表单出口：一份视觉隐藏的原生输入，随表单提交当前评分。 |

## 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/radio/#keyboardinteraction)

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `Tab` / `Shift+Tab` | focus outside the control | 整条评分带只占一个 Tab 位：焦点进入锚点那颗星，无锚点时进入容器并由它转投首颗 |
| `ArrowRight` / `ArrowUp` | focus in control, not disabled/readOnly | 加一档（allowHalf 时半颗），到顶停在 count；dir=rtl 时改由 ArrowLeft 承担 |
| `ArrowLeft` / `ArrowDown` | focus in control, not disabled/readOnly | 减一档，到底停在最小档，不会退回"还没评"；dir=rtl 时改由 ArrowRight 承担 |
| `Home` | focus in control, not disabled/readOnly | 取最小档（allowHalf 时是半颗，否则一颗） |
| `End` | focus in control, not disabled/readOnly | 取满分（count） |

## CSS 变量

本组件皮肤读的组件级令牌，写在组件自身或任意祖先上都生效。缺省值来自[设计令牌](../guide/theme)，不设即按缺省走。

`--xh-rating-gap` · `--xh-rating-item-fg` · `--xh-rating-item-fg-highlighted` · `--xh-rating-item-font-size` · `--xh-rating-item-gap` · `--xh-rating-item-radius` · `--xh-rating-label-fg` · `--xh-rating-label-font-size` · `--xh-rating-label-font-weight`
