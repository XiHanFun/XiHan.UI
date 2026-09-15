# ColorSwatchPicker 颜色色块选择器 <Badge type="info" text="alpha" />

从一组固定颜色中选择一个：主题色、标签色、高亮色。每格是一个 `role=radio` 的色块，整组是一个 `radiogroup`，即把选项绘制为颜色的[单选组](./radio-group)。需要自由调出任意颜色时使用[颜色选择器](./color-picker)，它内嵌的预设色板使用的就是本组件。

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/color-swatch-picker" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/color-swatch-picker.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/color-swatch-picker" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/color-swatch-picker" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/color-swatch-picker.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## 用法

提供一组颜色数据即自动铺开；每格是一个 radio，方向键在格子间移动并选中

<XhDemo src="color-swatch-picker/01-basic" />

## 组件结构

加粗的是必需部件。

`data-scope="color-swatch-picker"`：**`root`** · `label` · **`item`** · **`swatch`** · `indicator` · `hidden-input`

## 示例

### 手写格子

不提供数据也可以：每格自行声明 value，名字与禁用写在格子上；半透明颜色铺在棋盘格上

<XhDemo src="color-swatch-picker/02-items" />

### 状态

禁用整组置灰、只读只阻止落值不阻止焦点、无效把描边转为警示色

<XhDemo src="color-swatch-picker/03-states" />

### 尺寸与语气

格子边长跟随控件行高分三档；tone 决定选中环与选中标记使用哪族颜色

<XhDemo src="color-swatch-picker/04-size-tone" />

## 设计指引

### 何时使用

- 可选颜色是有限的一组，且每个颜色都有含义（品牌色、状态色、日历分类色）。
- 需要一次看到全部选项再挑选，不打开浮层。
- 表单需要提交一个颜色串，且不需要自由调色。

### 何时不用

- 需要自由调出任意颜色时，使用[颜色选择器](./color-picker)，它把色板与取色面组合在一起。
- 只展示一个颜色、不接受选择时，使用[颜色色块](./color-swatch)。
- 需要手动输入颜色串时，使用[颜色字段](./color-field)。
- 选项不是颜色而是文字时，使用[单选组](./radio-group)。

### 特性

- 选中按颜色比较而不按字符串比较：`rgb(255, 0, 0)` 与 `#ff0000` 是同一格，受控 `value` 使用任一写法都能匹配。
- 与单选组同一套 roving tabindex：整组只占一个 Tab 位，四个方向键在格子间移动焦点并选中，到末端回绕，禁用格跳过；Space 选中当前格。
- 焦点从组外进入时落在已选中的格子，没有选中时落在第一格。
- `swatches` 提供数据：可访问名称与禁用从数据中读取，格子部件只需报告 `value`；不写默认内容时按数据自动铺开。
- 每格的色块面由 Swatch 家族绘制：无法解析的串只显示棋盘格，半透明颜色铺在棋盘格上。
- `readOnly` 时方向键照常移动焦点但不取值；`disabled` 整组置灰，格子仍可聚焦。
- 尺寸 sm / md / lg 三档：格子边长跟随控件行高，与旁边的按钮、字段等高。
- 选中环与选中标记随 `data-tone` 变化；标记自带一圈画布色描边，落在任何颜色上都可见。
- 高对比模式下色块保留原色，选中环与标记换用系统高亮色；打印时标记改为实边。

### 组合

- 内嵌在[颜色选择器](./color-picker)的浮层中作为预设色板。
- 与[颜色字段](./color-field)并排：色板选择常用色，字段输入精确值。
- 放入[表单字段](./field)承接标题、说明与错误信息，`disabled` / `readOnly` / `invalid` / `required` 随字段下发。

### 最佳实践

- 每格提供名称（`swatches[].label` 或部件的 `label`），读屏用户听到的应是“品牌红”而不是 `#e11d48`。
- 色板的颜色数量控制在一眼可扫完的范围，更多时改用[颜色选择器](./color-picker)。
- 有初始值时使用 `defaultValue`，焦点进组时直接落在该格。

### 反模式

- 用它做多选：一格只能选中一个；需要多选颜色时使用[复选框组](./checkbox-group)配合[颜色色块](./color-swatch)。
- 把颜色写成 `red` 等关键字：不在支持的写法内，该格只显示棋盘格。
- 同一组内放同一颜色的不同写法：它们会同时算作选中。

## API 参考

### 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-color-swatch-picker>` |
| Vue 组件 | `XhColorSwatchPickerItem` `XhColorSwatchPickerLabel` `XhColorSwatchPickerRoot` |
| 组合式函数 | `useColorSwatchPicker` |
| 状态机 | `colorSwatchPickerMachine` |
| 皮肤 | `@xihan-ui/styles/color-swatch-picker.css` |

### Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `swatches` | `ColorSwatchPickerNode[]` |  | 格子数据，可及名与禁用的事实源。提供后格子部件只需声明 value。 未提供时回到名字与禁用都写在格子部件上的方式。 |
| `value` | `string \| null` |  | 选中的颜色串。提供即受控：写入只发 onValueChange 不落内部值。写法不同的同一颜色也视为选中。 |
| `defaultValue` | `string \| null` |  |  |
| `disabled` | `boolean` |  |  |
| `readOnly` | `boolean` |  | 只读：不可选择，但仍可聚焦、方向键照常移动焦点，对比度不降低。 |
| `invalid` | `boolean` |  | 校验失败：只改变呈现，不阻止交互。 |
| `required` | `boolean` |  | 必填：随表单校验一起使用，只发无障碍属性，不自行拦截提交。 |
| `dir` | `Direction` |  | 文字方向，默认 'ltr'；只改写左右两键的语义。 |
| `name` | `string` |  | 表单字段名。 |
| `size` | `Size` |  | 尺寸：sm / md / lg，影响格子的边长与间距。 |
| `tone` | `Tone` |  | 语气：决定选中环与选中标记使用哪族颜色。 |
| `translations` | `Partial<ColorSwatchPickerTranslations>` |  |  |
| `onValueChange` | `(details: ColorSwatchPickerValueChangeDetails) => void` |  | value 变化回调。 |

### 事件

自定义元素将载荷放在 `detail`；Vue 使用同名 emit。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `value-change` | `ColorSwatchPickerValueChangeDetails` | 选中值变化；detail 为 `{ value: string \| null }` |

### 插槽

仅列出带载荷的插槽。

| Vue 组件 | 插槽 | 载荷 | 说明 |
| --- | --- | --- | --- |
| `XhColorSwatchPickerRoot` | `default` | `ColorSwatchPickerRootSlotProps` |  |
| `XhColorSwatchPickerRoot` | `label` | — |  |

### 状态

以下名称仅用于内部状态机。

**状态**：`idle`

**事件**：`VALUE.SET` · `ITEM.SELECT` · `ITEM.FOCUS` · `GROUP.BLUR` · `FORM.RESET`

### connect API

`getXxxProps()` 返回对应部件的宿主属性。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `value` | `string \| null` |  |
| `swatches` | `readonly ColorSwatchPickerNodeMeta[]` | 由 swatches 推导的格子元信息，按数据顺序排列；未提供 swatches 时为空数组。 |
| `focusedValue` | `string \| null` | 焦点在组外时为 null。 |
| `isSelected` | `(value: string) => boolean` | 某个颜色串是否为当前选中的格：写法不同（`#f00` 与 `rgb(255,0,0)`）也视为同一颜色。 |
| `setValue` | `(next: string \| null) => void` |  |
| `getRootProps` | `() => T['element']` |  |
| `getLabelProps` | `() => T['element']` |  |
| `getItemProps` | `(props: ColorSwatchPickerItemProps) => T['element']` | 一格：role=radio，颜色串是它的身份。 |
| `getSwatchProps` | `(props: ColorSwatchPickerItemProps) => T['element']` | 格内的色块面：使用 Swatch 家族绘制颜色，纯装饰。 |
| `getIndicatorProps` | `(props: ColorSwatchPickerItemProps) => T['element']` | 选中标记（对号），纯装饰。 |
| `getHiddenInputProps` | `(props: ColorSwatchPickerItemProps) => T['input']` | 格子对应的隐藏原生 radio 输入，用于表单提交。 |

## 无障碍

### 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/radio/#keyboardinteraction)

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `Tab` / `Shift+Tab` | focus outside the group | 整组只占一个 Tab 位：焦点进入锚点格子（即选中的那格）；落到容器上时由容器转投锚点格子，锚点缺席或被禁用才落首个可停留格 |
| `ArrowDown` / `ArrowRight` | focus in group, group not disabled | 焦点移到下一个可停留格并选中，末格回绕到首格；dir=rtl 时改由 ArrowLeft 承担 |
| `ArrowUp` / `ArrowLeft` | focus in group, group not disabled | 焦点移到上一个可停留格并选中，首格回绕到末格；dir=rtl 时改由 ArrowRight 承担 |
| `Space` | focus on item, item not disabled | 选中当前格 |

### ARIA

以下属性由 `connect` 生成。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `aria-invalid` | 'true' \| 'false' |
| `root` | `aria-label` | label.group |
| `root` | `aria-labelledby` | `label` 部件的 id |
| `root` | `aria-readonly` | 'true' \| 'false' |
| `root` | `aria-required` | 'true' \| 'false' |
| `root` | `role` | 'radiogroup' |
| `item` | `aria-checked` | 'true' \| 'false' |
| `item` | `aria-disabled` | 'true' \| 'false' |
| `item` | `aria-label` | itemLabel(item) |
| `item` | `role` | 'radio' |
| `swatch` | `aria-hidden` | 'true' |
| `indicator` | `aria-hidden` | 'true' |
| `hidden-input` | `aria-hidden` | 'true' |

- 根是 `role=radiogroup`，名称取 label 部件，未提供时读 `translations.group`。
- 每格是 `role=radio` 并显式输出 `aria-checked`；名称依次取 `label`、`swatches` 中的 `label`、`translations.swatch(value)`，颜色串无法表达含义时务必提供名称。
- 禁用格用 `aria-disabled` 表达，仍可聚焦，仍是方向键的起点。
- 每格内有一个 `inert` 的隐藏原生 radio 承接表单提交，不进入焦点序列与可访问树。

## 样式参考

### 皮肤

`@xihan-ui/styles/color-swatch-picker.css` 使用 `[data-scope="color-swatch-picker"][data-part="root"]` 部件选择器，位于 `xihan.components` 层。覆盖样式使用 `xihan.overrides`。

`forced-colors: active` 下另有一套规则：颜色交给系统，边框与状态标记改用系统色关键字。

### 数据属性

由 `connect` 生成；条件不成立时不输出无值属性。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-disabled` | ''（条件成立时才出现） |
| `root` | `data-invalid` | ''（条件成立时才出现） |
| `root` | `data-readonly` | ''（条件成立时才出现） |
| `root` | `data-required` | ''（条件成立时才出现） |
| `root` | `data-size` | props.size |
| `root` | `data-tone` | props.tone |
| `swatch` | `data-xh-swatch` | '' |
| `swatch` | `data-xh-swatch-size` | props.size |

<!-- xh-component-tokens:start -->
### CSS 变量

本组件公开覆盖槽由独立皮肤的实际消费位生成；默认来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 默认来源 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `--xh-color-swatch-picker-gap` | `root` | `gap` | `default` | `--xh-_color-swatch-picker-gap` | color-swatch-picker 的 root 部件 gap 覆盖槽。 |
| `--xh-color-swatch-picker-icon-size` | `root` | `--xh-icon-size` | `default` | `--xh-_color-swatch-picker-mark` | color-swatch-picker 的 root 部件 --xh-icon-size 覆盖槽。 |
| `--xh-color-swatch-picker-indicator-bg` | `indicator` | `background` | `default` | `--xh-_color-swatch-picker-accent` | color-swatch-picker 的 indicator 部件 background 覆盖槽。 |
| `--xh-color-swatch-picker-indicator-border` | `indicator` | `border` | `default` | `--xh-bg-canvas` | color-swatch-picker 的 indicator 部件 border 覆盖槽。 |
| `--xh-color-swatch-picker-indicator-fg` | `indicator` | `background-color`<br>`color` | `default`<br>`empty` | `--xh-_tone-on` | color-swatch-picker 的 indicator 部件 background-color、color 覆盖槽。 |
| `--xh-color-swatch-picker-indicator-size` | `indicator` | `block-size`<br>`inline-size` | `default` | `--xh-_color-swatch-picker-indicator` | color-swatch-picker 的 indicator 部件 block-size、inline-size 覆盖槽。 |
| `--xh-color-swatch-picker-item-radius` | `item`<br>`swatch` | `--xh-swatch-radius`<br>`border-radius` | `default` | `--xh-shape-control` | color-swatch-picker 的 item、swatch 部件 --xh-swatch-radius、border-radius 覆盖槽。 |
| `--xh-color-swatch-picker-item-size` | `item` | `block-size`<br>`inline-size` | `default` | `--xh-_color-swatch-picker-cell` | color-swatch-picker 的 item 部件 block-size、inline-size 覆盖槽。 |
| `--xh-color-swatch-picker-label-fg` | `label` | `color` | `default` | `--xh-fg-muted` | color-swatch-picker 的 label 部件 color 覆盖槽。 |
| `--xh-color-swatch-picker-label-font-size` | `label` | `font-size` | `default` | `--xh-_color-swatch-picker-font-size` | color-swatch-picker 的 label 部件 font-size 覆盖槽。 |
| `--xh-color-swatch-picker-label-font-weight` | `label` | `font-weight` | `default` | `--xh-text-label-weight` | color-swatch-picker 的 label 部件 font-weight 覆盖槽。 |
| `--xh-color-swatch-picker-ring` | `item` | `outline` | `state=checked` | `--xh-_color-swatch-picker-accent` | color-swatch-picker 的 item 部件 outline 覆盖槽。 |
| `--xh-color-swatch-picker-swatch-border` | `swatch` | `--xh-swatch-border` | `default` | `--xh-border-default` | color-swatch-picker 的 swatch 部件 --xh-swatch-border 覆盖槽。 |
| `--xh-color-swatch-picker-swatch-border-hover` | `item`<br>`swatch` | `--xh-swatch-border` | `disabled`<br>`hover`<br>`not([data-disabled], [data-readonly])`<br>`readonly` | `--xh-border-strong` | color-swatch-picker 的 item、swatch 部件 --xh-swatch-border 覆盖槽。 |
| `--xh-color-swatch-picker-swatch-border-invalid` | `swatch` | `--xh-swatch-border` | `invalid` | `--xh-border-invalid` | color-swatch-picker 的 swatch 部件 --xh-swatch-border 覆盖槽。 |
<!-- xh-component-tokens:end -->

### 动效

`border-color` · `opacity` · `scale` 走 `transition` 过渡。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。

### 响应式

- 格子排成可换行的网格，一行放不下时换行；粗指针下命中区是整格。

### RTL

- `dir="rtl"` 只对调左右方向键的语义，上下键不受影响；格子的排列顺序由文档方向决定。
