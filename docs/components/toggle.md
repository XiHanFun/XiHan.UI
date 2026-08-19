# 切换按钮 <Badge type="info" text="toggle" />

通用组件。三层同源：无头内核给出解剖与状态机，Vue 组件与自定义元素只是它的两层外壳，行为完全一致。

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

## 状态机

内部转移，写样式与业务都用不到；要监听变化请看上面的「事件」。

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

## CSS 变量

本组件皮肤读的组件级令牌，写在组件自身或任意祖先上都生效。缺省值来自[设计令牌](../guide/theme)，不设即按缺省走。

`--xh-toggle-bg` · `--xh-toggle-bg-hover` · `--xh-toggle-bg-pressed` · `--xh-toggle-fg` · `--xh-toggle-fg-pressed` · `--xh-toggle-font-size` · `--xh-toggle-font-weight` · `--xh-toggle-gap` · `--xh-toggle-h` · `--xh-toggle-px` · `--xh-toggle-radius`
