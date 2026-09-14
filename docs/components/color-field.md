# ColorField 颜色字段 <Badge type="info" text="alpha" />

一个能手打颜色串的单行框：旁边一块当前颜色的色块，框里的字是草稿，回车或失焦收下，收下后按 `format` 重写成规范写法。
它是[文本字段](./text-field)那一族的成员，接的是「我知道要什么颜色、直接打进去」这条路；要在色域里挑，用[颜色选择器](./color-picker)。

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/color-field" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/color-field.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/color-field" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/color-field" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/color-field.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## 用法

框里的字是草稿，回车或失焦收下后按 format 重写；色块画的是收下的值，半截字不会被提交

<XhDemo src="color-field/01-basic" />

## 组件结构

加粗的是必需部件。

`data-scope="color-field"`：**`root`** · `label` · `control` · `swatch` · **`input`** · `clear-trigger` · `hidden-input`

## 示例

### 写法与透明度

手打的任何写法收下后都按 format 重写；开 alpha 才保留透明度，配合 rgba 写法一眼看得出

<XhDemo src="color-field/02-format" />

### 收不下的草稿

解析不出的字留在框里并标成无效，让人看见自己打的是什么；Escape 放弃草稿回到规范文本

<XhDemo src="color-field/03-invalid" />

### 状态与尺寸

禁用、只读、无效三态与 sm / lg 两档；色块与清空按钮跟着字段的尺寸档走

<XhDemo src="color-field/04-states" />

## 设计指引

### 何时使用

- 用户手里有一个颜色串（设计稿上的 `#3b82f6`、`rgb()`），要直接填进表单。
- 主题设置、标注色、图表配色这类要精确到值的地方。
- 与[颜色选择器](./color-picker)并排：选完能看见并微调那个值。

### 何时不用

- 用户不知道颜色串、要看着挑：用[颜色选择器](./color-picker)。
- 只是从几个固定颜色里选一个：用[颜色色块选择器](./color-swatch-picker)。
- 只展示不编辑：用[颜色色块](./color-swatch)。

### 特性

- 认 `#rgb` / `#rrggbb(aa)`、`rgb()` / `rgba()`、`hsl()` / `hsla()`，不认颜色关键字；收下后按 `format`（hex / rgba / hsla）重写，`alpha` 决定带不带透明度。
- 打字只留草稿：值、色块与 `onValueChange` 都不动，`data-editing` 标出正在编辑；回车或失焦收下，Escape 放弃草稿回到规范文本。
- 收不下的草稿留在框里并标成无效（`aria-invalid`、`data-invalid`），让人看见自己打的是什么；再改动就摘掉标记。
- 空串是合法的「没有颜色」：`clearable` 开清空按钮与 Escape 清空，空值时色块只画棋盘格。
- 表单出口经 `hidden-input`：提交的是收下的值，框里的半截字不会被提交；`name` 给了才参与提交。
- 视觉盒走 Field Chrome，色块走 Swatch 家族，清空按钮走 Action Control 的 field-inset 档，与文本字段同一副面孔。

### 组合

- 放进[字段](./field)里：标签、说明与错误由字段渲出来并经 aria-describedby 念到输入框上，禁用 / 只读 / 必填 / 无效四轴随字段下发。
- 与[颜色滑块](./color-slider)并排：滑块推一路、字段看整串，两者共用一个值。

### 最佳实践

- 给 `placeholder` 提示期望的写法（`#rrggbb`），减少收不下的次数。
- 需要透明度时同时开 `alpha` 并把 `format` 设成 `rgba` 或 `hsla`，hex 的第四对不是所有人都认得。
- 在 `onValueChange` 里拿值，别去读输入框：框里可能是还没收下的草稿。

### 反模式

- 把它当自由文本框：收不下的字不会成为值，也不会随表单提交。
- 传颜色关键字（`red`）作初值：解析不出的串会被当成无效值原地不动。

## API 参考

### 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-color-field>` |
| Vue 组件 | `XhColorFieldClearTrigger` `XhColorFieldControl` `XhColorFieldHiddenInput` `XhColorFieldInput` `XhColorFieldLabel` `XhColorFieldRoot` `XhColorFieldSwatch` |
| 组合式函数 | `useColorField` |
| 状态机 | `colorFieldMachine` |
| 皮肤 | `@xihan-ui/styles/color-field.css` |

### Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `value` | `string` |  | 受控的颜色串；给了就由宿主说了算，机器不自改。空串表示没有颜色。 |
| `defaultValue` | `string` |  | 非受控初值，缺省空串。 |
| `format` | `ColorFormat` |  | 值串的写法，默认 hex。手打的任何写法收下后都按它重写。 |
| `alpha` | `boolean` |  | 带透明度，默认关。关掉时收下的颜色恒不透明。 |
| `placeholder` | `string` |  |  |
| `disabled` | `boolean` |  |  |
| `readOnly` | `boolean` |  |  |
| `required` | `boolean` |  |  |
| `invalid` | `boolean` |  |  |
| `name` | `string` |  | 表单字段名；给了才参与提交（经表单影子，输入框里的半截字不会被提交）。 |
| `clearable` | `boolean` |  | 开启清空能力：有值时显出清空按钮、Escape 接管。关掉时按钮带 hidden 收起。 |
| `variant` | `ControlVariant` |  | 形态：outline / subtle / ghost，决定输入框的底与描边怎么画。 |
| `tone` | `Tone` |  | 语气：brand / neutral / success / warning / danger / info，决定聚焦强调用哪族颜色。 |
| `size` | `Size` |  | 尺寸：sm / md / lg，决定输入框、色块与清空按钮的几何档位。 |
| `translations` | `Partial<ColorFieldTranslations>` |  | 读屏文案；缺省英文。 |
| `onValueChange` | `(details: ColorFieldValueChangeDetails) => void` |  |  |

### 事件

自定义元素将载荷放在 `detail`；Vue 使用同名 emit。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `value-change` | `` | 收下的值变化；detail 为 `{ value: string }`，打字途中不发 |

### 插槽

仅列出带载荷的插槽。

| Vue 组件 | 插槽 | 载荷 | 说明 |
| --- | --- | --- | --- |
| `XhColorFieldRoot` | `default` | `ColorFieldRootSlotProps` |  |

### 状态

以下名称仅用于内部状态机。

**状态**：`idle`

**事件**：`INPUT.CHANGE` · `INPUT.COMMIT` · `INPUT.CANCEL` · `VALUE.SET` · `VALUE.CLEAR` · `FORM.RESET`

**判据**：`canEdit` · `canClear`

### connect API

`getXxxProps()` 返回对应部件的宿主属性。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `value` | `string` | 当前值串（与 onValueChange 送出的是同一个）；空串表示没有颜色。 |
| `empty` | `boolean` | 值为空串。 |
| `text` | `string` | 输入框此刻该显示的字：有草稿显示草稿，否则显示值本身。 |
| `editing` | `boolean` | 正在编辑：框里有一份还没收下的草稿。 |
| `draftInvalid` | `boolean` | 上一次收下失败，草稿留在框里。 |
| `rgba` | `ColorRgba` | 值解析出来的颜色；空串或解析不出时是兜底黑，此时看 empty / valid。 |
| `valid` | `boolean` | 值串本身解析得了（空串不算有效）。 |
| `disabled` | `boolean` |  |
| `readOnly` | `boolean` |  |
| `invalid` | `boolean` | 作者标的 invalid，或草稿收不下。 |
| `clearable` | `boolean` |  |
| `canClear` | `boolean` | 清空按钮此刻是否可用（开了 clearable、可编辑、且有值）。 |
| `setValue` | `(next: string) => void` | 直接写值：空串清空，解析不出的串原地不动；只受 disabled/readOnly 约束。 |
| `clear` | `() => void` | 走清空意图，受 canClear 约束；无条件清空请用 setValue('')。 |
| `commit` | `() => void` | 把框里的草稿收下（与回车 / 失焦同一条路）。 |
| `getRootProps` | `() => T['element']` |  |
| `getControlProps` | `() => T['element']` | 视觉盒；描边、底色与聚焦环画在这个节点上，色块、输入框与清空按钮排在它里面。 |
| `getLabelProps` | `() => T['label']` |  |
| `getSwatchProps` | `() => T['element']` | 当前颜色的色块：纯装饰，颜色已在输入框里；空值或无效时只画棋盘格。 |
| `getInputProps` | `() => T['input']` |  |
| `getClearTriggerProps` | `() => T['button']` |  |
| `getHiddenInputProps` | `() => T['input']` | 表单影子：提交的是收下的值，框里的半截字不会被提交。给了 name 才带 name。 |

## 无障碍

### 键盘

规格出处：[W3C APG](https://html.spec.whatwg.org/multipage/input.html#text-(type=text)-state-and-search-state-(type=search))

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `Enter` | focus in input, 框里有还没收下的草稿 | 收下草稿：解析得了就按 format 重写成值，解析不了保留草稿并标成无效；没在编辑时不接管，回车照常提交表单 |
| `Escape` | focus in input, 框里有还没收下的草稿 | 放弃草稿，框里回到当前值的规范文本 |
| `Escape` | focus in input, 没有草稿, clearable 且值非空, not disabled/readOnly | 清空值；条件不满足即不接管该键，交回给外层与浏览器 |

### ARIA

以下属性由 `connect` 生成。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `swatch` | `aria-hidden` | 'true' |
| `input` | `aria-invalid` | 'true' \| 'false' |
| `input` | `aria-labelledby` | `label` 部件的 id |
| `input` | `aria-readonly` | 'true' \| 'false' |
| `input` | `aria-required` | 'true' \| 'false' |
| `clear-trigger` | `aria-label` | label.clearTrigger |

## 样式参考

### 皮肤

`@xihan-ui/styles/color-field.css` 使用 `[data-scope="color-field"][data-part="root"]` 部件选择器，位于 `xihan.components` 层。覆盖样式使用 `xihan.overrides`。

### 数据属性

由 `connect` 生成；条件不成立时不输出无值属性。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-disabled` | ''（条件成立时才出现） |
| `root` | `data-editing` | ''（条件成立时才出现） |
| `root` | `data-empty` | ''（条件成立时才出现） |
| `root` | `data-invalid` | ''（条件成立时才出现） |
| `root` | `data-readonly` | ''（条件成立时才出现） |
| `root` | `data-size` | props.size |
| `root` | `data-tone` | props.tone |
| `root` | `data-variant` | props.variant |
| `root` | `data-xh-action-owner` | '' |
| `label` | `data-disabled` | ''（条件成立时才出现） |
| `control` | `data-disabled` | ''（条件成立时才出现） |
| `control` | `data-editing` | ''（条件成立时才出现） |
| `control` | `data-empty` | ''（条件成立时才出现） |
| `control` | `data-invalid` | ''（条件成立时才出现） |
| `control` | `data-readonly` | ''（条件成立时才出现） |
| `control` | `data-xh-field-chrome` | '' |
| `control` | `data-xh-field-size` | props.size |
| `swatch` | `data-disabled` | ''（条件成立时才出现） |
| `swatch` | `data-empty` | ''（条件成立时才出现） |
| `swatch` | `data-xh-swatch` | '' |
| `swatch` | `data-xh-swatch-size` | props.size |
| `input` | `data-disabled` | ''（条件成立时才出现） |
| `input` | `data-editing` | ''（条件成立时才出现） |
| `input` | `data-empty` | ''（条件成立时才出现） |
| `input` | `data-invalid` | ''（条件成立时才出现） |
| `input` | `data-xh-field-input` | '' |
| `input` | `data-xh-field-layout` | 'single-line' |
| `clear-trigger` | `data-xh-action-control` | '' |
| `clear-trigger` | `data-xh-action-display` | 'has-value' |
| `clear-trigger` | `data-xh-action-has-value` | ''（条件成立时才出现） |
| `clear-trigger` | `data-xh-action-profile` | 'field-inset' |
| `clear-trigger` | `data-xh-action-size` | props.size |

<!-- xh-component-tokens:start -->
### CSS 变量

本组件公开覆盖槽由独立皮肤的实际消费位生成；缺省来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 缺省来源 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `--xh-color-field-action-bg` | `clear-trigger` | `background-color` | `default` | `transparent` | color-field 的 clear-trigger 部件 background-color 覆盖槽。 |
| `--xh-color-field-action-bg-active` | `clear-trigger` | `background-color` | `active`<br>`disabled`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])` | `--xh-bg-subtle-active` | color-field 的 clear-trigger 部件 background-color 覆盖槽。 |
| `--xh-color-field-action-bg-hover` | `clear-trigger` | `background-color` | `disabled`<br>`hover`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])` | `--xh-bg-subtle-hover` | color-field 的 clear-trigger 部件 background-color 覆盖槽。 |
| `--xh-color-field-action-fg` | `clear-trigger` | `color` | `default` | `--xh-fg-muted` | color-field 的 clear-trigger 部件 color 覆盖槽。 |
| `--xh-color-field-action-fg-hover` | `clear-trigger` | `color` | `disabled`<br>`hover`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])` | `--xh-fg-default` | color-field 的 clear-trigger 部件 color 覆盖槽。 |
| `--xh-color-field-action-font-size` | `clear-trigger` | `font-size` | `default` | `--xh-_color-field-action-font-size` | color-field 的 clear-trigger 部件 font-size 覆盖槽。 |
| `--xh-color-field-action-radius` | `clear-trigger` | `border-radius` | `default` | `--xh-shape-inset` | color-field 的 clear-trigger 部件 border-radius 覆盖槽。 |
| `--xh-color-field-action-size` | `clear-trigger` | `block-size`<br>`inline-size`<br>`min-inline-size` | `default`<br>`xh-action-profile=field-inset` | `--xh-_action-profile-visual-size` | color-field 的 clear-trigger 部件 block-size、inline-size、min-inline-size 覆盖槽。 |
| `--xh-color-field-control-bg` | `control` | `background-color` | `xh-field-chrome` | `--xh-_color-field-bg` | color-field 的 control 部件 background-color 覆盖槽。 |
| `--xh-color-field-control-bg-disabled` | `control` | `background-color` | `disabled`<br>`xh-field-chrome` | `--xh-bg-subtle` | color-field 的 control 部件 background-color 覆盖槽。 |
| `--xh-color-field-control-bg-hover` | `control` | `background-color` | `disabled`<br>`hover`<br>`invalid`<br>`loading`<br>`not([data-disabled])`<br>`not([data-invalid])`<br>`not([data-loading])`<br>`not([data-readonly])`<br>`readonly`<br>`xh-field-chrome` | `--xh-_color-field-bg-hover` | color-field 的 control 部件 background-color 覆盖槽。 |
| `--xh-color-field-control-bg-readonly` | `control` | `background-color` | `readonly`<br>`xh-field-chrome` | `--xh-bg-subtle` | color-field 的 control 部件 background-color 覆盖槽。 |
| `--xh-color-field-control-border` | `control` | `border` | `xh-field-chrome` | `--xh-_color-field-border` | color-field 的 control 部件 border 覆盖槽。 |
| `--xh-color-field-control-border-focus` | `control` | `border-color` | `disabled`<br>`focus-within`<br>`not([data-disabled])`<br>`xh-field-chrome` | `--xh-_color-field-border-focus` | color-field 的 control 部件 border-color 覆盖槽。 |
| `--xh-color-field-control-border-hover` | `control` | `border-color` | `disabled`<br>`hover`<br>`invalid`<br>`loading`<br>`not([data-disabled])`<br>`not([data-invalid])`<br>`not([data-loading])`<br>`not([data-readonly])`<br>`readonly`<br>`xh-field-chrome` | `--xh-_color-field-border-hover` | color-field 的 control 部件 border-color 覆盖槽。 |
| `--xh-color-field-control-border-invalid` | `control` | `border-color` | `invalid`<br>`xh-field-chrome` | `--xh-border-invalid` | color-field 的 control 部件 border-color 覆盖槽。 |
| `--xh-color-field-control-fg` | `control` | `color` | `xh-field-chrome` | `--xh-fg-default` | color-field 的 control 部件 color 覆盖槽。 |
| `--xh-color-field-control-gap` | `control` | `gap` | `xh-field-chrome` | `--xh-_color-field-gap` | color-field 的 control 部件 gap 覆盖槽。 |
| `--xh-color-field-control-h` | `control` | `block-size`<br>`min-block-size` | `has([data-xh-field-input][data-xh-field-layout='multi-tag'])`<br>`has([data-xh-field-input][data-xh-field-layout='single-line'])`<br>`has([data-xh-field-input][data-xh-field-layout='textarea'])`<br>`xh-field-chrome`<br>`xh-field-input`<br>`xh-field-layout=multi-tag`<br>`xh-field-layout=single-line`<br>`xh-field-layout=textarea` | `--xh-_color-field-h` | color-field 的 control 部件 block-size、min-block-size 覆盖槽。 |
| `--xh-color-field-control-min-w` | `control`<br>`root` | `min-inline-size` | `default`<br>`xh-field-chrome` | `--xh-control-min-w` | color-field 的 control、root 部件 min-inline-size 覆盖槽。 |
| `--xh-color-field-control-px` | `control` | `padding-inline` | `xh-field-chrome` | `--xh-_color-field-px` | color-field 的 control 部件 padding-inline 覆盖槽。 |
| `--xh-color-field-control-radius` | `control` | `border-radius` | `xh-field-chrome` | `--xh-shape-surface` | color-field 的 control 部件 border-radius 覆盖槽。 |
| `--xh-color-field-control-shadow` | `control` | `box-shadow` | `xh-field-chrome` | `--xh-_color-field-shadow` | color-field 的 control 部件 box-shadow 覆盖槽。 |
| `--xh-color-field-gap` | `root` | `gap` | `default` | `--xh-space-1` | color-field 的 root 部件 gap 覆盖槽。 |
| `--xh-color-field-icon-size` | `root` | `--xh-icon-size` | `default`<br>`size=lg`<br>`size=sm` | `--xh-glyph-size-lg`<br>`--xh-glyph-size-md`<br>`--xh-glyph-size-sm` | color-field 的 root 部件 --xh-icon-size 覆盖槽。 |
| `--xh-color-field-input-autofill-bg` | `input` | `box-shadow` | `-webkit-autofill`<br>`autofill`<br>`xh-field-input` | `--xh-bg-canvas` | color-field 的 input 部件 box-shadow 覆盖槽。 |
| `--xh-color-field-input-autofill-fg` | `input` | `-webkit-text-fill-color` | `-webkit-autofill`<br>`autofill`<br>`xh-field-input` | `--xh-fg-default` | color-field 的 input 部件 -webkit-text-fill-color 覆盖槽。 |
| `--xh-color-field-input-fg` | `input` | `color` | `xh-field-input` | `--xh-fg-default` | color-field 的 input 部件 color 覆盖槽。 |
| `--xh-color-field-input-font-size` | `input` | `font-size` | `xh-field-input` | `--xh-_color-field-font-size` | color-field 的 input 部件 font-size 覆盖槽。 |
| `--xh-color-field-label-fg` | `label` | `color` | `default` | `--xh-fg-default` | color-field 的 label 部件 color 覆盖槽。 |
| `--xh-color-field-label-fg-disabled` | `label` | `color` | `disabled` | `--xh-fg-subtle` | color-field 的 label 部件 color 覆盖槽。 |
| `--xh-color-field-label-font-size` | `label` | `font-size` | `default` | `--xh-_color-field-label-font-size` | color-field 的 label 部件 font-size 覆盖槽。 |
| `--xh-color-field-label-font-weight` | `label` | `font-weight` | `default` | `--xh-text-label-weight` | color-field 的 label 部件 font-weight 覆盖槽。 |
| `--xh-color-field-placeholder-fg` | `input` | `color` | `placeholder`<br>`xh-field-input` | `--xh-fg-subtle` | color-field 的 input 部件 color 覆盖槽。 |
| `--xh-color-field-swatch-border` | `swatch` | `--xh-swatch-border` | `default` | `--xh-border-default` | color-field 的 swatch 部件 --xh-swatch-border 覆盖槽。 |
| `--xh-color-field-swatch-radius` | `swatch` | `--xh-swatch-radius` | `default` | `--xh-shape-inset` | color-field 的 swatch 部件 --xh-swatch-radius 覆盖槽。 |
| `--xh-color-field-swatch-size` | `swatch` | `--xh-swatch-size` | `default` | `--xh-_swatch-size` | color-field 的 swatch 部件 --xh-swatch-size 覆盖槽。 |
<!-- xh-component-tokens:end -->

### 动效

本组件皮肤不含过渡与关键帧，也没有脚本驱动的动效：状态一变，外观立即到位。

### RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像。
