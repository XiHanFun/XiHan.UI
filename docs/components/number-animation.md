# NumberAnimation 数值动画

数字从一个值滚动到另一个值。

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/number-animation" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/number-animation.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/number-animation" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/number-animation" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/number-animation.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## 用法

挂载即从 from 变化到 to，三个尺寸档只改变字号；不写 size 即跟随上下文的字号

<XhDemo src="number-animation/01-basic" />

## 组件结构

加粗的是必需部件。

`data-scope="number-animation"`：**`root`**

## 示例

### 小数位与千位分隔

precision 决定小数位，separator 决定分隔符；不提供分隔符即不分隔，使用什么符号是地区习惯

<XhDemo src="number-animation/02-format" />

### 缓动与时长

duration 决定时长，easing 决定快慢的分配；同一段距离四档并排运行，差别一目了然

<XhDemo src="number-animation/03-easing" />

### 跟随数据变化

修改 to 即从当前数字继续变化到新终点，结束后再次修改照样重新运行；active 切换为假即停在当前值

<XhDemo src="number-animation/04-follow-data" />

### 语言与数字格式

locale 决定小数点与分组习惯，formatOptions 交给 Intl.NumberFormat 铺货币、百分比与紧凑记数；小数位仍归 precision

<XhDemo src="number-animation/05-intl" />

## 设计指引

### 何时使用

- 仪表盘上的关键指标首次出现时，用滚动强调变化。

### 何时不用

- 数值频繁变化时，每次都滚动会使用户读不到稳定值。
- 精确的金额或编号，用户需要读取而不是感知趋势。

### 特性

- `precision` 小数位、`separator` 分组符，每一帧都按同一个位数铺字，数字不会在滚动中忽长忽短。
- 文字由 `Intl.NumberFormat` 铺出：`locale` 决定小数点、分组习惯与数字系统（未提供时跟随宿主语言），`formatOptions` 给出货币、百分比、单位与紧凑记数；`formatOptions.useGrouping` 打开即按该语言的习惯分组。
- `easing` 与 `duration` 决定滚动的节奏；不写时与图表里的数字同一口径：首次滚动按入场档（reveal、enter-strong），换目标按更新档（morph、continuous）。
- 屏幕外不空转：首次滚动时不在视口里就停在起点，进了视口再从头滚；换目标时不在视口里直接落到终值。
- `live` 决定读屏播报方式，通常只播报终值。

### 组合

- 放入[统计数值](./statistic)的值位。

### 最佳实践

- 时长控制在一秒以内，更长会变成等待。
- 读屏只播报终值，不读出每一帧。

### 反模式

- 给实时刷新的数字加滚动动画。
- 系统开启减弱动效时仍然滚动。

## API 参考

### 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-number-animation>` |
| Vue 组件 | `XhNumberAnimation` |
| 状态机 | `numberAnimationMachine` |
| 皮肤 | `@xihan-ui/styles/number-animation.css` |

### Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `from` | `number` |  | 起点，默认 0。改写它会把显示值立即落到新起点，并从那里重新运行本轮。 |
| `to` | `number` |  | 终点，默认 0。改写它从当前显示值继续走向新终点，不跳回起点。 |
| `duration` | `number` |  | 时长毫秒；&lt;=0 即一步到位。不写按数值角色取令牌：首次滚动与图表数字入场同档（reveal）， 换目标与图表数字更新同档（morph）。 |
| `easing` | `NumberAnimationEasing` |  | 缓动：曲线名（linear / standard / easeIn / easeOut / easeInOut …）或 CSS 缓动函数串；认不出的写法在起跑时报错。 不写按数值角色取令牌：首次滚动取 enter-strong，换目标取 continuous。 |
| `precision` | `number` |  | 小数位，默认 0。夹进 [0, 20]；每一帧都按这个位数铺字。 |
| `separator` | `string` |  | 分组符。给了就分组并把该语言的分组符换成它；默认不分组。 |
| `locale` | `string` |  | BCP 47 语言标记，决定小数点、分组习惯、数字系统与货币写法。 未提供时按宿主语言，宿主也没有时按 en-US。 |
| `formatOptions` | `NumberAnimationFormatOptions` |  | 交给 Intl.NumberFormat 的选项：货币、百分比、单位、紧凑记数、符号与数字系统， `useGrouping` 打开即按该语言的习惯分组。小数位不在其中，归 `precision`。 |
| `active` | `boolean` |  | 是否运行，默认 true。变为假即停在当前值，变为真从当前值继续走向终点。 |
| `size` | `Size` |  | 尺寸：sm / md / lg，只写为 root 的 data-size。 |
| `tone` | `Tone` |  | 语气：brand / neutral / success / warning / danger / info，只写为 root 的 data-tone。 |
| `live` | `NumberAnimationLive` |  | 读屏播报档位，默认 off。 |
| `onComplete` | `(details: NumberAnimationCompleteDetails) => void` |  | 到达终点时通知一次。中途被停止不通知。 |

### 事件

自定义元素将载荷放在 `detail`；Vue 使用同名 emit。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `complete` | `NumberAnimationCompleteDetails` | 到达终点；detail 为 `{ value: number }` |

### 插槽

仅列出带载荷的插槽。

| Vue 组件 | 插槽 | 载荷 | 说明 |
| --- | --- | --- | --- |
| `XhNumberAnimation` | `default` | `NumberAnimationSlotProps` |  |

### React 适配器 props

只列各组件自己声明的那些：继承自 `ComponentPropsWithRef` 的 DOM 属性不在其中，根组件上与上面 Props 表同名的也不重复列。Vue 的对应物是上面的插槽表。

| React 组件 | 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- | --- |
| `XhNumberAnimation` | `children` | `SlotChildren<NumberAnimationSlotProps>` |  |  |

### 状态

公开状态写入 `data-state`。

| 部件 | 取值 |
| --- | --- |
| `root` | 'idle' \| 'running' |

以下名称仅用于内部状态机。

**状态**：`idle` · `running`

**事件**：`RUN.START` · `RUN.STOP` · `RUN.SYNC` · `FRAME` · `RUN.SKIP`

**判据**：`isSettled` · `isActive`

### connect API

`getXxxProps()` 返回对应部件的宿主属性。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `phase` | `NumberAnimationPhase` |  |
| `value` | `number` | 当前数值（未格式化）。 |
| `text` | `string` | 当前数值按 locale、precision、separator 与 formatOptions 格式化的文本，即根中应显示的文字。 |
| `running` | `boolean` | 是否仍在运行。 |
| `getRootProps` | `() => T['element']` |  |

## 无障碍

### 键盘

规格出处：[W3C APG](https://www.w3.org/TR/wai-aria-1.2/#status)

无键盘交互（不接收焦点，或焦点行为完全由原生元素提供）。

### ARIA

以下属性由 `connect` 生成。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `aria-live` | props.live |
| `root` | `role` | 'status' |

## 样式参考

### 皮肤

`@xihan-ui/styles/number-animation.css` 按 `[data-scope="number-animation"][data-part="root"]` 部件选择器书写，发布产物以挂载类 `.xh-scope-number-animation` 代替其中的 data-scope（特异性相同），位于 `xihan.components` 层。覆盖样式使用 `xihan.overrides`，部件选择器照常可用。

### 数据属性

由 `connect` 生成；条件不成立时不输出无值属性。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-size` | props.size |
| `root` | `data-state` | 'idle' \| 'running' |
| `root` | `data-tone` | props.tone |

<!-- xh-component-tokens:start -->
### CSS 变量

本组件公开覆盖槽由独立皮肤的实际消费位生成；默认来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 默认来源 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `--xh-number-animation-fg` | `root` | `color` | `default` | `--xh-_tone-fg` | number-animation 的 root 部件 color 覆盖槽。 |
| `--xh-number-animation-font-size` | `root` | `font-size` | `default` | `--xh-_number-animation-size` | number-animation 的 root 部件 font-size 覆盖槽。 |
<!-- xh-component-tokens:end -->

### 动效

皮肤里没有过渡也没有关键帧，本组件的动效不在皮肤里：值由内核逐帧算出（`frameLoop` · `isTweenDone` · `tweenValueAt`），皮肤里看不到这段；内核按组件所在的作用域判断减弱动效（最近的 `data-motion`、应用级覆盖、系统偏好），据此决定要不要动。时长与缓动从元素读[动效令牌](../guide/motion)。

系统开启减弱动效时由内核按元素判断后自行降级，不经令牌层。
