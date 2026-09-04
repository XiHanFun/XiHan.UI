# 时间 <Badge type="info" text="time" />

把一个时刻渲染成文本，绝对或相对。

## 何时使用

- 展示创建时间、更新时间、事件发生时刻。
- 需要"n 分钟前"这类相对表述。

## 何时不用

- 需要倒数剩余时长：用[倒计时](./countdown)。
- 需要用户选一个时间：用[时间选择器](./time-picker)。

## 特性

- `type` 切绝对与相对；相对分四档（分 / 小时 / 天），超过三十天退回绝对日期。
- `format` 自定义格式串，只改看到的文本，`datetime` 属性不跟着变。
- `locale` 只换用词与缺省格式串：`zh` 开头用中文那套，其余英文。不给就跟宿主浏览器语言，读不到才落 `en-US`。

## 示例

### 基础用法

渲染成 &lt;time datetime>：文本给人看，datetime 给机器读，两者取自同一个墙钟

<XhDemo src="time/01-basic" />

### 呈现方式

date 只到日、datetime 到秒、relative 说成「几分钟前」；datetime 属性的精度跟着走

<XhDemo src="time/02-type" />

### 自定义格式串

记号是 YYYY / YY / MM / M / DD / D / HH / H / mm / m / ss / s，只改看到的文本，datetime 不跟着变

<XhDemo src="time/03-format" />

### 相对时间

just now / n minutes ago 四档，超过三十天退回绝对日期；locale 只换用词，不给则跟随浏览器语言

<XhDemo src="time/04-relative" />

## 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-time>` |
| Vue 组件 | `XhTime` |
| 状态机 | 无，`connect` 直接由 props 算属性 |
| 皮肤 | `@xihan-ui/styles/time.css` |

## 解剖

部件名即 `data-part` 属性值，也是皮肤的选择器。加粗的是必备部件，不渲染它组件不工作（Web Components 适配器会在诊断通道上报 `wc.missing-part`）。

`data-scope="time"`：**`root`**

## Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `format` | `string` |  | 自定义格式串，记号是 YYYY / YY / MM / M / DD / D / HH / H / mm / m / ss / s。 给了就顶掉该 locale 的缺省格式串；relative 型下只在退回绝对日期时用得上。 |
| `locale` | `string` |  | BCP 47 语言标记，决定用词与缺省格式串：zh 开头用中文那套，其余一律英文。 不给按宿主语言，宿主也没有时按 en-US。它只换给人看的文本，datetime 恒是同一种写法。 |
| `now` | `TimeValue` |  | 算相对说法时的参照时刻，缺省取当前时刻。给定后整个组件的产出完全由入参决定。 |
| `type` | `TimeType` |  | 呈现方式：date 只到日、datetime 到秒、relative 说成「几分钟前」，缺省 datetime。 |
| `value` | `TimeValue` |  | 要显示的时刻。只写年月日的串按本地零点解读。 |

## 状态

对外可见的状态落在 `data-state` 上，写样式与断言都读它：

| 部件 | 取值 |
| --- | --- |
| `root` | 'empty' |

## connect API

`connect` 产出的对象。`getXxxProps()` 铺到对应部件的宿主元素上，其余是可读状态与操作入口。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `date` | `Date \| undefined` | 解析出的时刻；没给或认不出时为 undefined。 |
| `text` | `string` | 给人看的文本；没有可读时刻时是空串。 |
| `stamp` | `string \| undefined` | 写进 datetime 的那个戳；没有可读时刻时为 undefined，此时根上不写这个属性。 |
| `state` | `TimeState` | 当前状态。 |
| `relative` | `boolean` | 这一次是不是真按相对说法念的。落在四档之外退回了绝对日期时为 false。 |
| `getRootProps` | `() => T['element']` |  |

## 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/)

无键盘交互（不接收焦点，或焦点行为完全由原生元素提供）。

## 样式

默认皮肤 `@xihan-ui/styles/time.css` 按部件选择：`[data-scope="time"][data-part="root"]`。它落在 `xihan.components` 层；业务样式不写进 `@layer` 即高于全部库层，要按层压过来就写进 `xihan.overrides`。

## 数据属性

由 `connect` 产出并铺到部件上，皮肤与测试都据此选择；`data-disabled` 这类无值属性在条件不成立时整个不出现。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-format` | props.type |
| `root` | `data-relative` | ''（条件成立时才出现） |
| `root` | `data-state` | 'empty' |

## CSS 变量

本组件皮肤读的组件级令牌，写在组件自身或任意祖先上都生效。缺省值来自[设计令牌](../guide/theme)，不设即按缺省走。

`--xh-time-fg` · `--xh-time-placeholder-fg`

## 动效

状态切换走 `transition`。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。

## 组合

- 放进[列表](./list)的条目、[表格](./table)的单元格、[时间线](./timeline)的时间位。

## 最佳实践

- 相对时间旁边给出绝对时间（提示或 `title`），"3 天前"在追查问题时不够用。
- 时区要明确：跨时区团队里"昨天"是个含糊的说法。

## 反模式

- 只给相对时间且无法看到确切时刻。
- 对很久以前的事仍用相对表述（"427 天前"）。
