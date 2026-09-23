# Segmented 分段控制器

一排连在一起的互斥选项，选中的一段下方有一块滑动的指示器：淡底轨道里一块带描边的白色抬起面。它是单选组，参与表单提交。

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/segmented" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/segmented.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/segmented" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/segmented" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/segmented.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## 用法

一排互斥选项：root 是 radiogroup、每段是 radio；整组只占一个 Tab 位，进组后四个方向键都可移动

<XhDemo src="segmented/01-basic" />

## 组件结构

加粗的是必需部件。

`data-scope="segmented"`：**`root`** · **`item`** · `item-text` · `indicator` · `hidden-input`

## 示例

### 受控

传入 value 后由宿主决定；值可以是 null，表示没有任何一段选中

<XhDemo src="segmented/02-controlled" />

### 撑满行宽

block 使整组占满一行，各段等分剩余空间，长短不一的文字也能对齐

<XhDemo src="segmented/03-block" />

### 竖排

orientation 只改变视觉排布，四个方向键与 Home/End 照常可用

<XhDemo src="segmented/04-vertical" />

### 禁用

单段禁用仍可聚焦、仍是方向键的起点，只是无法选中它；整组禁用则全部不可修改

<XhDemo src="segmented/05-disabled" />

### 颜色

tone 决定指示器与选中段文字使用哪族颜色，六种语气各一组

<XhDemo src="segmented/06-tone" />

### 尺寸

size 改变段的高度、内边距与字号，指示器跟随测量得出的段

<XhDemo src="segmented/07-size" />

### 表单

提供 name 后才带上隐藏输入参与提交；宿主表单重置时，选中值回落到 default-value

<XhDemo src="segmented/08-form" />

## 设计指引

### 何时使用

- 二到五个平级选项之间切换：视图模式（列表 / 网格）、时间粒度（日 / 周 / 月）、排序方式。
- 选项少、名称短，且值得始终展开：分段控制器的价值在于不需要打开即可看到全部选项。
- 需要随表单一起提交该选择。

### 何时不用

- 选项超过六个，或选项文字长短悬殊时，改用[单选组](./radio-group)竖排，或[选择器](./select)收进浮层。
- 需要多选，或表达的是按钮的按下状态而不是一个字段值时，使用[切换按钮组](./toggle-group)：它没有 `name`、不参与表单，也没有滑动指示器。
- 切换的是同一块区域的几屏内容时，使用[标签页](./tabs)，它管理面板的显隐，不是一个值。

### 特性

- 集合入口：提供 `collection` 即只传数据，条目文本与禁用都以数据为准；需要改结构时再写部件。
- 受控与非受控两态齐全：提供 `value` 即受控，只发 `onValueChange` 不自行修改。
- 参与表单：提供 `name` 后隐藏输入才带上它；宿主表单重置时选中值回落到 `defaultValue`。隐藏输入只在只传 `collection`、由组件铺开结构时自动铺出；自行编写默认插槽排版时需要放一个隐藏输入部件，否则提供 `name` 也没有内容参与提交。
- 指示器位置由组件测量，横排竖排、ltr 与 rtl 使用同一条规则。
- 语气与尺寸两轴与其他组件同源；`block` 让整组撑满行宽、各段等分。

### 组合

- 放入[表单字段](./field)，让标签、说明与错误文案一并接入。
- 与[标签页](./tabs)搭配：分段控制器切换数据口径，标签页切换内容面板，两者不互相替代。

### 最佳实践

- 各段文字长度尽量接近：长短悬殊时指示器滑动，整排宽度会跟着跳动。
- 段数固定后再使用：分段控制器不适合数量会变化的选项集。
- 选中态不只依靠指示器的颜色区分，文字色也要跟随变化，色觉障碍的用户才能分辨。
- 段的文字不走 `collection` 而是手写、且会在运行期改动时，改动后调用一次 `measure()`：指示器只跟随选中值、集合与根的尺寸变化，段内文字撑宽时它无法感知。
- 动态移除正持有焦点的段（例如按权限过滤）之后，焦点会回到 `<body>`。组件只保证 Tab 位退回容器、键盘可以再次进入；需要保持位置时由页面把焦点移到相邻的段。

### 反模式

- 把它当按钮组使用：段是一个值的几个取值，不是几个动作。触发动作使用[按钮组](./button-group)。
- 一行放七八段：那已经是下拉框，还占着整行宽度。
- 用它切换整页内容却不改地址：用户刷新后回到第一段。

## API 参考

### 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-segmented>` |
| Vue 组件 | `XhSegmentedHiddenInput` `XhSegmentedIndicator` `XhSegmentedItem` `XhSegmentedItemText` `XhSegmentedRoot` |
| 组合式函数 | `useSegmented` |
| 状态机 | `segmentedMachine` |
| 皮肤 | `@xihan-ui/styles/segmented.css` |

### Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `collection` | `SegmentedNode[]` |  | 条目数据，显示文本与禁用的事实源。提供后条目部件只需声明 value。 未提供时回到文本与禁用都写在条目部件上的方式。 |
| `value` | `string \| null` |  | 选中值。提供即受控：内部不再自行修改，只发 onValueChange。 |
| `defaultValue` | `string \| null` |  |  |
| `disabled` | `boolean` |  | 整组禁用：条目全部 aria-disabled，点击与方向键都不生效。 |
| `readOnly` | `boolean` |  | 只读：不可选择，但仍可聚焦、方向键照常移动焦点，对比度不降低。 |
| `invalid` | `boolean` |  | 校验失败：只改变呈现，不阻止交互。 |
| `required` | `boolean` |  | 必填：随表单校验一起使用，只发无障碍属性，不自行拦截提交。 |
| `name` | `string` |  | 表单字段名。提供后隐藏输入才带 name 并参与提交。 |
| `orientation` | `Orientation` |  | 视觉排布，默认 horizontal。方向键接受的轴与它无关（四个方向键恒响应）。 |
| `dir` | `Direction` |  | 文字方向，只改写左右方向键的语义与指示器的起始缘，上下键与之无关。 未提供时从根节点的计算样式读取（祖先链上的 dir 与 CSS direction 都计入），提供后以它为准。 |
| `loop` | `boolean` |  | 方向键到达末尾是否回绕，默认 true。 |
| `block` | `boolean` |  | 撑满行宽，各段等分剩余空间。 |
| `tone` | `Tone` |  | 语气：brand / neutral / success / warning / danger / info，决定使用哪族颜色。 |
| `size` | `Size` |  | 尺寸：sm / md / lg。 |
| `onValueChange` | `(details: SegmentedValueChangeDetails) => void` |  | value 变化意图回调；受控时是唯一出口，非受控时随内部写入一并通知。 |

### SegmentedNode

`collection` 的元素。

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `value` | `string` | 是 |  |
| `label` | `string` |  | 展示文本；默认回退为 value。 |
| `disabled` | `boolean` |  | 条目禁用：方向键跳过它，但它仍可聚焦、仍是导航起点。 |

### 事件

自定义元素将载荷放在 `detail`；Vue 使用同名 emit。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `value-change` | `SegmentedValueChangeDetails` | 选中值变化；detail 为 `{ value: string \| null }` |

### 插槽

仅列出带载荷的插槽。

| Vue 组件 | 插槽 | 载荷 | 说明 |
| --- | --- | --- | --- |
| `XhSegmentedRoot` | `default` | — |  |
| `XhSegmentedRoot` | `item` | `SegmentedNodeMeta` | 铺开 collection 时每一段的文本插槽。 |

### React 适配器 props

只列各组件自己声明的那些：继承自 `ComponentPropsWithRef` 的 DOM 属性不在其中，根组件上与上面 Props 表同名的也不重复列。Vue 的对应物是上面的插槽表。

| React 组件 | 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- | --- |
| `XhSegmentedItem` | `value` | `string` | 是 |  |
| `XhSegmentedItem` | `disabled` | `boolean` |  | 默认交给 connect 查询 collection，写死 false 会覆盖数据中的禁用。 |
| `XhSegmentedRoot` | `renderItem` | `(node: SegmentedNodeMeta) => ReactNode` |  | 每一段的自定义内容；未提供时使用 collection 中的 label。 |
| `XhSegmentedRoot` | `children` | `ReactNode` |  |  |

### 状态

公开状态写入 `data-state`。

| 部件 | 取值 |
| --- | --- |
| `item` | 'checked' \| 'unchecked' |
| `item-text` | 'checked' \| 'unchecked' |

以下名称仅用于内部状态机。

**状态**：`idle`

**事件**：`VALUE.SET` · `ITEM.SELECT` · `ITEM.FOCUS` · `GROUP.BLUR` · `INDICATOR.MEASURE` · `FORM.RESET` · `PRESS.START` · `PRESS.END`

**判据**：`canPress`

### connect API

`getXxxProps()` 返回对应部件的宿主属性。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `value` | `string \| null` | 当前选中值；没有选中任何项时为 null。 |
| `collection` | `readonly SegmentedNodeMeta[]` | 由 collection 推导的条目元信息，按数据顺序排列；未提供 collection 时为空数组。 |
| `focusedValue` | `string \| null` | 焦点在组外时为 null。 |
| `disabled` | `boolean` |  |
| `readOnly` | `boolean` |  |
| `isSelected` | `(value: string) => boolean` |  |
| `setValue` | `(next: string \| null) => void` |  |
| `measure` | `() => void` | 重新测量指示器。选中值变化与 collection 增删改名都会自动重新测量，根的尺寸变化由尺寸观察器接管； 以下情况需要手动调用：段的文字由部件手写（未经 collection）而后修改，或字体加载完成把段撑宽。 |
| `getRootProps` | `() => T['element']` |  |
| `getItemProps` | `(props: SegmentedItemProps) => T['button']` |  |
| `getItemTextProps` | `(props: SegmentedItemProps) => T['element']` |  |
| `getIndicatorProps` | `() => T['element']` |  |
| `getHiddenInputProps` | `() => T['input']` | 选中值随这份原生输入提交。 |

## 无障碍

### 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/radio/#keyboardinteraction)

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `Tab` / `Shift+Tab` | focus outside the group | 整组只占一个 Tab 位：焦点落到锚点段（即选中段），锚点缺席或被禁用时先落容器再由它转投首个可停留段 |
| `ArrowRight` / `ArrowDown` | focus in group, 组未禁用 | 焦点移到下一个可停留段并选中它（禁用段跳过、尽头按 loop 回绕）；只读时焦点照走但不落值；dir=rtl 时改由 ArrowLeft 承担 |
| `ArrowLeft` / `ArrowUp` | focus in group, 组未禁用 | 焦点移到上一个可停留段并选中它；只读时焦点照走但不落值；dir=rtl 时改由 ArrowRight 承担 |
| `Home` | focus in group, 组未禁用 | 焦点移到首个可停留段并选中它；只读时只移焦点 |
| `End` | focus in group, 组未禁用 | 焦点移到末个可停留段并选中它；只读时只移焦点 |
| `Enter` / `Space` | focus on item, 该段未禁用且组非只读 | 选中当前段；段是原生 button，这两个键由平台翻成 click |
| `Enter` / `Space` | held on item, 该段未禁用且组未禁用、非只读 | 按住期间该段投影 data-pressed，与指针 :active 同一副按压面；抬起或失焦撤下，按住途中整组转入禁用或只读也撤下。选中与按压互相独立 |

### ARIA

以下属性由 `connect` 生成。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `aria-invalid` | 'true' \| 'false' |
| `root` | `aria-orientation` | props.orientation |
| `root` | `aria-readonly` | 'true' \| 'false' |
| `root` | `aria-required` | 'true' \| 'false' |
| `root` | `role` | 'radiogroup' |
| `item` | `aria-checked` | 'true' \| 'false' |
| `item` | `aria-disabled` | 'true' \| 'false' |
| `item` | `role` | 'radio' |
| `indicator` | `aria-hidden` | 'true' |

- 根节点是 `radiogroup`，每一段是 `radio` 并显式报告 `aria-checked`。
- 整组只占一个 Tab 位，组内靠方向键移动，Home / End 直达首末段；焦点进组时落在已选中的一段。
- 禁用的段使用 `aria-disabled` 而不是原生 `disabled`：它仍可聚焦，仍是方向键的起点。
- 组本身没有可见标题，需要为根节点提供 `aria-label` 或 `aria-labelledby`，否则读屏只读出“单选组”。
- 指示器是纯装饰，对读屏隐藏；当前段由段自身的选中态表达，指示器不渲染也能读出。

## 样式参考

### 皮肤

`@xihan-ui/styles/segmented.css` 使用 `[data-scope="segmented"][data-part="root"]` 部件选择器，位于 `xihan.components` 层。覆盖样式使用 `xihan.overrides`。

`forced-colors: active` 下另有一套规则：颜色交给系统，边框与状态标记改用系统色关键字。

### 数据属性

由 `connect` 生成；条件不成立时不输出无值属性。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-block` | ''（条件成立时才出现） |
| `root` | `data-disabled` | ''（条件成立时才出现） |
| `root` | `data-invalid` | ''（条件成立时才出现） |
| `root` | `data-orientation` | props.orientation |
| `root` | `data-readonly` | ''（条件成立时才出现） |
| `root` | `data-required` | ''（条件成立时才出现） |
| `root` | `data-size` | props.size |
| `root` | `data-tone` | props.tone |
| `item` | `data-disabled` | ''（条件成立时才出现） |
| `item` | `data-invalid` | ''（条件成立时才出现） |
| `item` | `data-pressed` | ''（条件成立时才出现） |
| `item` | `data-readonly` | ''（条件成立时才出现） |
| `item` | `data-state` | 'checked' \| 'unchecked' |
| `item-text` | `data-disabled` | ''（条件成立时才出现） |
| `item-text` | `data-invalid` | ''（条件成立时才出现） |
| `item-text` | `data-readonly` | ''（条件成立时才出现） |
| `item-text` | `data-state` | 'checked' \| 'unchecked' |
| `indicator` | `data-value` | context.get('value') |

<!-- xh-component-tokens:start -->
### CSS 变量

本组件公开覆盖槽由独立皮肤的实际消费位生成；默认来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 默认来源 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `--xh-segmented-bg` | `root` | `background` | `default` | `--xh-bg-subtle` | segmented 的 root 部件 background 覆盖槽。 |
| `--xh-segmented-bg-disabled` | `root` | `background` | `disabled` | `--xh-bg-muted` | segmented 的 root 部件 background 覆盖槽。 |
| `--xh-segmented-border` | `root` | `border` | `default` | `transparent` | segmented 的 root 部件 border 覆盖槽。 |
| `--xh-segmented-border-invalid` | `root` | `border-color` | `invalid` | `--xh-border-invalid` | segmented 的 root 部件 border-color 覆盖槽。 |
| `--xh-segmented-font-size` | `root` | `font-size` | `default` | `--xh-_segmented-font-size` | segmented 的 root 部件 font-size 覆盖槽。 |
| `--xh-segmented-h` | `item`<br>`root` | `min-block-size` | `orientation=horizontal` | `--xh-_segmented-h` | segmented 的 item、root 部件 min-block-size 覆盖槽。 |
| `--xh-segmented-indicator-bg` | `indicator` | `background` | `default` | `--xh-_segmented-indicator-bg` | segmented 的 indicator 部件 background 覆盖槽。 |
| `--xh-segmented-indicator-border` | `indicator`<br>`root` | `border`<br>`border-color` | `default`<br>`tone` | `--xh-_tone`<br>`--xh-border-default` | segmented 的 indicator、root 部件 border、border-color 覆盖槽。 |
| `--xh-segmented-indicator-radius` | `indicator` | `border-radius` | `default` | `--xh-shape-inset` | segmented 的 indicator 部件 border-radius 覆盖槽。 |
| `--xh-segmented-indicator-shadow` | `indicator` | `box-shadow` | `default` | `--xh-elevation-raised` | segmented 的 indicator 部件 box-shadow 覆盖槽。 |
| `--xh-segmented-indicator-shadow-disabled` | `indicator`<br>`root` | `box-shadow` | `disabled` | `none` | segmented 的 indicator、root 部件 box-shadow 覆盖槽。 |
| `--xh-segmented-item-bg-hover` | `item` | `background-color` | `disabled`<br>`hover`<br>`not([data-disabled])`<br>`not([data-state='checked'])`<br>`state=checked` | `--xh-bg-subtle-hover` | segmented 的 item 部件 background-color 覆盖槽。 |
| `--xh-segmented-item-bg-pressed` | `item` | `background-color` | `disabled`<br>`is(:active, [data-pressed])`<br>`not([data-disabled])`<br>`not([data-readonly])`<br>`not([data-state='checked'])`<br>`pressed`<br>`readonly`<br>`state=checked` | `--xh-bg-subtle-active` | segmented 的 item 部件 background-color 覆盖槽。 |
| `--xh-segmented-item-fg` | `item` | `color` | `default` | `--xh-fg-muted` | segmented 的 item 部件 color 覆盖槽。 |
| `--xh-segmented-item-fg-checked` | `item` | `color` | `state=checked` | `--xh-_segmented-fg-selected` | segmented 的 item 部件 color 覆盖槽。 |
| `--xh-segmented-item-fg-checked-disabled` | `item` | `color` | `disabled`<br>`state=checked` | `--xh-_segmented-fg-selected` | segmented 的 item 部件 color 覆盖槽。 |
| `--xh-segmented-item-fg-hover` | `item` | `color` | `disabled`<br>`hover`<br>`not([data-disabled])`<br>`not([data-state='checked'])`<br>`state=checked` | `--xh-fg-default` | segmented 的 item 部件 color 覆盖槽。 |
| `--xh-segmented-item-font-weight` | `item` | `font-weight` | `default` | `--xh-text-label-weight` | segmented 的 item 部件 font-weight 覆盖槽。 |
| `--xh-segmented-item-gap` | `item` | `gap` | `default` | `--xh-_segmented-gap` | segmented 的 item 部件 gap 覆盖槽。 |
| `--xh-segmented-item-h` | `item` | `block-size` | `default` | `--xh-_segmented-h` | segmented 的 item 部件 block-size 覆盖槽。 |
| `--xh-segmented-item-px` | `item` | `padding-inline` | `default` | `--xh-_segmented-px` | segmented 的 item 部件 padding-inline 覆盖槽。 |
| `--xh-segmented-item-radius` | `item` | `border-radius` | `default` | `--xh-shape-inset` | segmented 的 item 部件 border-radius 覆盖槽。 |
| `--xh-segmented-radius` | `root` | `border-radius` | `default` | `--xh-shape-surface` | segmented 的 root 部件 border-radius 覆盖槽。 |
| `--xh-segmented-track-padding` | `item`<br>`root` | `min-block-size`<br>`padding` | `default`<br>`orientation=horizontal` | `--xh-space-0_5` | segmented 的 item、root 部件 min-block-size、padding 覆盖槽。 |
<!-- xh-component-tokens:end -->

### 动效

`background-color` · `block-size` · `box-shadow` · `color` · `inline-size` · `inset-block-start` · `inset-inline-start` 走 `transition` 过渡。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。

### 响应式

皮肤另按输入能力分档：`pointer: coarse`：同一份皮肤在触屏与带指针的设备上不一样，与视口宽度无关。

### RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像。

- 方向从 DOM 读取：整页或某个祖先声明了 `dir='rtl'`（或 CSS `direction`），左右方向键的语义与指示器的起始缘一起翻转，不需要再向组件传递。上下键不受影响。
- `dir` 属性是显式覆盖：提供后以它为准，用于整页 ltr、局部 rtl 的场合。
- 指示器的偏移按逻辑起始缘计算，rtl 下自动从右缘计算，不需要另写样式。
