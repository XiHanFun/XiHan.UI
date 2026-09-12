# Checkbox 复选框

一个可以选中、不选中、也可以处于半选的独立开关。

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/checkbox" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/checkbox.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/checkbox" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/checkbox" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/checkbox.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## 用法

不传 checked 即为非受控

<XhDemo src="checkbox/01-basic" />

## 组件结构

加粗的是必需部件。

`data-scope="checkbox"`：**`root`** · `indicator` · `hidden-input` · `label` · `text`

## 示例

### 三态

checked 传 "indeterminate" 表示部分选中，它不是第三个稳定态：点一下就落到 true

<XhDemo src="checkbox/02-indeterminate" />

### 颜色

tone 决定选中态的底与描边用哪族颜色，所以这里都置为选中

<XhDemo src="checkbox/03-tone" />

### 尺寸

size 同时缩放方框与勾选标记，不写就是缺省档

<XhDemo src="checkbox/04-size" />

### 事件

checked-change 带一份 { checked }，非受控时内部翻转也照发一次

<XhDemo src="checkbox/05-event" />

### 业务取值

checked 只认布尔，在中间换一道，进出两头拿到的都是业务值

<XhDemo src="checkbox/06-value-mapping" />

### 命令式聚焦

节点由作者自己写，DOM 引用因此拿得到：聚焦、失焦与翻转都走命令式

<XhDemo src="checkbox/07-focus" />

### 随表单提交

给了 name 才生出表单影子：勾上才提交，半选按未勾处理，与原生复选框一致

<XhDemo src="checkbox/08-form" />

## 设计指引

### 何时使用

- 表单里的单项同意、单项开关，且要随表单提交。
- 需要表达"部分选中"（全选框对应下面几项只勾了一部分）。

### 何时不用

- 开关立即生效、且是一项设置：用[开关](./switch)。
- 几个互斥项里选一个：用[单选组](./radio-group)。
- 一组多选项：用[复选框组](./checkbox-group)，它管值的汇总。

### 特性

- 三态：选中、未选中、半选（`indeterminate`）。
- `hidden-input` 承担表单参与，`name` / `value` 照常提交。
- `readOnly` 与 `disabled` 不同：只读仍能聚焦、仍被提交。
- 控制盒保持实体：未选中使用 M1 实体底、明确控制边界、顶部高光和接触影；选中与半选使用满足
  控件边界对比的实心语气色，不使用玻璃或 backdrop。
- 勾与半选横杠共用随盒尺寸缩放的光学盒；indicator 常驻，以 120ms 的 opacity / scale 切换，
  不靠增删节点造成布局抖动。自定义 indicator 插槽走同一状态动画。
- 悬停方框或可见标签都会让控制盒响应；按下撤掉海拔并轻压，readOnly / disabled 不产生可操作假反馈。
- 三尺寸和 compact 密度同时调整控制盒、勾形、标签字号与间距；RTL 下方框仍在行内起点，长标签不会压扁方框。
- 明暗、增强对比和 forced-colors 都保留未选中边界、三态字形与键盘焦点；forced-colors 下 disabled
  交给系统 `GrayText`，不再叠加半透明。

### 组合

- 外面套[表单字段](./field)；成组时用[复选框组](./checkbox-group)；在[表格](./table)里做行选择。

### 最佳实践

- 标签点得动——把文字放进 `label` 部件，别只让方框可点。
- 半选只用来表达"下级部分选中"，不要拿它当第三种业务状态。
- 自定义选中底时要同时验证勾形与底、控制盒与页面、聚焦环与控制盒三组对比，六种 tone 都不能只靠色相区分。

### 当前边界

- Checkbox 当前没有 `loading` 状态、`aria-busy` 或在途 indicator 合同。异步提交需要由业务保留受控值并在旁边
  显式呈现进度；后续若增加 loading，必须连同是否允许取消、错误暴露和三端事件一起设计，不能只补一枚 spinner。

### 反模式

- 用单个复选框表达二选一（是 / 否）：用[单选组](./radio-group)，两个选项都要能被读出来。
- 勾上就立刻发请求却不给反馈。

## API 参考

### 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-checkbox>` |
| Vue 组件 | `XhCheckbox` |
| 组合式函数 | `useCheckbox` |
| 状态机 | `checkboxMachine` |
| 皮肤 | `@xihan-ui/styles/checkbox.css` |

### Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `checked` | `CheckboxCheckedState` |  |  |
| `defaultChecked` | `CheckboxCheckedState` |  |  |
| `disabled` | `boolean` |  |  |
| `readOnly` | `boolean` |  | 只读：勾不动，但仍可聚焦、仍参与提交，对比度不降。 |
| `invalid` | `boolean` |  | 校验失败：只改呈现，不挡交互。 |
| `required` | `boolean` |  | 必填：随表单校验一起用，只发无障碍属性，不自行拦提交。 |
| `name` | `string` |  | 表单字段名；给了 hidden-input 才带 name 并参与提交。 |
| `value` | `string` |  | 提交出去的值，缺省 'on'，与原生复选框一致。 |
| `tone` | `Tone` |  | 语气：brand / neutral / success / warning / danger / info，决定选中态用哪族颜色。 |
| `size` | `Size` |  | 尺寸：sm / md / lg，决定方框边长与勾的字号档位。 |
| `onCheckedChange` | `(details: CheckboxCheckedChangeDetails) => void` |  | checked 变化意图回调；受控时是唯一出口，非受控随内部转移一并通知。 |

### 事件

自定义元素将载荷放在 `detail`；Vue 使用同名 emit。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `checked-change` | `CheckboxCheckedChangeDetails` | checked 状态变化；detail 为 `{ checked: boolean }` |

### 插槽

仅列出带载荷的插槽。

| Vue 组件 | 插槽 | 载荷 | 说明 |
| --- | --- | --- | --- |
| `XhCheckbox` | `default` | — | 方框旁的文字；不写就只有一个方框。 |
| `XhCheckbox` | `indicator` | — | 方框里的图形；不写由皮肤画勾。 |

### 状态

公开状态写入 `data-state`。

| 部件 | 取值 |
| --- | --- |
| `root` | 'indeterminate' \| 'checked' \| 'unchecked' |
| `indicator` | 'indeterminate' \| 'checked' \| 'unchecked' |
| `label` | 'indeterminate' \| 'checked' \| 'unchecked' |
| `text` | 'indeterminate' \| 'checked' \| 'unchecked' |

以下名称仅用于内部状态机。

**状态**：`off` · `on` · `indeterminate`

**事件**：`TOGGLE` · `CHECK` · `UNCHECK` · `CONTROLLED.ON` · `CONTROLLED.OFF` · `CONTROLLED.INDETERMINATE` · `FORM.RESET`

**判据**：`isCheckedControlled` · `defaultsToChecked` · `defaultsToIndeterminate`

### connect API

`getXxxProps()` 返回对应部件的宿主属性。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `checked` | `CheckboxCheckedState` |  |
| `setChecked` | `(next: boolean) => void` | 半选只能由 checked prop 给出，这里只接受全选 / 全不选。 |
| `getRootProps` | `() => T['button']` |  |
| `getIndicatorProps` | `() => T['element']` |  |
| `getHiddenInputProps` | `() => T['input']` | 表单影子：勾上才提交，半选按未勾处理。给了 name 才带 name。 |
| `getLabelProps` | `() => T['label']` | 包住方框与文字的 &lt;label&gt;：点文字即切换，方框的可及名从文字来。只在带文字时渲染。 |
| `getTextProps` | `() => T['element']` | 方框旁的文字。 |

## 无障碍

### 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/checkbox/#keyboardinteraction)

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `Space` / `Enter` | focus in root, not disabled | 切换 checked 状态 |

### ARIA

以下属性由 `connect` 生成。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `aria-checked` | 'mixed' \| 'true' \| 'false' |
| `root` | `aria-invalid` | 'true' \| 'false' |
| `root` | `aria-readonly` | 'true' \| 'false' |
| `root` | `aria-required` | 'true' \| 'false' |
| `root` | `role` | 'checkbox' |
| `indicator` | `aria-hidden` | 'true' |

## 样式参考

### 皮肤

`@xihan-ui/styles/checkbox.css` 使用 `[data-scope="checkbox"][data-part="root"]` 部件选择器，位于 `xihan.components` 层。覆盖样式使用 `xihan.overrides`。

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
| `root` | `data-state` | 'indeterminate' \| 'checked' \| 'unchecked' |
| `root` | `data-tone` | props.tone |
| `indicator` | `data-state` | 'indeterminate' \| 'checked' \| 'unchecked' |
| `label` | `data-disabled` | ''（条件成立时才出现） |
| `label` | `data-invalid` | ''（条件成立时才出现） |
| `label` | `data-readonly` | ''（条件成立时才出现） |
| `label` | `data-size` | props.size |
| `label` | `data-state` | 'indeterminate' \| 'checked' \| 'unchecked' |
| `text` | `data-disabled` | ''（条件成立时才出现） |
| `text` | `data-invalid` | ''（条件成立时才出现） |
| `text` | `data-state` | 'indeterminate' \| 'checked' \| 'unchecked' |

<!-- xh-component-tokens:start -->
### CSS 变量

本组件公开覆盖槽由独立皮肤的实际消费位生成；缺省来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 缺省来源 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `--xh-checkbox-bg` | `root` | `background-color` | `default` | `--xh-material-soft-bg` | checkbox 的 root 部件 background-color 覆盖槽。 |
| `--xh-checkbox-bg-checked` | `root` | `background-color` | `state=checked`<br>`state=indeterminate` | `--xh-_checkbox-accent` | checkbox 的 root 部件 background-color 覆盖槽。 |
| `--xh-checkbox-border` | `root` | `border`<br>`border-color` | `contrast=more`<br>`default`<br>`state=unchecked`<br>`where([data-contrast='more'])` | `--xh-border-control`<br>`--xh-border-strong` | checkbox 的 root 部件 border、border-color 覆盖槽。 |
| `--xh-checkbox-border-checked` | `root` | `border-color` | `state=checked`<br>`state=indeterminate` | `--xh-_checkbox-accent` | checkbox 的 root 部件 border-color 覆盖槽。 |
| `--xh-checkbox-border-hover` | `label`<br>`root` | `border-color` | `@media (hover: hover)`<br>`disabled`<br>`hover`<br>`invalid`<br>`not([data-disabled])`<br>`not([data-invalid])`<br>`not([data-readonly])`<br>`readonly` | `--xh-_checkbox-accent` | checkbox 的 label、root 部件 border-color 覆盖槽。 |
| `--xh-checkbox-border-invalid` | `root` | `border-color` | `invalid`<br>`state=checked`<br>`state=indeterminate` | `--xh-border-invalid` | checkbox 的 root 部件 border-color 覆盖槽。 |
| `--xh-checkbox-fg` | `root` | `color` | `default` | `--xh-_checkbox-on-accent` | checkbox 的 root 部件 color 覆盖槽。 |
| `--xh-checkbox-fg-invalid` | `label`<br>`text` | `color` | `invalid` | `--xh-fg-danger` | checkbox 的 label、text 部件 color 覆盖槽。 |
| `--xh-checkbox-highlight` | `root` | `background-image` | `default` | `--xh-material-soft-highlight` | checkbox 的 root 部件 background-image 覆盖槽。 |
| `--xh-checkbox-icon-size` | `root` | `--xh-icon-size` | `default` | `--xh-_checkbox-glyph` | checkbox 的 root 部件 --xh-icon-size 覆盖槽。 |
| `--xh-checkbox-indicator-fg` | `indicator` | `background-color` | `state=indeterminate` | `--xh-_checkbox-on-accent` | checkbox 的 indicator 部件 background-color 覆盖槽。 |
| `--xh-checkbox-label-fg` | `label` | `color` | `default` | `--xh-fg-default` | checkbox 的 label 部件 color 覆盖槽。 |
| `--xh-checkbox-label-fg-disabled` | `label` | `color` | `disabled` | `--xh-fg-disabled` | checkbox 的 label 部件 color 覆盖槽。 |
| `--xh-checkbox-label-font-size` | `label` | `font-size` | `default` | `--xh-_checkbox-label-font-size` | checkbox 的 label 部件 font-size 覆盖槽。 |
| `--xh-checkbox-label-gap` | `label` | `gap` | `default` | `--xh-_checkbox-label-gap` | checkbox 的 label 部件 gap 覆盖槽。 |
| `--xh-checkbox-label-leading` | `label` | `line-height` | `default` | `--xh-leading-normal` | checkbox 的 label 部件 line-height 覆盖槽。 |
| `--xh-checkbox-radius` | `root` | `border-radius` | `default` | `--xh-shape-inset` | checkbox 的 root 部件 border-radius 覆盖槽。 |
| `--xh-checkbox-shadow` | `root` | `box-shadow` | `default` | `--xh-_checkbox-shadow-rest` | checkbox 的 root 部件 box-shadow 覆盖槽。 |
| `--xh-checkbox-shadow-disabled` | `root` | `box-shadow` | `disabled` | `none` | checkbox 的 root 部件 box-shadow 覆盖槽。 |
| `--xh-checkbox-shadow-hover` | `label`<br>`root` | `box-shadow` | `@media (hover: hover)`<br>`disabled`<br>`hover`<br>`invalid`<br>`not([data-disabled])`<br>`not([data-invalid])`<br>`not([data-readonly])`<br>`readonly` | `--xh-_checkbox-shadow-hover` | checkbox 的 label、root 部件 box-shadow 覆盖槽。 |
| `--xh-checkbox-shadow-pressed` | `root` | `box-shadow` | `active`<br>`disabled`<br>`not([data-disabled])`<br>`not([data-readonly])`<br>`readonly` | `none` | checkbox 的 root 部件 box-shadow 覆盖槽。 |
| `--xh-checkbox-shadow-readonly` | `root` | `box-shadow` | `disabled`<br>`not([data-disabled])`<br>`readonly` | `none` | checkbox 的 root 部件 box-shadow 覆盖槽。 |
<!-- xh-component-tokens:end -->

### 动效

`background-color` · `border-color` · `box-shadow` · `opacity` · `scale` 走 `transition` 过渡。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。

### 响应式

皮肤另按输入能力分档：`hover: hover` · `pointer: coarse`——同一份皮肤在触屏与带指针的设备上不一样，与视口宽度无关。
