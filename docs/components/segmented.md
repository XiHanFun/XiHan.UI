# 分段控制器 <Badge type="info" text="segmented" />

一排连在一起的互斥选项，选中的那一段底下有一块会滑动的指示器。它是单选组，参与表单提交。

## 何时使用

- 二到五个平级选项之间切换：视图模式（列表 / 网格）、时间粒度（日 / 周 / 月）、排序方式。
- 选项少、名字短，且值得一直摊开给用户看——分段控件的价值就在于不用点开就知道有哪几个。
- 需要随表单一起提交这个选择。

## 何时不用

- 选项超过六个，或选项文字长短悬殊：改用[单选组](./radio-group)竖排，或[选择器](./select)收进浮层。
- 需要多选，或表达的是按钮的按下态而不是一个字段值：用[切换按钮组](./toggle-group)——它没有 `name`、不参与表单，也没有滑动指示器。
- 切换的是同一块区域的几屏内容：那是[标签页](./tabs)，它管的是面板的显隐，不是一个值。

## 特性

- 集合入口：给 `collection` 就只交数据，条目文本与禁用都以数据为准；要改结构再写部件。
- 受控与非受控两态齐全：`value` 给了即受控，只发 `onValueChange` 不自改。
- 参与表单：给 `name` 后隐藏输入才带上它；宿主表单点重置，选中值回落到 `defaultValue`。隐藏输入只在「只交 `collection`、由组件铺开结构」时自动铺；自己写默认插槽排版的话，得记得放一个隐藏输入部件，否则给了 `name` 也没有任何东西参与提交。
- 指示器位置由组件量出来，横排竖排、ltr 与 rtl 都是同一条规则。
- 语气 · 尺寸两轴与其余组件同源；`block` 让整组撑满行宽、各段等分。

## 示例

### 基础用法

一排互斥选项：root 是 radiogroup、每段是 radio；整组只占一个 Tab 位，进组后四个方向键都能走

<XhDemo src="segmented/01-basic" />

### 受控

传了 value 就由宿主说了算；值可以是 null，表示一段都没选中

<XhDemo src="segmented/02-controlled" />

### 撑满行宽

block 让整组占满一行，各段等分剩余空间，长短不一的文字也排得齐

<XhDemo src="segmented/03-block" />

### 竖排

orientation 只改视觉排布，四个方向键与 Home/End 照样都能走

<XhDemo src="segmented/04-vertical" />

### 禁用

单段禁用仍可聚焦、仍是方向键的起点，只是走不到它上面；整组禁用则谁都改不动

<XhDemo src="segmented/05-disabled" />

### 语气

tone 决定指示器与选中段文字用哪族颜色，六种语气各一组

<XhDemo src="segmented/06-tone" />

### 尺寸

size 换的是段的高度、内边距与字号，指示器跟着量出来的段走

<XhDemo src="segmented/07-size" />

### 表单

给了 name 才带上隐藏输入参与提交；宿主表单点重置，选中值回落到 default-value

<XhDemo src="segmented/08-form" />

## 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-segmented>` |
| Vue 组件 | `XhSegmentedHiddenInput` `XhSegmentedIndicator` `XhSegmentedItem` `XhSegmentedItemText` `XhSegmentedRoot` |
| 组合式函数 | `useSegmented` |
| 状态机 | `segmentedMachine` |
| 皮肤 | `@xihan-ui/styles/segmented.css` |

## 解剖

部件名即 `data-part` 属性值，也是皮肤的选择器。加粗的是必备部件，不渲染它组件不工作（Web Components 适配器会在诊断通道上报 `wc.missing-part`）。

`data-scope="segmented"`：**`root`** · **`item`** · `item-text` · `indicator` · `hidden-input`

## Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `collection` | `SegmentedNode[]` |  | 条目数据，显示文本与禁用的事实源。给了它，条目部件只需报 value。 缺省即回到「文本与禁用都写在条目部件上」的老路。 |
| `value` | `string \| null` |  | 选中值。给定即受控：内部不再自改，只发 onValueChange。 |
| `defaultValue` | `string \| null` |  |  |
| `disabled` | `boolean` |  | 整组禁用：条目全部 aria-disabled，点击与方向键都不生效。 |
| `readOnly` | `boolean` |  | 只读：选不动，但仍可聚焦、方向键照常移焦点，对比度不降。 |
| `invalid` | `boolean` |  | 校验失败：只改呈现，不挡交互。 |
| `required` | `boolean` |  | 必填：随表单校验一起用，只发无障碍属性，不自行拦提交。 |
| `name` | `string` |  | 表单字段名。给定后隐藏输入才带 name 并参与提交。 |
| `orientation` | `Orientation` |  | 视觉排布，默认 horizontal。方向键接受的轴与它无关（四个方向键恒响应）。 |
| `dir` | `Direction` |  | 文字方向，只改写左右方向键的语义与指示器的起始缘，上下键与之无关。 不给即从根节点的计算样式现读（祖先链上的 dir 与 CSS direction 都算），给了就以它为准。 |
| `loop` | `boolean` |  | 方向键走到尽头是否回绕，默认 true。 |
| `block` | `boolean` |  | 撑满行宽，各段等分剩余空间。 |
| `tone` | `Tone` |  | 语气：brand / neutral / success / warning / danger / info，决定用哪族颜色。 |
| `size` | `Size` |  | 尺寸：sm / md / lg。 |
| `onValueChange` | `(details: SegmentedValueChangeDetails) => void` |  | value 变化意图回调；受控时是唯一出口，非受控随内部写入一并通知。 |

## 事件

自定义元素派发这些事件，Vue 组件对应同名 emit；载荷都在 `detail` 上。可双向绑定的值另有 `update:xxx`，见 Props。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `value-change` | `SegmentedValueChangeDetails` | 选中值变化；detail 为 `{ value: string \| null }` |

## 插槽

作者能拿到载荷的插槽。只转发内容、不带载荷的默认插槽不在此列——那类直接写子节点即可。

| Vue 组件 | 插槽 | 载荷 | 说明 |
| --- | --- | --- | --- |
| `XhSegmentedRoot` | `default` | — |  |
| `XhSegmentedRoot` | `item` | `SegmentedNodeMeta` | 铺开 collection 时每一段的文本插槽。 |

## 状态

状态机内部转移，写样式与业务都用不到；要监听变化请看上面的「事件」。

**状态**：`idle`

**事件**：`VALUE.SET` · `ITEM.SELECT` · `ITEM.FOCUS` · `GROUP.BLUR` · `INDICATOR.MEASURE` · `FORM.RESET`

## connect API

`useSegmented` 产出的对象。`getXxxProps()` 铺到对应部件的宿主元素上，其余是可读状态与操作入口。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `value` | `string \| null` | 当前选中值；一个都没选中时为 null。 |
| `collection` | `readonly SegmentedNodeMeta[]` | collection 推出的条目元信息，按数据顺序排列；没给 collection 即空数组。 |
| `focusedValue` | `string \| null` | 焦点在组外时为 null。 |
| `disabled` | `boolean` |  |
| `readOnly` | `boolean` |  |
| `isSelected` | `(value: string) => boolean` |  |
| `setValue` | `(next: string \| null) => void` |  |
| `measure` | `() => void` | 重量一遍指示器。选中值变化与 collection 增删改名都会自动重量，根的尺寸变化由尺寸观察器接住； 剩下这一类要手动叫：段的文字由部件手写（没走 collection）而后改动，或字体加载完把段撑宽了。 |
| `getRootProps` | `() => T['element']` |  |
| `getItemProps` | `(props: SegmentedItemProps) => T['button']` |  |
| `getItemTextProps` | `(props: SegmentedItemProps) => T['element']` |  |
| `getIndicatorProps` | `() => T['element']` |  |
| `getHiddenInputProps` | `() => T['input']` | 选中值随这份原生输入提交。 |

## 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/radio/#keyboardinteraction)

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `Tab` / `Shift+Tab` | focus outside the group | 整组只占一个 Tab 位：焦点落到锚点段（即选中段），锚点缺席或被禁用时先落容器再由它转投首个可停留段 |
| `ArrowRight` / `ArrowDown` | focus in group, 组未禁用 | 焦点移到下一个可停留段并选中它（禁用段跳过、尽头按 loop 回绕）；只读时焦点照走但不落值；dir=rtl 时改由 ArrowLeft 承担 |
| `ArrowLeft` / `ArrowUp` | focus in group, 组未禁用 | 焦点移到上一个可停留段并选中它；只读时焦点照走但不落值；dir=rtl 时改由 ArrowRight 承担 |
| `Home` | focus in group, 组未禁用 | 焦点移到首个可停留段并选中它；只读时只移焦点 |
| `End` | focus in group, 组未禁用 | 焦点移到末个可停留段并选中它；只读时只移焦点 |
| `Enter` / `Space` | focus on item, 该段未禁用且组非只读 | 选中当前段；段是原生 button，这两个键由平台翻成 click |

## 无障碍

下面这些由 `connect` 铺到部件上，作者不必自己写；重复写反而会覆盖掉正确值。

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

- 根节点是 `radiogroup`，每一段是 `radio` 并显式报 `aria-checked`。
- 整组只占一个 Tab 位，组内靠方向键走，Home/End 直达首末段；焦点进组落在已选中的那一段上。
- 禁用的段用 `aria-disabled` 而不是原生 `disabled`：它仍然可以聚焦、仍然是方向键的起点。
- 组本身没有可见标题，请自己给根节点写 `aria-label` 或 `aria-labelledby`，否则读屏只会念"单选组"。
- 指示器是纯装饰，对读屏隐藏；"当前是哪一段"靠段自己的选中态表达，指示器不渲染也读得出来。

## 样式

默认皮肤 `@xihan-ui/styles/segmented.css` 按部件选择：`[data-scope="segmented"][data-part="root"]`。它落在 `xihan.components` 层；业务样式不写进 `@layer` 即高于全部库层，要按层压过来就写进 `xihan.overrides`。

## 数据属性

由 `connect` 产出并铺到部件上，皮肤与测试都据此选择；`data-disabled` 这类无值属性在条件不成立时整个不出现。

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
| `indicator` | `data-value` | context.get('value') |

## CSS 变量

本组件皮肤读的组件级令牌，写在组件自身或任意祖先上都生效。缺省值来自[设计令牌](../guide/theme)，不设即按缺省走。

`--xh-segmented-bg` · `--xh-segmented-bg-disabled` · `--xh-segmented-border` · `--xh-segmented-border-invalid` · `--xh-segmented-font-size` · `--xh-segmented-h` · `--xh-segmented-indicator-bg` · `--xh-segmented-indicator-radius` · `--xh-segmented-indicator-shadow` · `--xh-segmented-indicator-shadow-disabled` · `--xh-segmented-item-bg-hover` · `--xh-segmented-item-fg` · `--xh-segmented-item-fg-checked` · `--xh-segmented-item-fg-checked-disabled` · `--xh-segmented-item-fg-hover` · `--xh-segmented-item-font-weight` · `--xh-segmented-item-gap` · `--xh-segmented-item-h` · `--xh-segmented-item-press-scale` · `--xh-segmented-item-px` · `--xh-segmented-item-radius` · `--xh-segmented-radius` · `--xh-segmented-track-padding`

## 动效

状态切换走 `transition`。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。

## RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像。

- 方向从 DOM 现读：整页或某个祖先声明了 `dir='rtl'`（或 CSS `direction`），左右方向键的语义与指示器的起始缘就一起翻过来，不必再给组件传一遍。上下键不受影响。
- `dir` 属性是显式覆盖：给了就以它为准，用在「整页 ltr、局部一块 rtl」这类场合。
- 指示器的偏移按逻辑起始缘量，rtl 下自动从右缘算起，不必另写一套样式。

## 组合

- 放进[表单字段](./field)里，让标签、说明与错误文案一并接上。
- 与[标签页](./tabs)搭：分段控件切数据口径，标签页切内容面板，两者不要互相顶替。

## 最佳实践

- 各段文字长度尽量接近：长短悬殊时指示器一滑，整排宽度会跟着跳。
- 段数固定下来再上：分段控件不适合数量会变的选项集。
- 选中态别只靠指示器的颜色区分，文字色也要跟着变，色觉障碍的用户才分得出。
- 段的文字不走 `collection` 而是自己手写、且会在运行期改动时，改完叫一次 `measure()`：指示器只跟着选中值、集合与根的尺寸走，段内文字撑宽了它看不见。
- 动态摘掉正持有焦点的那一段（比如按权限过滤掉它）之后，焦点会掉回 `<body>`。组件只保证 Tab 位退回容器、键盘还进得来；要不丢位置，得由页面自己把焦点挪到相邻的那一段上。

## 反模式

- 把它当按钮组用：段是一个值的几个取值，不是几个动作。要触发动作用[按钮组](./button-group)。
- 一行里塞七八段：那已经是个下拉框了，还占着整行宽度。
- 用它切换整页内容却不改地址：用户刷新一次就回到了第一段。
