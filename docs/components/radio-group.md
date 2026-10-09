# RadioGroup 单选组

一组互斥选项共用一个值，所有选项同时可见。单个单选按钮是这里的 `item` 部件，不另立组件：它脱离组既没有互斥对象，也无法取消选中。

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/radio-group" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/radio-group.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/radio-group" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/radio-group" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/radio-group.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## 用法

组内只有一个 Tab 停靠点，进组后四个方向键都能切换

<XhDemo src="radio-group/01-basic" />

## 组件结构

加粗的是必需部件。

`data-scope="radio-group"`：`root` · `label` · `thumb` · **`item`** · `item-icon` · `item-text` · `item-description` · `indicator` · `hidden-input`

## 示例

### 受控

传入 value 后由宿主决定；值可以是 null，表示没有任何一项选中

<XhDemo src="radio-group/02-controlled" />

### 横向排布

orientation 只影响排版与 aria-orientation，方向键四个方向照样都能切换

<XhDemo src="radio-group/03-horizontal" />

### 禁用

单项禁用后不可点击，方向键也跳过它；整组禁用则每一项都随之禁用

<XhDemo src="radio-group/04-disabled" />

### 颜色

tone 决定选中圆点使用哪族颜色，六种语气各一组

<XhDemo src="radio-group/05-tone" />

### 尺寸

size 改变条目间距与字号，不写即默认中档

<XhDemo src="radio-group/06-size" />

### 数据驱动

数据字段的命名由数据决定，映射为条目的值、文本与禁用即可

<XhDemo src="radio-group/07-options" />

### 卡片

variant="card" 把每个选项画成一张可点的卡，文案下方用说明行交代差别

<XhDemo src="radio-group/08-card" />

### 分段形态

variant="segmented" 把一排短选项画成一条轨道，选中段由滑块标出，换段时滑块滑过去；缺省横排

<XhDemo src="radio-group/09-segmented" />

### 撑满行宽

segmented 形态加 block 使整组占满一行，各段等分剩余空间，长短不一的文字也能对齐

<XhDemo src="radio-group/10-block" />

### 图标

条目文字前放一枚图标：图标对读屏隐藏，可及名仍是文字；直径与颜色随条目走，选中与悬停一并换色

<XhDemo src="radio-group/11-icon" />

## 设计指引

### 何时使用

- 二到五个互斥选项，且各选项的文字值得同时展开供用户比较。
- 选项之间要靠一两句说明才分得清（套餐、配送方式、部署区域）时，用 `variant="card"` 把每个选项画成一张卡。
- 选项少、名称短，要在一行里切换视图模式（列表 / 网格）、时间粒度（日 / 周 / 月）或排序方式时，用 `variant="segmented"` 画成一条分段轨道。

### 何时不用

- 选项超过五六个时，使用[选择器](./select)。
- 表达的是按钮的按下状态而不是一个字段值，或需要多选时，使用[切换按钮组](./toggle-group)：它没有 `name`、不参与表单，也没有滑块。
- 切换的是同一块区域的几屏内容时，使用[标签页](./tabs)，它管理面板的显隐，不是一个值。
- 可以多选时，使用[复选框组](./checkbox-group)。

### 特性

- 整组只占一个 Tab 位，组内靠方向键移动，与原生单选组一致。
- `hidden-input` 承担表单参与，宿主表单重置时选中值回落到 `defaultValue`。
- `collection` 可数据驱动，也可以逐项编写；节点的 `description` 与 `icon` 自动铺出说明行与图标位。
- 圆圈是字段家族的控制盒：不填底、描边与无影，选中后以语气色圆点填充；整行接 Action Control row 档，悬停 / 按下换面不缩放，圆圈随行换到承载面阶梯的下一档。
- `variant` 是结构形态，三种形态共用同一台状态机、同一张键盘表：
  - 缺省 `list` 是一列「圆圈 + 文案」的行。
  - `card` 把每个条目画成一张可点的描边卡（surface 圆角，白底承载阶梯悬停 100 → 按下 200），圆圈在卡的行首，整张卡是命中区。选中卡换品牌淡底（写了 `tone` 换语气淡底），与表格选中行、穿梭框选中项同一种标记，描边不换。竖排时卡片撑满一列，横排时各卡等分一行、放不下就折行。
  - `segmented` 把条目画成一条与字段外壳同款的轨道（最浅一档淡底 + 1px 字段描边、2px 圆角、2px 内衬）里首尾相接的段，选中段由 `thumb` 部件标出：一块品牌淡底（浅色 12%、深色 20%）的平面滑块，换段时滑过去；选中段字取品牌色、medium，悬停时滑块升一档（浅色 18%、深色 28%），禁用时退到 8% 淡底与浅品牌字；写了 `tone` 时滑块与字换成语气淡底与语气字。未选中段透明底、次级字色，悬停 100 → 按下 200，只换面不缩放；段横向内距 12px，段与段之间一道 1px × 14px 的分隔线，与选中段、悬停段相邻的那几道收起；这一形态不画圆圈，缺省横排，`block` 让整组撑满行宽、各段等分，一行排不下时折行。
- 滑块的位置与尺寸由组件测量：只有换段时才滑，首次落位、窗口缩放、换上正式字体之类的重量直接到位，不拖尾；横排竖排、ltr 与 rtl 使用同一条规则。
- `item-icon` 是文字前的图标位，对读屏隐藏，直径随尺寸档、颜色随条目；节点的 `icon` 字段写入图标文本，需要放置图形时手写部件，把图标组件或 svg 放进 `item-icon`。
- `item-description` 是文案下方的说明行（13 / `--xh-fg-muted`），与文案一起构成条目的可及名；`collection` 里的 `description` 会自动铺出这一行。
- 与[复选框](./checkbox)的不对称是有意的：一个复选框自身即成立（勾选同意条款），一个单选按钮自身不成立，因此复选框有独立组件、单选按钮没有。

### 组合

- 外层放[表单字段](./field)，让标签、说明与错误文案一并接入；每项的补充说明放进 `item-description`。
- segmented 形态与[标签页](./tabs)搭配：分段切换数据口径，标签页切换内容面板，两者不互相替代。

### 最佳实践

- 提供默认选中项，除非“未选”本身有意义。
- 选项文字写完整，不依赖共同前缀省略。
- 卡片里只放一两句说明，不放按钮、链接等第二个可点目标：整张卡是一次选择，内嵌的动作会与选择抢同一次点击。
- segmented 形态各段文字长度尽量接近：长短悬殊时滑块滑动，整排宽度会跟着跳动。
- segmented 形态的段文字不走 `collection` 而是手写、且会在运行期改动时，改动后调用一次 `measure()`：滑块只跟随选中值、集合与尺寸变化，段内文字撑宽时它无法感知。
- 动态移除正持有焦点的条目（例如按权限过滤）之后，焦点会回到 `<body>`。组件只保证 Tab 位退回容器、键盘可以再次进入；需要保持位置时由页面把焦点移到相邻的条目。

### 反模式

- 单选组只有一个选项，用户无从选择。
- 选项可以被取消选中：单选组一旦选中就不应回到空值，需要空值时增加一项“不指定”。
- 把 segmented 形态当按钮组使用：段是一个值的几个取值，不是几个动作。触发动作使用[按钮组](./button-group)。
- segmented 形态一行放七八段：那已经是下拉框，还占着整行宽度。

## API 参考

### 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-radio-group>` |
| Vue 组件 | `XhRadioGroupItem` `XhRadioGroupItemDescription` `XhRadioGroupItemIcon` `XhRadioGroupItemText` `XhRadioGroupLabel` `XhRadioGroupRoot` `XhRadioGroupThumb` |
| 组合式函数 | `useRadioGroup` |
| 状态机 | `radioGroupMachine` |
| 皮肤 | `@xihan-ui/styles/radio-group.css` |

### Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `collection` | `RadioGroupNode[]` |  | 条目数据，显示文本与禁用的事实源。提供后条目部件只需声明 value。 未提供时回到文本与禁用都写在条目部件上的方式。 |
| `value` | `string \| null` |  |  |
| `defaultValue` | `string \| null` |  |  |
| `disabled` | `boolean` |  |  |
| `readOnly` | `boolean` |  | 只读：不可选择，但仍可聚焦、方向键照常移动焦点，对比度不降低。 |
| `invalid` | `boolean` |  | 校验失败：只改变呈现，不阻止交互。 |
| `required` | `boolean` |  | 必填：随表单校验一起使用，只发无障碍属性，不自行拦截提交。 |
| `orientation` | `Orientation` |  | 视觉排布：list / card 缺省竖排，segmented 缺省横排。方向键接受的轴与它无关（四个方向键恒响应）。 |
| `dir` | `Direction` |  | 文字方向，只改写左右方向键的语义与滑块的起始缘，上下键与之无关。 未提供时从根节点的计算样式读取（祖先链上的 dir 与 CSS direction 都计入），提供后以它为准。 |
| `name` | `string` |  | 表单字段名。 |
| `loop` | `boolean` |  | 方向键到达末尾是否回绕，默认 true。 |
| `block` | `boolean` |  | 撑满行宽，各段等分剩余空间；只在 segmented 形态下生效。 |
| `tone` | `Tone` |  | 语气：brand / neutral / success / warning / danger / info，决定使用哪族颜色。 |
| `size` | `Size` |  | 尺寸：sm / md / lg。 |
| `variant` | `RadioGroupVariant` |  | 结构形态，默认 list；card 把每个条目画成一张可点的卡，segmented 画成轨道里的一排段。 |
| `labelled` | `boolean` |  | 作者渲染了 label 部件时置真，由适配器统计而不是判断标题文字是否有值。 为假时根不输出 aria-labelledby：指向未渲染的 id 会让组没有名字，作者写在根上的 aria-label 也会被它压住。 |
| `onValueChange` | `(details: RadioGroupValueChangeDetails) => void` |  | value 变化回调。 |

### RadioGroupNode

`collection` 的元素。

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `value` | `string` | 是 |  |
| `label` | `string` |  | 展示文本；默认回退为 value。 |
| `description` | `string` |  | 说明文字，写入 item-description 部件；未提供时本条不铺该部件。 |
| `icon` | `string` |  | 图标文本，写入文字前的 item-icon 部件，对读屏隐藏；需要放置图形时改为手写部件。未提供时本条不铺该部件。 |
| `disabled` | `boolean` |  | 条目禁用：方向键跳过它，但它仍可聚焦、仍是导航起点。 |

### 事件

自定义元素将载荷放在 `detail`；Vue 使用同名 emit。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `value-change` | `RadioGroupValueChangeDetails` | 选中值变化；detail 为 `{ value: string \| null }` |

### React 适配器 props

只列各组件自己声明的那些：继承自 `ComponentPropsWithRef` 的 DOM 属性不在其中，根组件上与上面 Props 表同名的也不重复列。Vue 的对应物是上面的插槽表。

| React 组件 | 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- | --- |
| `XhRadioGroupItem` | `value` | `string` | 是 |  |
| `XhRadioGroupItem` | `disabled` | `boolean` |  | 默认交给 connect 查询 collection，写死 false 会覆盖数据中的禁用。 |
| `XhRadioGroupRoot` | `label` | `ReactNode` |  | 标题文字。提供后不必再写 label 部件。 |
| `XhRadioGroupRoot` | `renderItem` | `(node: RadioGroupNodeMeta) => ReactNode` |  | 每个条目的自定义内容；未提供时使用 collection 中的 label。 |
| `XhRadioGroupRoot` | `children` | `ReactNode` |  |  |

### 状态

公开状态写入 `data-state`。

| 部件 | 取值 |
| --- | --- |
| `item` | 'checked' \| 'unchecked' |
| `item-icon` | 'checked' \| 'unchecked' |
| `item-text` | 'checked' \| 'unchecked' |
| `item-description` | 'checked' \| 'unchecked' |
| `indicator` | 'checked' \| 'unchecked' |
| `hidden-input` | 'checked' \| 'unchecked' |

以下名称仅用于内部状态机。

**状态**：`idle`

**事件**：`VALUE.SET` · `ITEM.SELECT` · `ITEM.FOCUS` · `GROUP.BLUR` · `FORM.RESET` · `THUMB.MEASURE` · `PRESS.START` · `PRESS.END`

**判据**：`canPress`

### connect API

`getXxxProps()` 返回对应部件的宿主属性。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `value` | `string \| null` |  |
| `collection` | `readonly RadioGroupNodeMeta[]` | 由 collection 推导的条目元信息，按数据顺序排列；未提供 collection 时为空数组。 |
| `focusedValue` | `string \| null` | 焦点在组外时为 null。 |
| `variant` | `RadioGroupVariant` | 结算后的结构形态：没传 variant 即 list。适配器据它决定按 collection 铺开时放不放滑块。 |
| `setValue` | `(next: string) => void` |  |
| `measure` | `() => void` | 重新测量滑块（只在 segmented 形态下有落点）。选中值变化与 collection 增删改名都会自动重新测量， 根与条目的尺寸变化由尺寸观察器接管；条目的文字由部件手写（未经 collection）而后修改时需要手动调用。 |
| `getRootProps` | `() => T['element']` |  |
| `getLabelProps` | `() => T['element']` |  |
| `getItemProps` | `(props: RadioGroupItemProps) => T['element']` |  |
| `getItemIconProps` | `(props: RadioGroupItemProps) => T['element']` | 条目文字前的图标位：纯装饰，对读屏隐藏，状态标记与条目一致。 |
| `getItemTextProps` | `(props: RadioGroupItemProps) => T['element']` |  |
| `getItemDescriptionProps` | `(props: RadioGroupItemProps) => T['element']` | 条目的说明：文案下方一行次级文字，常用在 card 形态里。 |
| `getIndicatorProps` | `(props: RadioGroupItemProps) => T['element']` | 条目行首的单选圆圈；segmented 形态由滑块标出选中，皮肤不画它。 |
| `getThumbProps` | `() => T['element']` | segmented 形态里滑动的选中标记：整组一份，位置与尺寸由状态机量好写成私有槽；没有落点时收起。 |
| `getHiddenInputProps` | `(props: RadioGroupItemProps) => T['input']` | 条目对应的隐藏原生 radio 输入，用于表单提交。 |

## 无障碍

### 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/radio/#keyboardinteraction)

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `Tab` / `Shift+Tab` | focus outside the group | 整组只占一个 Tab 位：焦点进入锚点条目（即选中项）；落到容器上时由容器转投锚点条目，锚点缺席或被禁用才落首个可停留项 |
| `ArrowDown` / `ArrowRight` | focus in group, group not disabled | 焦点移到下一个可停留条目并选中（禁用条目跳过、尽头按 loop 回绕，缺省回绕到首项）；只读时焦点照走但不落值；dir=rtl 时改由 ArrowLeft 承担，未给 dir 时按祖先链上的书写方向 |
| `ArrowUp` / `ArrowLeft` | focus in group, group not disabled | 焦点移到上一个可停留条目并选中（尽头按 loop 回绕，缺省回绕到末项）；只读时焦点照走但不落值；dir=rtl 时改由 ArrowRight 承担 |
| `Space` | focus on item, item not disabled | 选中当前条目；Enter 不是 role=radio 的激活键，按下不选中 |
| `Space` | held on item, 条目未禁用且组未禁用、非只读 | 按住期间该条目投影 data-pressed，与指针 :active 同一副按压面（list / card 的行与圆圈一起换面，segmented 的段换到按下面）；抬起或失焦撤下，按住途中整组转入禁用或只读也撤下。Enter 不进按压面；选中与按压互相独立 |

### ARIA

以下属性由 `connect` 生成。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `aria-invalid` | 'true' \| 'false' |
| `root` | `aria-labelledby` | `label` 部件的 id \| undefined |
| `root` | `aria-orientation` | 'horizontal' \| 'vertical' |
| `root` | `aria-readonly` | 'true' \| 'false' |
| `root` | `aria-required` | 'true' \| 'false' |
| `root` | `role` | 'radiogroup' |
| `thumb` | `aria-hidden` | 'true' |
| `item` | `aria-checked` | 'true' \| 'false' |
| `item` | `aria-disabled` | 'true' \| 'false' |
| `item` | `role` | 'radio' |
| `item-icon` | `aria-hidden` | 'true' |
| `indicator` | `aria-hidden` | 'true' |
| `hidden-input` | `aria-hidden` | 'true' |

- 根节点是 `radiogroup`，每个条目是 `radio` 并显式报告 `aria-checked`；三种形态的语义相同，segmented 只是换了画法。
- 焦点进组时落在已选中的条目上，没有选中项才落第一个；方向键移动焦点的同时选中。键盘按 APG 的单选组：Space 选中当前条目，Enter 与 Home / End 不归单选组管。
- 禁用的条目使用 `aria-disabled` 而不是原生 `disabled`：它仍可聚焦，仍是方向键的起点。
- `label` 部件是组的可及名。segmented 形态的轨道里不排标题，`label` 部件在这一形态下视觉隐藏、只作可及名；需要可见标题时放进[表单字段](./field)，或给根节点写 `aria-label`。
- 根节点只在 `label` 部件真渲染了时才输出 `aria-labelledby`；不写标题时给根节点写 `aria-label`。Vue / React 的 `label` 属性不论手写选项还是数据驱动都会铺出标题。
- 方向键只认落在条目或根节点自身上的按键：组里放着的数字框、下拉等行内编辑控件，它们的方向键照常移光标、换值，不会切换选项。
- 圆圈与滑块都是纯装饰，对读屏隐藏；当前项由条目自身的选中态表达。

## 样式参考

### 皮肤

`@xihan-ui/styles/radio-group.css` 按 `[data-scope="radio-group"][data-part="root"]` 部件选择器书写，发布产物以挂载类 `.xh-scope-radio-group` 代替其中的 data-scope（特异性相同），位于 `xihan.components` 层。覆盖样式使用 `xihan.overrides`，部件选择器照常可用。

`forced-colors: active` 下另有一套规则：颜色交给系统，边框与状态标记改用系统色关键字。

### 数据属性

由 `connect` 生成；条件不成立时不输出无值属性。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-block` | ''（条件成立时才出现） |
| `root` | `data-disabled` | ''（条件成立时才出现） |
| `root` | `data-invalid` | ''（条件成立时才出现） |
| `root` | `data-orientation` | 'horizontal' \| 'vertical' |
| `root` | `data-readonly` | ''（条件成立时才出现） |
| `root` | `data-required` | ''（条件成立时才出现） |
| `root` | `data-size` | props.size |
| `root` | `data-tone` | props.tone |
| `root` | `data-variant` | props.variant |
| `thumb` | `data-instant` | ''（条件成立时才出现） |
| `thumb` | `data-value` | context.get('value') |
| `item` | `data-disabled` | ''（条件成立时才出现） |
| `item` | `data-invalid` | ''（条件成立时才出现） |
| `item` | `data-pressed` | ''（条件成立时才出现） |
| `item` | `data-readonly` | ''（条件成立时才出现） |
| `item` | `data-state` | 'checked' \| 'unchecked' |
| `item` | `data-xh-action-control` | undefined \| '' |
| `item` | `data-xh-action-display` | undefined \| 'always' |
| `item` | `data-xh-action-profile` | undefined \| 'row' |
| `item` | `data-xh-action-size` | undefined \| 'xs' |
| `item` | `data-xh-action-variant` | undefined \| 'outline' \| 'ghost' |
| `item` | `data-xh-choice-card` | ''（条件成立时才出现） |
| `item-icon` | `data-disabled` | ''（条件成立时才出现） |
| `item-icon` | `data-invalid` | ''（条件成立时才出现） |
| `item-icon` | `data-readonly` | ''（条件成立时才出现） |
| `item-icon` | `data-state` | 'checked' \| 'unchecked' |
| `item-text` | `data-disabled` | ''（条件成立时才出现） |
| `item-text` | `data-invalid` | ''（条件成立时才出现） |
| `item-text` | `data-readonly` | ''（条件成立时才出现） |
| `item-text` | `data-state` | 'checked' \| 'unchecked' |
| `item-description` | `data-disabled` | ''（条件成立时才出现） |
| `item-description` | `data-invalid` | ''（条件成立时才出现） |
| `item-description` | `data-readonly` | ''（条件成立时才出现） |
| `item-description` | `data-state` | 'checked' \| 'unchecked' |
| `indicator` | `data-disabled` | ''（条件成立时才出现） |
| `indicator` | `data-invalid` | ''（条件成立时才出现） |
| `indicator` | `data-readonly` | ''（条件成立时才出现） |
| `indicator` | `data-state` | 'checked' \| 'unchecked' |
| `hidden-input` | `data-disabled` | ''（条件成立时才出现） |
| `hidden-input` | `data-invalid` | ''（条件成立时才出现） |
| `hidden-input` | `data-readonly` | ''（条件成立时才出现） |
| `hidden-input` | `data-state` | 'checked' \| 'unchecked' |

<!-- xh-component-tokens:start -->
### CSS 变量

本组件公开覆盖槽由独立皮肤的实际消费位生成；默认来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 默认来源 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `--xh-radio-group-card-title-font-weight` | `item`<br>`item-text` | `font-weight` | `xh-choice-card` | `--xh-text-label-weight` | radio-group 的 item、item-text 部件 font-weight 覆盖槽。 |
| `--xh-radio-group-gap` | `root` | `gap` | `default` | `--xh-space-2` | radio-group 的 root 部件 gap 覆盖槽。 |
| `--xh-radio-group-icon-size` | `root` | `--xh-icon-size` | `default`<br>`size=lg`<br>`size=sm` | `--xh-glyph-size-lg`<br>`--xh-glyph-size-md`<br>`--xh-glyph-size-sm` | radio-group 的 root 部件 --xh-icon-size 覆盖槽。 |
| `--xh-radio-group-indicator-bg` | `indicator` | `background` | `default` | `transparent` | radio-group 的 indicator 部件 background 覆盖槽。 |
| `--xh-radio-group-indicator-bg-disabled` | `indicator`<br>`item` | `background` | `disabled` | `--xh-bg-subtle` | radio-group 的 indicator、item 部件 background 覆盖槽。 |
| `--xh-radio-group-indicator-bg-pressed` | `indicator`<br>`item` | `background` | `disabled`<br>`is(:active, [data-pressed])`<br>`not([data-disabled])`<br>`not([data-readonly])`<br>`pressed`<br>`readonly` | `--xh-_radio-group-host-bg-pressed` | radio-group 的 indicator、item 部件 background 覆盖槽。 |
| `--xh-radio-group-indicator-border` | `indicator` | `border` | `default` | `--xh-border-strong` | radio-group 的 indicator 部件 border 覆盖槽。 |
| `--xh-radio-group-indicator-border-checked` | `indicator` | `border-color` | `state=checked` | `--xh-_radio-group-accent` | radio-group 的 indicator 部件 border-color 覆盖槽。 |
| `--xh-radio-group-indicator-border-disabled` | `indicator`<br>`item` | `border-color` | `disabled` | `--xh-border-default` | radio-group 的 indicator、item 部件 border-color 覆盖槽。 |
| `--xh-radio-group-indicator-border-hover` | `indicator`<br>`item` | `border-color` | `disabled`<br>`hover`<br>`invalid`<br>`not([data-disabled])`<br>`not([data-invalid])`<br>`not([data-readonly])`<br>`not([data-state='checked'])`<br>`readonly`<br>`state=checked` | `--xh-border-control-hover` | radio-group 的 indicator、item 部件 border-color 覆盖槽。 |
| `--xh-radio-group-indicator-border-invalid` | `indicator` | `border-color` | `invalid`<br>`state=checked` | `--xh-border-invalid` | radio-group 的 indicator 部件 border-color 覆盖槽。 |
| `--xh-radio-group-indicator-dot` | `indicator` | `background` | `default` | `--xh-_radio-group-accent` | radio-group 的 indicator 部件 background 覆盖槽。 |
| `--xh-radio-group-indicator-dot-disabled` | `indicator`<br>`item` | `background` | `disabled` | `--xh-fg-disabled` | radio-group 的 indicator、item 部件 background 覆盖槽。 |
| `--xh-radio-group-indicator-dot-pressed` | `indicator`<br>`item` | `background` | `disabled`<br>`is(:active, [data-pressed])`<br>`not([data-disabled])`<br>`not([data-readonly])`<br>`pressed`<br>`readonly`<br>`state=checked` | `--xh-_tone-active` | radio-group 的 indicator、item 部件 background 覆盖槽。 |
| `--xh-radio-group-indicator-radius` | `indicator` | `border-radius` | `default` | `--xh-shape-circle` | radio-group 的 indicator 部件 border-radius 覆盖槽。 |
| `--xh-radio-group-indicator-size` | `indicator` | `block-size`<br>`inline-size` | `default` | `--xh-_radio-group-indicator` | radio-group 的 indicator 部件 block-size、inline-size 覆盖槽。 |
| `--xh-radio-group-item-bg-hover` | `item` | `background-color` | `disabled`<br>`hover`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])` | `--xh-bg-subtle` | radio-group 的 item 部件 background-color 覆盖槽。 |
| `--xh-radio-group-item-bg-pressed` | `item` | `background-color` | `disabled`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-bg-subtle-hover` | radio-group 的 item 部件 background-color 覆盖槽。 |
| `--xh-radio-group-item-description-fg` | `item-description` | `color` | `default` | `--xh-fg-muted` | radio-group 的 item-description 部件 color 覆盖槽。 |
| `--xh-radio-group-item-description-fg-disabled` | `item`<br>`item-description` | `color` | `disabled` | `--xh-fg-disabled` | radio-group 的 item、item-description 部件 color 覆盖槽。 |
| `--xh-radio-group-item-description-font-size` | `item-description` | `font-size` | `default` | `--xh-text-secondary-size` | radio-group 的 item-description 部件 font-size 覆盖槽。 |
| `--xh-radio-group-item-fg` | `item` | `color` | `default`<br>`disabled`<br>`focus-visible`<br>`hover`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-fg-default` | radio-group 的 item 部件 color 覆盖槽。 |
| `--xh-radio-group-item-fg-disabled` | `item` | `color` | `disabled` | `--xh-fg-disabled` | radio-group 的 item 部件 color 覆盖槽。 |
| `--xh-radio-group-item-font-size` | `item`<br>`root` | `font-size` | `default`<br>`variant=segmented` | `--xh-_radio-group-font-size` | radio-group 的 item、root 部件 font-size 覆盖槽。 |
| `--xh-radio-group-item-gap` | `item`<br>`root` | `gap` | `default`<br>`variant=segmented` | `--xh-_radio-group-item-gap` | radio-group 的 item、root 部件 gap 覆盖槽。 |
| `--xh-radio-group-item-radius` | `item` | `border-radius` | `default` | `--xh-shape-control` | radio-group 的 item 部件 border-radius 覆盖槽。 |
| `--xh-radio-group-item-row-gap` | `item` | `row-gap` | `has(> [data-scope='radio-group'][data-part='item-description'])`<br>`not([data-xh-choice-card])`<br>`xh-choice-card` | `--xh-space-1` | radio-group 的 item 部件 row-gap 覆盖槽。 |
| `--xh-radio-group-label-fg` | `label` | `color` | `default` | `--xh-fg-muted` | radio-group 的 label 部件 color 覆盖槽。 |
| `--xh-radio-group-label-fg-disabled` | `label`<br>`root` | `color` | `disabled` | `--xh-fg-subtle` | radio-group 的 label、root 部件 color 覆盖槽。 |
| `--xh-radio-group-label-font-size` | `label` | `font-size` | `default` | `--xh-text-label-size` | radio-group 的 label 部件 font-size 覆盖槽。 |
| `--xh-radio-group-label-font-weight` | `label` | `font-weight` | `default` | `--xh-text-label-weight` | radio-group 的 label 部件 font-weight 覆盖槽。 |
| `--xh-radio-group-segment-bg-hover` | `item`<br>`root` | `background-color` | `disabled`<br>`hover`<br>`not([data-disabled])`<br>`not([data-readonly])`<br>`not([data-state='checked'])`<br>`readonly`<br>`state=checked`<br>`variant=segmented` | `--xh-bg-subtle` | radio-group 的 item、root 部件 background-color 覆盖槽。 |
| `--xh-radio-group-segment-bg-pressed` | `item`<br>`root` | `background-color` | `disabled`<br>`is(:active, [data-pressed])`<br>`not([data-disabled])`<br>`not([data-readonly])`<br>`not([data-state='checked'])`<br>`pressed`<br>`readonly`<br>`state=checked`<br>`variant=segmented` | `--xh-bg-subtle-hover` | radio-group 的 item、root 部件 background-color 覆盖槽。 |
| `--xh-radio-group-segment-fg` | `item`<br>`root` | `color` | `variant=segmented` | `--xh-fg-muted` | radio-group 的 item、root 部件 color 覆盖槽。 |
| `--xh-radio-group-segment-fg-checked` | `item`<br>`root` | `color` | `state=checked`<br>`variant=segmented` | `--xh-_radio-group-segment-fg-checked` | radio-group 的 item、root 部件 color 覆盖槽。 |
| `--xh-radio-group-segment-fg-checked-disabled` | `item`<br>`root` | `color` | `disabled`<br>`state=checked`<br>`variant=segmented` | `--xh-_radio-group-segment-fg-checked-disabled` | radio-group 的 item、root 部件 color 覆盖槽。 |
| `--xh-radio-group-segment-fg-hover` | `item`<br>`root` | `color` | `disabled`<br>`hover`<br>`not([data-disabled])`<br>`not([data-readonly])`<br>`not([data-state='checked'])`<br>`readonly`<br>`state=checked`<br>`variant=segmented` | `--xh-fg-default` | radio-group 的 item、root 部件 color 覆盖槽。 |
| `--xh-radio-group-segment-font-weight` | `item`<br>`root` | `font-weight` | `variant=segmented` | `--xh-text-label-weight` | radio-group 的 item、root 部件 font-weight 覆盖槽。 |
| `--xh-radio-group-segment-font-weight-checked` | `item`<br>`root` | `font-weight` | `state=checked`<br>`variant=segmented` | `--xh-font-weight-medium` | radio-group 的 item、root 部件 font-weight 覆盖槽。 |
| `--xh-radio-group-segment-h` | `item`<br>`root` | `block-size`<br>`min-block-size` | `orientation=horizontal`<br>`variant=segmented` | `--xh-_radio-group-segment-h` | radio-group 的 item、root 部件 block-size、min-block-size 覆盖槽。 |
| `--xh-radio-group-segment-px` | `item`<br>`root` | `padding-inline` | `variant=segmented` | `--xh-_radio-group-segment-px` | radio-group 的 item、root 部件 padding-inline 覆盖槽。 |
| `--xh-radio-group-segment-radius` | `item`<br>`root` | `border-radius` | `variant=segmented` | `--xh-shape-control` | radio-group 的 item、root 部件 border-radius 覆盖槽。 |
| `--xh-radio-group-segment-separator` | `item`<br>`root` | `background-color` | `orientation=horizontal`<br>`variant=segmented` | `--xh-border-default` | radio-group 的 item、root 部件 background-color 覆盖槽。 |
| `--xh-radio-group-thumb-bg` | `thumb` | `background` | `default` | `--xh-_radio-group-thumb-bg` | radio-group 的 thumb 部件 background 覆盖槽。 |
| `--xh-radio-group-thumb-bg-disabled` | `root`<br>`thumb` | `background` | `disabled`<br>`has(> [data-scope='radio-group'][data-part='item'][data-state='checked'][data-disabled])`<br>`state=checked`<br>`variant=segmented` | `--xh-_radio-group-thumb-bg-disabled` | radio-group 的 root、thumb 部件 background 覆盖槽。 |
| `--xh-radio-group-thumb-bg-hover` | `root`<br>`thumb` | `background` | `disabled`<br>`has(> [data-scope='radio-group'][data-part='item'][data-state='checked']:not([data-disabled])`<br>`hover`<br>`not([data-readonly])`<br>`readonly`<br>`state=checked`<br>`variant=segmented` | `--xh-_radio-group-thumb-bg-hover` | radio-group 的 root、thumb 部件 background 覆盖槽。 |
| `--xh-radio-group-thumb-border` | `thumb` | `border` | `default` | `transparent` | radio-group 的 thumb 部件 border 覆盖槽。 |
| `--xh-radio-group-thumb-radius` | `thumb` | `border-radius` | `default` | `--xh-shape-inset` | radio-group 的 thumb 部件 border-radius 覆盖槽。 |
| `--xh-radio-group-thumb-shadow` | `thumb` | `box-shadow` | `default` | `none` | radio-group 的 thumb 部件 box-shadow 覆盖槽。 |
| `--xh-radio-group-track-bg` | `root` | `background` | `variant=segmented` | `--xh-bg-field` | radio-group 的 root 部件 background 覆盖槽。 |
| `--xh-radio-group-track-bg-disabled` | `root` | `background` | `disabled`<br>`variant=segmented` | `--xh-bg-muted` | radio-group 的 root 部件 background 覆盖槽。 |
| `--xh-radio-group-track-border` | `root` | `border` | `variant=segmented` | `--xh-border-control` | radio-group 的 root 部件 border 覆盖槽。 |
| `--xh-radio-group-track-border-invalid` | `root` | `border-color` | `invalid`<br>`variant=segmented` | `--xh-border-invalid` | radio-group 的 root 部件 border-color 覆盖槽。 |
| `--xh-radio-group-track-padding` | `item`<br>`root` | `inset-block-start`<br>`min-block-size`<br>`padding` | `@media (pointer: coarse)`<br>`orientation=horizontal`<br>`variant=segmented` | `--xh-space-0_5` | radio-group 的 item、root 部件 inset-block-start、min-block-size、padding 覆盖槽。 |
| `--xh-radio-group-track-radius` | `root` | `border-radius` | `variant=segmented` | `--xh-shape-control` | radio-group 的 root 部件 border-radius 覆盖槽。 |
<!-- xh-component-tokens:end -->

### 动效

动效角色：按压 · 状态 · 切换 · 指示与换位（见[动效规范](../design/motion#角色)）。

`background-color` · `block-size` · `border-color` · `color` · `inline-size` · `scale` · `translate` 走 `transition` 过渡。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。

### 响应式

皮肤另按输入能力分档：`pointer: coarse`：同一份皮肤在触屏与带指针的设备上不一样，与视口宽度无关。

### RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像；只认物理方向的量乘 `--xh-direction-sign` 换向，按就近的 `dir` 走。

- 方向从 DOM 读取：整页或某个祖先声明了 `dir='rtl'`（或 CSS `direction`），左右方向键的语义与滑块的起始缘一起翻转，不需要再向组件传递。上下键不受影响。
- `dir` 属性是显式覆盖：提供后以它为准，用于整页 ltr、局部 rtl 的场合。
