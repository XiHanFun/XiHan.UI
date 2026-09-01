# 切换按钮 <Badge type="info" text="toggle" />

一颗有记忆的按钮：按下去留在按下态，再按一下弹回来。状态由 `aria-pressed` 表达。

## 何时使用

- 开关一项立即生效的格式或视图（加粗、显示网格、静音）。
- 状态属于工具而不属于表单：它不参与表单提交。

## 何时不用

- 表示一项设置的开与关、且要随表单提交：用[开关](./switch)或[复选框](./checkbox)。
- 几个选项互斥：用[切换按钮组](./toggle-group)——多个独立的切换按钮各管各的按下态，凑不出互斥。
- 按下去只发生一次动作、不留状态：那是[按钮](./button)。

## 特性

- 形态 · 语气 · 尺寸三轴与按钮同源。
- 受控时宿主不写回 `pressed` 值就不动，在途期间来的意图直接丢掉。
- `disabled` 同时挡住指针与键盘，按下态保持原样。

## 示例

### 基础用法

按下态由 pressed 表达，非受控时组件自己维护

<XhDemo src="toggle/01-basic" />

### 禁用

disabled 同时挡住指针与键盘，按下态保持原样

<XhDemo src="toggle/02-disabled" />

### 排成一组

多个独立的 toggle 各管各的按下态；要互斥或单一 Tab 位请改用切换按钮组

<XhDemo src="toggle/03-group" />

### 形态

variant 决定颜色怎么用，未按下与已按下两档一起看才完整

<XhDemo src="toggle/04-variant" />

### 语气

tone 决定用哪族颜色，与 variant 正交；这里固定 solid 形态并置于按下态，语气差别最明显

<XhDemo src="toggle/05-tone" />

### 尺寸

size 只改高度、内边距与字号，不写就是缺省档

<XhDemo src="toggle/06-size" />

### 图标

按钮内容随便写，图标与文字之间的空隙由 --xh-toggle-gap 给；只放图标时按钮没有可见文字，名字得由 aria-label 补上

<XhDemo src="toggle/07-icon" />

### 变化回调

pressed-change 每次带着 details 报一次按下意图；不做受控绑定时它就是拿到新值的唯一出口

<XhDemo src="toggle/08-events" />

### 请求在途

受控的 pressed 不写回就不会动，在途期间来的意图直接丢掉；忙碌反馈由 aria-busy 与一枚转圈补在按钮上

<XhDemo src="toggle/09-pending" />

## 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-toggle>` |
| Vue 组件 | `XhToggle` |
| 组合式函数 | `useToggle` |
| 状态机 | `toggleMachine` |
| 皮肤 | `@xihan-ui/styles/toggle.css` |

## 解剖

部件名即 `data-part` 属性值，也是皮肤的选择器。加粗的是必备部件，不渲染它组件不工作（Web Components 适配器会在诊断通道上报 `wc.missing-part`）。

`data-scope="toggle"`：**`root`**

## Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `pressed` | `boolean` |  |  |
| `defaultPressed` | `boolean` |  |  |
| `disabled` | `boolean` |  |  |
| `variant` | `ActionVariant` |  | 形态：solid / subtle / outline / ghost，决定颜色怎么用 |
| `tone` | `Tone` |  | 语气：brand / neutral / success / warning / danger / info，决定用哪族颜色 |
| `size` | `Size` |  | 尺寸：sm / md / lg |
| `onPressedChange` | `(details: TogglePressedChangeDetails) => void` |  | pressed 变化意图回调；受控时是唯一出口，非受控随内部转移一并通知。 |

## 事件

自定义元素派发这些事件，Vue 组件对应同名 emit；载荷都在 `detail` 上。可双向绑定的值另有 `update:xxx`，见 Props。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `pressed-change` | `TogglePressedChangeDetails` | pressed 状态变化；detail 为 `{ pressed: boolean }` |

## 状态

对外可见的状态落在 `data-state` 上，写样式与断言都读它：

| 部件 | 取值 |
| --- | --- |
| `root` | 'on' \| 'off' |

状态机内部转移，写样式与业务都用不到；要监听变化请看上面的「事件」。

**状态**：`off` · `on`

**事件**：`TOGGLE` · `CONTROLLED.ON` · `CONTROLLED.OFF`

**判据**：`isPressedControlled`

## connect API

`useToggle` 产出的对象。`getXxxProps()` 铺到对应部件的宿主元素上，其余是可读状态与操作入口。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `pressed` | `boolean` |  |
| `setPressed` | `(next: boolean) => void` |  |
| `getRootProps` | `() => T['button']` |  |

## 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/button/#keyboardinteraction)

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `Space` / `Enter` | focus in root, not disabled | 切换 pressed 状态 |

## 无障碍

下面这些由 `connect` 铺到部件上，作者不必自己写；重复写反而会覆盖掉正确值。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `aria-pressed` | 'true' \| 'false' |

## 样式

默认皮肤 `@xihan-ui/styles/toggle.css` 按部件选择：`[data-scope="toggle"][data-part="root"]`。它落在 `xihan.components` 层；业务样式不写进 `@layer` 即高于全部库层，要按层压过来就写进 `xihan.overrides`。

## 数据属性

由 `connect` 产出并铺到部件上，皮肤与测试都据此选择；`data-disabled` 这类无值属性在条件不成立时整个不出现。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-disabled` | ''（条件成立时才出现） |
| `root` | `data-size` | props.size |
| `root` | `data-state` | 'on' \| 'off' |
| `root` | `data-tone` | props.tone |
| `root` | `data-variant` | props.variant |

## CSS 变量

本组件皮肤读的组件级令牌，写在组件自身或任意祖先上都生效。缺省值来自[设计令牌](../guide/theme)，不设即按缺省走。

`--xh-toggle-bg` · `--xh-toggle-bg-hover` · `--xh-toggle-bg-pressed` · `--xh-toggle-fg` · `--xh-toggle-fg-pressed` · `--xh-toggle-font-size` · `--xh-toggle-font-weight` · `--xh-toggle-gap` · `--xh-toggle-h` · `--xh-toggle-px` · `--xh-toggle-radius` · `--xh-toggle-shadow`

## 动效

状态切换走 `transition`。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。

## RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像。

## 组合

- 排成一条工具条：外面套[工具栏](./toolbar)拿到方向键导航。
- 只放图标时配[文字提示](./tooltip)。

## 最佳实践

- 只放图标时给 `aria-label`，名字不能靠图形猜。
- 按下与未按下的差别要能在灰度下看出来，别只靠颜色。

## 反模式

- 用它表达"当前在哪个标签页"：那是[标签页](./tabs)的事。
- 请求在途时让按钮先翻状态再回滚：受控绑定不写回，用户看到的就是稳定的。
