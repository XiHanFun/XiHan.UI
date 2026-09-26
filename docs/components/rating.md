# Rating 评分

用一排图案表示一个离散的分值。

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/rating" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/rating.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/rating" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/rating" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/rating.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## 用法

不传 value 即为非受控，组件自行维护评分；default-value 只决定初始档位

<XhDemo src="rating/01-basic" />

## 组件结构

加粗的是必需部件。

`data-scope="rating"`：**`root`** · `label` · **`control`** · `value-text` · **`item`** · `hidden-input`

## 示例

### 半星与悬停预览

allow-half 使落点分左右半边；划过只发 hover-change，评分要点击后才改变

<XhDemo src="rating/02-half" />

### 自定义档数

count 决定几颗星，星星按 1..count 逐颗写出

<XhDemo src="rating/03-count" />

### 只读与禁用

read-only 仍进入 Tab 序列、读屏可朗读但不可修改；disabled 整条退出 Tab 序列

<XhDemo src="rating/04-readonly-disabled" />

### 颜色

tone 决定点亮的星使用哪族颜色，不写时沿用警示色

<XhDemo src="rating/05-tone" />

### 尺寸

size 改变星的大小与间距，不写即默认中档

<XhDemo src="rating/06-size" />

### 自定义图标

条目可使用首方图标，也可留空使用皮肤默认星形

<XhDemo src="rating/07-icon" />

### 自定义颜色

点亮色与未点亮色各是一个组件令牌，写在行内即可脱离语气档

<XhDemo src="rating/08-color" />

### 再点一次清空

allowClear 默认开启：点击当前档位清回未评分，键盘在最低档再向下一步同样清零；设为 false 关闭

<XhDemo src="rating/09-clearable" />

## 设计指引

### 何时使用

- 收集或展示满意度、星级等小范围的主观分值。

### 何时不用

- 分值范围大（0 到 100）时，使用[滑块](./slider)或[数字字段](./number-field)。
- 只展示一个数值时，使用[统计数值](./statistic)。

### 特性

- `allowHalf` 支持半档，`allowClear` 允许再次点击清空。
- 悬停预览与实际值分开，`onHoverChange` 单独回调。
- 条目留空时使用库内置的星形图标；也可传入自定义图标与颜色。

### 组合

- 外层放[表单字段](./field)；只读展示时与[统计数值](./statistic)并列。

### 最佳实践

- 档数固定为五档，更多档用户无法分辨差别。
- 只读展示时同时写出数值（4.2 / 5），图案本身读不出精确值。

### 反模式

- 用它展示进度，那是[进度条](./progress)。
- 不允许清空却也没有默认值，用户误点后无法恢复。

## API 参考

### 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-rating>` |
| Vue 组件 | `XhRatingControl` `XhRatingHiddenInput` `XhRatingItem` `XhRatingLabel` `XhRatingRoot` `XhRatingValueText` |
| 组合式函数 | `useRating` |
| 状态机 | `ratingMachine` |
| 皮肤 | `@xihan-ui/styles/rating.css` |

### Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `value` | `number` |  | 受控评分。提供即受控：内部不再自行落值，只发 onValueChange。 |
| `defaultValue` | `number` |  | 非受控初值，默认 0（尚未评分）。 |
| `count` | `number` |  | 星星颗数，默认 5。 |
| `allowHalf` | `boolean` |  | 允许半颗星：档位从 1 变为 0.5。 |
| `allowClear` | `boolean` |  | 再次点击当前档位即清零，键盘在最低档再向下一步同样清零；默认开启。 |
| `disabled` | `boolean` |  | 完全不可交互：退出 Tab 序列，指针与键盘都不响应。 |
| `readOnly` | `boolean` |  | 只读：仍可聚焦、仍能被读屏朗读，但不可修改，也不提供悬停预览。 |
| `required` | `boolean` |  |  |
| `name` | `string` |  | 表单字段名；提供后表单影子才带 name 并参与提交。 |
| `dir` | `Direction` |  | 文字方向，默认 'ltr'。只改写左右方向键与指针落在哪半边的语义。 |
| `tone` | `Tone` |  | 语气：brand / neutral / success / warning / danger / info，决定使用哪族颜色。 |
| `size` | `Size` |  | 尺寸：sm / md / lg。 |
| `translations` | `Partial<RatingTranslations>` |  |  |
| `onValueChange` | `(details: RatingValueChangeDetails) => void` |  |  |
| `onHoverChange` | `(details: RatingHoverChangeDetails) => void` |  | 悬停预览变化；指针离开时带 null。它不代表值已变化。 |

### 事件

自定义元素将载荷放在 `detail`；Vue 使用同名 emit。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `value-change` | `RatingValueChangeDetails` | 评分变化；detail 为 `{ value: number }` |
| `hover-change` | `RatingHoverChangeDetails` | 悬停预览变化；detail 为 `{ value: number \| null }`，指针离开时带 null |

### 插槽

仅列出带载荷的插槽。

| Vue 组件 | 插槽 | 载荷 | 说明 |
| --- | --- | --- | --- |
| `XhRatingItem` | `default` | `RatingItemSlotProps` |  |
| `XhRatingRoot` | `default` | `RatingRootSlotProps` |  |

### React 适配器 props

只列各组件自己声明的那些：继承自 `ComponentPropsWithRef` 的 DOM 属性不在其中，根组件上与上面 Props 表同名的也不重复列。Vue 的对应物是上面的插槽表。

| React 组件 | 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- | --- |
| `XhRatingItem` | `value` | `number \| string` | 是 | 星序号，兼收字符串；向下传递前统一归为数字。 |
| `XhRatingItem` | `children` | `SlotChildren<RatingItemSlotProps>` |  |  |
| `XhRatingRoot` | `children` | `SlotChildren<RatingRootSlotProps>` |  |  |

### 状态

公开状态写入 `data-state`。

| 部件 | 取值 |
| --- | --- |
| `item` | 'checked' \| 'unchecked' |

以下名称仅用于内部状态机。

**状态**：`idle`

**事件**：`VALUE.SET` · `VALUE.STEP` · `VALUE.TO_MIN` · `VALUE.TO_MAX` · `ITEM.SELECT` · `ITEM.FOCUS` · `ITEM.HOVER` · `HOVER.CLEAR` · `CONTROL.BLUR` · `FORM.RESET` · `PRESS.START` · `PRESS.END`

**判据**：`canInteract`

### connect API

`getXxxProps()` 返回对应部件的宿主属性。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `value` | `number` | 已归一化的评分：非法与越界的宿主输入在这里被夹回。 |
| `hoveredValue` | `number \| null` | 指针预览值；没有预览（或不可交互）时为 null。 |
| `highlightedValue` | `number` | 当前应点亮到的位置：有预览时是预览值，否则是评分。样式与 data-highlighted 使用的都是它。 |
| `valueText` | `string` | 分值文本：当前应点亮到的数值，指针预览期间跟随预览值。 |
| `count` | `number` |  |
| `empty` | `boolean` | 尚未评分（value 为 0）。 |
| `disabled` | `boolean` |  |
| `readOnly` | `boolean` |  |
| `items` | `readonly number[]` | 1..count 的序号表，作者直接遍历它渲染星星。 |
| `getItemState` | `(props: RatingItemProps) => RatingItemState` |  |
| `setValue` | `(next: number) => void` |  |
| `getRootProps` | `() => T['element']` |  |
| `getLabelProps` | `() => T['element']` |  |
| `getControlProps` | `() => T['element']` |  |
| `getValueTextProps` | `() => T['element']` | 分值文本：写在 root 中、control 的兄弟；aria-hidden，读屏使用星星自身的可及名。 |
| `getItemProps` | `(props: RatingItemProps) => T['element']` |  |
| `getHiddenInputProps` | `() => T['input']` | 表单出口：一份视觉隐藏的原生输入，随表单提交当前评分。 |

## 无障碍

### 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/radio/#keyboardinteraction)

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `Tab` / `Shift+Tab` | focus outside the control | 整条评分带只占一个 Tab 位：焦点进入锚点星，无锚点时进入容器并由它转移到首颗 |
| `ArrowRight` / `ArrowUp` | focus in control, not disabled/readOnly | 加一档（allowHalf 时半颗），到顶停在 count；dir=rtl 时改由 ArrowLeft 承担 |
| `ArrowLeft` / `ArrowDown` | focus in control, not disabled/readOnly | 减一档，到底停在最小档，不会退回"还没评"；dir=rtl 时改由 ArrowRight 承担 |
| `Home` | focus in control, not disabled/readOnly | 取最小档（allowHalf 时是半颗，否则一颗） |
| `End` | focus in control, not disabled/readOnly | 取满分（count） |

### ARIA

以下属性由 `connect` 生成。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `control` | `aria-disabled` | 'true' \| 'false' |
| `control` | `aria-labelledby` | `label` 部件的 id |
| `control` | `aria-orientation` | 'horizontal' |
| `control` | `aria-readonly` | 'true' \| 'false' |
| `control` | `aria-required` | 'true' \| 'false' |
| `control` | `role` | 'radiogroup' |
| `value-text` | `aria-hidden` | 'true' |
| `item` | `aria-checked` | 'true' \| 'false' |
| `item` | `aria-disabled` | 'true' \| 'false' |
| `item` | `aria-label` | itemLabel?.(item.value, count) |
| `item` | `aria-posinset` | item.value |
| `item` | `aria-setsize` | ratingMax(prop('count')) |
| `item` | `role` | 'radio' |
| `hidden-input` | `aria-hidden` | 'true' |

## 样式参考

### 皮肤

`@xihan-ui/styles/rating.css` 使用 `[data-scope="rating"][data-part="root"]` 部件选择器，位于 `xihan.components` 层。覆盖样式使用 `xihan.overrides`。

`forced-colors: active` 下另有一套规则：颜色交给系统，边框与状态标记改用系统色关键字。

### 数据属性

由 `connect` 生成；条件不成立时不输出无值属性。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-disabled` | ''（条件成立时才出现） |
| `root` | `data-empty` | ''（条件成立时才出现） |
| `root` | `data-readonly` | ''（条件成立时才出现） |
| `root` | `data-size` | props.size |
| `root` | `data-tone` | props.tone |
| `label` | `data-disabled` | ''（条件成立时才出现） |
| `control` | `data-disabled` | ''（条件成立时才出现） |
| `control` | `data-readonly` | ''（条件成立时才出现） |
| `value-text` | `data-disabled` | ''（条件成立时才出现） |
| `value-text` | `data-empty` | ''（条件成立时才出现） |
| `value-text` | `data-readonly` | ''（条件成立时才出现） |
| `item` | `data-disabled` | ''（条件成立时才出现） |
| `item` | `data-half` | ''（条件成立时才出现） |
| `item` | `data-highlighted` | ''（条件成立时才出现） |
| `item` | `data-pressed` | ''（条件成立时才出现） |
| `item` | `data-readonly` | ''（条件成立时才出现） |
| `item` | `data-state` | 'checked' \| 'unchecked' |
| `item` | `data-xh-action-control` | '' |
| `item` | `data-xh-action-display` | 'always' |
| `item` | `data-xh-action-profile` | 'icon' |
| `item` | `data-xh-action-size` | 'xs' |
| `item` | `data-xh-action-variant` | 'ghost' |
| `hidden-input` | `data-disabled` | ''（条件成立时才出现） |

<!-- xh-component-tokens:start -->
### CSS 变量

本组件公开覆盖槽由独立皮肤的实际消费位生成；默认来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 默认来源 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `--xh-rating-gap` | `root` | `gap` | `default` | `--xh-space-1` | rating 的 root 部件 gap 覆盖槽。 |
| `--xh-rating-item-bg-pressed` | `item` | `background-color` | `disabled`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-bg-subtle-hover` | rating 的 item 部件 background-color 覆盖槽。 |
| `--xh-rating-item-fg` | `item` | `background-color`<br>`background-image`<br>`color` | `default`<br>`dir(rtl)`<br>`disabled`<br>`empty`<br>`focus-visible`<br>`half`<br>`hover`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not(:empty)`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-fg-subtle` | rating 的 item 部件 background-color、background-image、color 覆盖槽。 |
| `--xh-rating-item-fg-highlighted` | `item` | `background-color`<br>`background-image`<br>`color` | `@media print`<br>`dir(rtl)`<br>`disabled`<br>`empty`<br>`focus-visible`<br>`half`<br>`highlighted`<br>`hover`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not(:empty)`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-_rating-accent` | rating 的 item 部件 background-color、background-image、color 覆盖槽。 |
| `--xh-rating-item-font-size` | `item`<br>`root` | `--xh-icon-size`<br>`font-size` | `default` | `--xh-_rating-item-size` | rating 的 item、root 部件 --xh-icon-size、font-size 覆盖槽。 |
| `--xh-rating-item-gap` | `control` | `gap` | `default` | `--xh-_rating-item-gap` | rating 的 control 部件 gap 覆盖槽。 |
| `--xh-rating-item-radius` | `item` | `border-radius` | `default` | `--xh-shape-control` | rating 的 item 部件 border-radius 覆盖槽。 |
| `--xh-rating-label-fg` | `label` | `color` | `default` | `--xh-fg-default` | rating 的 label 部件 color 覆盖槽。 |
| `--xh-rating-label-fg-disabled` | `label` | `color` | `disabled` | `--xh-fg-subtle` | rating 的 label 部件 color 覆盖槽。 |
| `--xh-rating-label-font-size` | `label` | `font-size` | `default` | `--xh-text-label-size` | rating 的 label 部件 font-size 覆盖槽。 |
| `--xh-rating-label-font-weight` | `label` | `font-weight` | `default` | `--xh-text-label-weight` | rating 的 label 部件 font-weight 覆盖槽。 |
| `--xh-rating-value-text-fg` | `value-text` | `color` | `default` | `--xh-fg-muted` | rating 的 value-text 部件 color 覆盖槽。 |
| `--xh-rating-value-text-fg-disabled` | `value-text` | `color` | `disabled` | `--xh-fg-subtle` | rating 的 value-text 部件 color 覆盖槽。 |
| `--xh-rating-value-text-font-size` | `value-text` | `font-size` | `default` | `--xh-_rating-font-size` | rating 的 value-text 部件 font-size 覆盖槽。 |
<!-- xh-component-tokens:end -->

### 动效

动效角色：按压 · 状态 · 切换（见[动效规范](../design/motion#角色)）。

`clip-path` 走 `transition` 过渡。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。

### 响应式

皮肤另按输入能力分档：`pointer: coarse`：同一份皮肤在触屏与带指针的设备上不一样，与视口宽度无关。

### RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像；另有按 `dir` 分支的规则。
