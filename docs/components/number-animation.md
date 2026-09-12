# NumberAnimation <Badge type="info" text="数值动画" />

数字从一个值滚动到另一个值。

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/number-animation" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/number-animation.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/number-animation" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/number-animation" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/number-animation.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## 用法

挂载即从 from 走到 to，三个尺寸档只改字号；不写 size 就跟着上下文的字号走

<XhDemo src="number-animation/01-basic" />

## 组件结构

加粗的是必需部件。

`data-scope="number-animation"`：**`root`**

## 示例

### 小数位与千位分隔

precision 定小数位，separator 定分隔符；不给分隔符就不分隔，插什么符号是地区习惯

<XhDemo src="number-animation/02-format" />

### 缓动与时长

duration 定跑多久，easing 定快慢怎么分配；同一段距离四档并排跑，差别一眼可见

<XhDemo src="number-animation/03-easing" />

### 跟着数据走

改 to 就从当前数字接着走向新终点，跑完停下之后再改也照样重新跑；active 翻假即停在当前值

<XhDemo src="number-animation/04-follow-data" />

## 设计指引

### 何时使用

- 仪表盘上的关键指标首次出现时，用滚动强调它在变化。

### 何时不用

- 数值频繁变化：每次都滚一遍，用户永远读不到稳定值。
- 是精确的金额或编号，用户要读取而不是感知趋势。

### 特性

- `precision` 小数位、`separator` 千位分隔。
- `easing` 与 `duration` 决定滚动的节奏。
- `live` 决定读屏播报方式——通常应该只播报终值。

### 组合

- 放进[统计数值](./statistic)的值位。

### 最佳实践

- 时长控制在一秒以内，再长就成了等待。
- 读屏只播报终值，别把每一帧都念出来。

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
| `from` | `number` |  | 起点，缺省 0。改写它会把显示值当场落到新起点，并从那里重跑这一轮。 |
| `to` | `number` |  | 终点，缺省 0。改写它从当前显示值接着走向新终点，不跳回起点。 |
| `duration` | `number` |  | 时长毫秒，缺省 1000；&lt;=0 即一步到位。 |
| `easing` | `NumberAnimationEasing` |  | 缓动：曲线名（linear / standard / easeIn / easeOut / easeInOut …）或 cubic-bezier 串，缺省线性。 |
| `precision` | `number` |  | 小数位，缺省 0。夹进 [0, 20]。 |
| `separator` | `string` |  | 千位分隔符，缺省不分隔。 |
| `active` | `boolean` |  | 是否在跑，缺省 true。翻假即停在当前值，翻真从当前值继续走向终点。 |
| `size` | `Size` |  | 尺寸：sm / md / lg，只落成 root 的 data-size。 |
| `tone` | `Tone` |  | 语气：brand / neutral / success / warning / danger / info，只落成 root 的 data-tone。 |
| `live` | `NumberAnimationLive` |  | 读屏播报档位，缺省 off。 |
| `onComplete` | `(details: NumberAnimationCompleteDetails) => void` |  | 走到终点时通知一次。中途被停掉不通知。 |

### 事件

自定义元素将载荷放在 `detail`；Vue 使用同名 emit。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `complete` | `NumberAnimationCompleteDetails` | 走到终点；detail 为 `{ value: number }` |

### 插槽

仅列出带载荷的插槽。

| Vue 组件 | 插槽 | 载荷 | 说明 |
| --- | --- | --- | --- |
| `XhNumberAnimation` | `default` | `NumberAnimationSlotProps` |  |

### 状态

公开状态写入 `data-state`。

| 部件 | 取值 |
| --- | --- |
| `root` | 'idle' \| 'running' |

以下名称仅用于内部状态机。

**状态**：`idle` · `running`

**事件**：`RUN.START` · `RUN.STOP` · `RUN.SYNC` · `FRAME`

**判据**：`isSettled` · `isActive`

### connect API

`getXxxProps()` 返回对应部件的宿主属性。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `phase` | `NumberAnimationPhase` |  |
| `value` | `number` | 当前数值（未格式化）。 |
| `text` | `string` | 当前数值按 precision 与 separator 铺好的文本，也就是根里该显示的字。 |
| `running` | `boolean` | 是否还在跑。 |
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

`@xihan-ui/styles/number-animation.css` 使用 `[data-scope="number-animation"][data-part="root"]` 部件选择器，位于 `xihan.components` 层。覆盖样式使用 `xihan.overrides`。

### 数据属性

由 `connect` 生成；条件不成立时不输出无值属性。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-size` | props.size |
| `root` | `data-state` | 'idle' \| 'running' |
| `root` | `data-tone` | props.tone |

<!-- xh-component-tokens:start -->
### CSS 变量

本组件公开覆盖槽由独立皮肤的实际消费位生成；缺省来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 缺省来源 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `--xh-number-animation-fg` | `root` | `color` | `default` | `--xh-_tone-fg` | number-animation 的 root 部件 color 覆盖槽。 |
| `--xh-number-animation-font-size` | `root` | `font-size` | `default` | `--xh-_number-animation-size` | number-animation 的 root 部件 font-size 覆盖槽。 |
<!-- xh-component-tokens:end -->

### 动效

皮肤里没有过渡也没有关键帧，本组件的动效不在皮肤里：值由内核逐帧算出（`frameLoop` · `isTweenDone` · `tweenValueAt`），皮肤里看不到这段；内核读系统的减弱动效偏好，据此决定要不要动。时长与缓动仍读[动效令牌](../guide/motion)。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。
