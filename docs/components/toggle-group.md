# 切换按钮组 <Badge type="info" text="toggle-group" />

一排连在一起的切换按钮，整组共一个值：单选时是分段控件，多选时是一排可同时按下的工具钮。

## 何时使用

- 在少数几个互斥项之间切换视图（日 / 周 / 月，列表 / 网格）。
- 一排可同时开关的格式工具（加粗 / 斜体 / 下划线），此时开 `multiple`。

## 何时不用

- 选项超过五六个，或需要搜索：用[选择器](./select)。
- 选项要随表单提交并需要 label 关联：用[单选组](./radio-group)。
- 各段是动作不是选项：用[按钮组](./button-group)。

## 特性

- `multiple` 换的是整套 ARIA：单选时 `root` 是 `radiogroup`、条目是 `radio`；多选时 `root` 退回 `group`、条目退回按钮加 `aria-pressed`，值也从字符串变成数组。
- roving tabindex：整组只占一个 Tab 位，进组后四个方向键都能走，与视觉排布无关。
- `disallowEmpty` 决定能不能点成空值。
- 条目一律 `aria-disabled` 而非原生 `disabled`：点不动但焦点落得上去，仍能当方向键的起点。
- 给了 `collection` 就由它做显示文本与禁用的事实源，条目部件只需报 `value`。

## 示例

### 基础用法

单选分段控件：root 是 radiogroup、条目是 radio；整组只占一个 Tab 位，进组后四个方向键都能走

<XhDemo src="toggle-group/01-basic" />

### 受控与不可清空

传了 value 就由宿主说了算；单选组再点一次当前项会清空成 null，disallow-empty 把这一手关掉

<XhDemo src="toggle-group/02-controlled" />

### 多选

multiple 换的是整套 ARIA：root 退回 group、条目退回原生按钮 + aria-pressed，值也从字符串变成数组

<XhDemo src="toggle-group/03-multiple" />

### 禁用

条目一律 aria-disabled 而非原生 disabled：点不动，但焦点落得上去，仍能当方向键的起点

<XhDemo src="toggle-group/04-disabled" />

### 条目增删

条目集合在运行期可增可删，增删后照常接线；删掉的正好是选中项时由宿主把值收拾干净

<XhDemo src="toggle-group/05-dynamic-items" />

### 拦下一次切换

受控时 value-change 是唯一出口：宿主不写回，值就原样不动，条件不满足的那一段永远切不过去

<XhDemo src="toggle-group/06-guard" />

### 整组换一档尺寸

高度、内边距与字号各是一个组件令牌，写在 root 上由整组条目继承，不必逐个条目改

<XhDemo src="toggle-group/07-size" />

## 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-toggle-group>` |
| Vue 组件 | `XhToggleGroupItem` `XhToggleGroupRoot` |
| 组合式函数 | `useToggleGroup` |
| 状态机 | `toggleGroupMachine` |
| 皮肤 | `@xihan-ui/styles/toggle-group.css` |

## 解剖

部件名即 `data-part` 属性值，也是皮肤的选择器。加粗的是必备部件，不渲染它组件不工作（Web Components 适配器会在诊断通道上报 `wc.missing-part`）。

`data-scope="toggle-group"`：**`root`** · **`item`**

## Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `collection` | `ToggleGroupNode[]` |  | 条目数据，显示文本与禁用的事实源。给了它，条目部件只需报 value。 缺省即回到「文本与禁用都写在条目部件上」的老路。 |
| `value` | `ToggleGroupValue` |  | 选中值。给定即受控：内部不再自改，只发 onValueChange。 |
| `defaultValue` | `ToggleGroupValue` |  |  |
| `multiple` | `boolean` |  | 允许多项同时选中；false 时选中一项即挤掉其余。 |
| `disabled` | `boolean` |  | 整组禁用：条目全部 aria-disabled，点击与方向键都不生效。 |
| `disallowEmpty` | `boolean` |  | 不许把值清空：单选模式下点当前选中项不再取消它，多选模式下摘不掉最后一个。 默认 false（可以点成无选中）。 |
| `tone` | `Tone` |  | 语气：brand / neutral / success / warning / danger / info，决定用哪族颜色。 |
| `size` | `Size` |  | 尺寸：sm / md / lg。 |
| `orientation` | `Orientation` |  | 视觉排布，默认 horizontal。方向键接受的轴与它无关（四个方向键恒响应）。 |
| `dir` | `Direction` |  | 文字方向，默认 ltr；只改写左右方向键的语义，上下键与之无关。 |
| `loop` | `boolean` |  | 方向键走到尽头是否回绕，默认 true。 |
| `rovingFocus` | `boolean` |  | roving tabindex，默认开启：整组只占一个 Tab 位，组内靠方向键走。 关掉后每个条目自成一个 Tab 停靠点，方向键不再接管。 |
| `onValueChange` | `(details: ToggleGroupValueChangeDetails) => void` |  | value 变化意图回调；受控时是唯一出口，非受控随内部写入一并通知。 |

## 事件

自定义元素派发这些事件，Vue 组件对应同名 emit；载荷都在 `detail` 上。可双向绑定的值另有 `update:xxx`，见 Props。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `value-change` | `ToggleGroupValueChangeDetails` | 选中值变化；detail 为 `{ value: string \| string[] \| null }`（形态跟着 multiple 走） |

## 状态

对外可见的状态落在 `data-state` 上，写样式与断言都读它：

| 部件 | 取值 |
| --- | --- |
| `item` | 'on' \| 'off' |

状态机内部转移，写样式与业务都用不到；要监听变化请看上面的「事件」。

**状态**：`idle`

**事件**：`VALUE.SET` · `ITEM.TOGGLE` · `ITEM.FOCUS` · `GROUP.BLUR`

## connect API

`useToggleGroup` 产出的对象。`getXxxProps()` 铺到对应部件的宿主元素上，其余是可读状态与操作入口。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `value` | `string[]` | 当前选中集合，恒为数组（单选时长度 ≤ 1）。 |
| `collection` | `readonly ToggleGroupNodeMeta[]` | collection 推出的条目元信息，按数据顺序排列；没给 collection 即空数组。 |
| `focusedValue` | `string \| null` | 焦点在组外时为 null。 |
| `multiple` | `boolean` |  |
| `disabled` | `boolean` |  |
| `isSelected` | `(value: string) => boolean` |  |
| `setValue` | `(next: ToggleGroupValue) => void` | 传单值 / 数组 / null 皆可，内部按 multiple 归一。 |
| `getRootProps` | `() => T['element']` |  |
| `getItemProps` | `(props: ToggleGroupItemProps) => T['button']` |  |

## 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/toolbar/#keyboardinteraction)

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `Tab` / `Shift+Tab` | rovingFocus 开启（默认） | 整组只占一个 Tab 位：焦点落到锚点条目，无锚点时先落容器再由它转投 |
| `ArrowRight` / `ArrowDown` | focus in group, 组未禁用且 rovingFocus 开启 | 焦点移到下一个可停留条目（禁用项跳过、尽头按 loop 回绕），不改选中；dir=rtl 时改由 ArrowLeft 承担 |
| `ArrowLeft` / `ArrowUp` | focus in group, 组未禁用且 rovingFocus 开启 | 焦点移到上一个可停留条目，不改选中；dir=rtl 时改由 ArrowRight 承担 |
| `Home` | focus in group, 组未禁用且 rovingFocus 开启 | 焦点移到首个可停留条目 |
| `End` | focus in group, 组未禁用且 rovingFocus 开启 | 焦点移到末个可停留条目 |
| `Enter` / `Space` | focus on item, 条目未禁用 | 切换该条目；条目是原生 button，这两个键由平台翻成 click |

## 无障碍

下面这些由 `connect` 铺到部件上，作者不必自己写；重复写反而会覆盖掉正确值。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `aria-orientation` | undefined \| props.orientation |
| `root` | `role` | 'group' \| 'radiogroup' |
| `item` | `aria-checked` | undefined \| 'true' \| 'false' |
| `item` | `aria-disabled` | 'true' \| 'false' |
| `item` | `aria-pressed` | 'true' \| 'false' \| undefined |
| `item` | `role` | undefined \| 'radio' |

## 样式

默认皮肤 `@xihan-ui/styles/toggle-group.css` 按部件选择：`[data-scope="toggle-group"][data-part="root"]`。它落在 `xihan.components` 层；业务样式不写进 `@layer` 即高于全部库层，要按层压过来就写进 `xihan.overrides`。

## 数据属性

由 `connect` 产出并铺到部件上，皮肤与测试都据此选择；`data-disabled` 这类无值属性在条件不成立时整个不出现。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-disabled` | ''（条件成立时才出现） |
| `root` | `data-orientation` | props.orientation |
| `root` | `data-size` | props.size |
| `root` | `data-tone` | props.tone |
| `item` | `data-disabled` | ''（条件成立时才出现） |
| `item` | `data-state` | 'on' \| 'off' |

## CSS 变量

本组件皮肤读的组件级令牌，写在组件自身或任意祖先上都生效。缺省值来自[设计令牌](../guide/theme)，不设即按缺省走。

`--xh-toggle-group-item-bg` · `--xh-toggle-group-item-bg-active` · `--xh-toggle-group-item-bg-disabled` · `--xh-toggle-group-item-bg-hover` · `--xh-toggle-group-item-bg-on` · `--xh-toggle-group-item-bg-on-active` · `--xh-toggle-group-item-bg-on-hover` · `--xh-toggle-group-item-border` · `--xh-toggle-group-item-border-disabled` · `--xh-toggle-group-item-border-on` · `--xh-toggle-group-item-border-on-disabled` · `--xh-toggle-group-item-fg` · `--xh-toggle-group-item-fg-disabled` · `--xh-toggle-group-item-fg-on` · `--xh-toggle-group-item-fg-on-disabled` · `--xh-toggle-group-item-font-size` · `--xh-toggle-group-item-font-weight` · `--xh-toggle-group-item-gap` · `--xh-toggle-group-item-h` · `--xh-toggle-group-item-px` · `--xh-toggle-group-item-radius` · `--xh-toggle-group-item-shadow` · `--xh-toggle-group-radius`

## 动效

状态切换走 `transition`。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。

## RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像。

## 组合

- 与[工具栏](./toolbar)嵌套：工具栏管跨组导航，本组管组内。

## 最佳实践

- 段数固定在二到五段，段宽尽量等长，切换时整条不该变宽。
- 单选组默认允许点空；表单里当必填项用时把 `disallowEmpty` 打开。

## 反模式

- 拿它当[标签页](./tabs)用：标签页有面板关联（`aria-controls`）与相应的读屏语义，切换按钮组没有。
- 关掉 `rovingFocus` 却不另给导航方式：每段自成一个 Tab 停靠点，键盘用户要按很多次才能走完。
