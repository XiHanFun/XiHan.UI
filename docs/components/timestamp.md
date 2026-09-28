# Timestamp 时间戳

把一个时刻渲染成文本，绝对或相对。

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/timestamp" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/timestamp.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/timestamp" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/timestamp" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/timestamp.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## 用法

渲染为 &lt;time datetime>：文本供人阅读，datetime 供机器读取，两者取自同一个墙钟

<XhDemo src="timestamp/01-basic" />

## 组件结构

加粗的是必需部件。

`data-scope="timestamp"`：**`root`**

## 示例

### 呈现方式

date 只到日、datetime 到秒、relative 表述为几分钟前等相对说法；datetime 属性的精度随之变化

<XhDemo src="timestamp/02-type" />

### 自定义格式串

记号是 YYYY / YY / MM / M / DD / D / HH / H / mm / m / ss / s，只改变看到的文本，datetime 不随之变化

<XhDemo src="timestamp/03-format" />

### 相对时间

一分钟以内是「现在」，其余按分、时、天取整，过去说「几分钟前」、将来说「几分钟后」，离现在三十天及以上退回绝对日期；用词由 Intl 按 locale 给出，未提供时跟随浏览器语言

<XhDemo src="timestamp/04-relative" />

### 自动刷新

相对型不给 now 时自己刷新：文字只在跨过分钟、小时、天的边界时才变，就只在那一刻刷新；页面隐藏或离开视口时暂停，回来时立即补一次

<XhDemo src="timestamp/05-live" />

### 时区

time-zone 给了 IANA 时区名就按那个时区的墙钟显示，datetime 带上该时区的偏移量；不带偏移量的 value 串也按这个时区解读

<XhDemo src="timestamp/06-time-zone" />

## 设计指引

### 何时使用

- 展示创建时间、更新时间、事件发生时刻。
- 需要“n 分钟前”“n 分钟后”等相对表述，并随时间推移自己刷新。

### 何时不用

- 需要倒数剩余时长时，使用[计时器](./timer)。
- 需要用户选择时间时，使用[时间选择器](./time-picker)。

### 特性

- `type` 切换绝对与相对；相对说法一分钟以内是「现在」，其余按分、时、天取整，过去与将来都认，离现在三十天及以上退回绝对日期。
- 用词与缺省日期写法由 `Intl.RelativeTimeFormat` / `Intl.DateTimeFormat` 按 `locale` 给出，任何语言都可用；未提供时跟随宿主浏览器语言，读取失败时使用 `en-US`。`translations.justNow` 可换掉「现在」那一档的说法。
- `format` 自定义格式串，只改变显示文本，`datetime` 属性不变。
- `timeZone` 给了 IANA 时区名就按那个时区的墙钟显示，`datetime` 带上偏移量；不带偏移量的 `value` 串也按这个时区解读。认不出的时区落 `invalid`。
- 相对型不给 `now` 时自动刷新：文字只在跨过分钟、小时、天的边界时才变，就只在那一刻刷新；页面隐藏或元素离开视口时暂停，回来时立即补一次。`refreshInterval` 改成固定间隔，给 0 不刷新；它是停留时长，不受减弱动效影响。

### 组合

- 放入[列表](./list)的条目、[表格](./table)的单元格、[时间线](./timeline)的时间位。

### 最佳实践

- 相对时间旁给出绝对时间（提示或 `title`），“3 天前”在追查问题时不够用。
- 时区要明确：跨时区团队中“昨天”是含糊的说法，给 `timeZone` 让所有人看到同一个墙钟。

### 反模式

- 只给相对时间且无法看到确切时刻。
- 对很久以前的事仍用相对表述（“427 天前”）。

## API 参考

### 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-timestamp>` |
| Vue 组件 | `XhTimestamp` |
| 状态机 | `timestampMachine` |
| 皮肤 | `@xihan-ui/styles/timestamp.css` |

### Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `format` | `string` |  | 自定义格式串，记号为 YYYY / YY / MM / M / DD / D / HH / H / mm / m / ss / s。 提供后覆盖该语言的缺省写法；relative 型下只在回退为绝对日期时使用。 |
| `locale` | `string` |  | BCP 47 语言标记，决定相对说法的用词与缺省的日期写法，任何语言都由 Intl 给出。 未提供时按宿主语言，宿主也没有时按 en-US。它只切换面向用户的文本，datetime 与语言无关。 |
| `now` | `TimestampValue` |  | 计算相对说法时的参照时刻，默认取当前时刻并自动刷新。提供后整个组件的产出完全由入参决定，不再刷新。 |
| `refreshInterval` | `number` |  | 相对型的刷新间隔（毫秒）。缺省按距今远近自适应：文字只在跨过分钟、小时、天的边界时才变， 就只在那一刻刷新；给正数按固定间隔刷新，给 0 不刷新。页面隐藏或元素离开视口时暂停，回来时立即刷新一次。 这是停留时长，不是动效，不受减弱动效影响。 |
| `timeZone` | `string` |  | IANA 时区名（如 `Asia/Shanghai`）。给了就按这个时区的墙钟显示，datetime 带上该时区的偏移量； 不带偏移量的 `value` 串也按这个时区解读。未提供时按运行时本地、datetime 不带偏移量。认不出的时区落 invalid。 |
| `translations` | `Partial<TimestampTranslations>` |  |  |
| `type` | `TimestampType` |  | 呈现方式：date 只到日、datetime 到秒、relative 表述为「几分钟前」「几分钟后」，默认 datetime。 |
| `value` | `TimestampValue` |  | 要显示的时刻。只写年月日的串按零点解读；不带偏移量的串按 `timeZone` 的墙钟解读，没给时区时按本地。 |

### 状态

公开状态写入 `data-state`。

| 部件 | 取值 |
| --- | --- |
| `root` | 'empty' |

以下名称仅用于内部状态机。

**状态**：`idle` · `live`

**事件**：`REFRESH.SYNC` · `TICK`

**判据**：`shouldRefresh`

### connect API

`getXxxProps()` 返回对应部件的宿主属性。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `date` | `Date \| undefined` | 解析出的时刻；未提供或无法识别时为 undefined。 |
| `text` | `string` | 面向用户的文本；没有可读时刻时为空串。 |
| `stamp` | `string \| undefined` | 写入 datetime 的时间戳；没有可读时刻时为 undefined，此时根上不写该属性。 |
| `state` | `TimestampState` | 当前状态。 |
| `relative` | `boolean` | 本次是否实际按相对说法朗读。离现在三十天及以上回退为绝对日期时为 false。 |
| `refreshing` | `boolean` | 正在按时刷新相对说法。 |
| `getRootProps` | `() => T['element']` |  |

## 无障碍

### 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/)

无键盘交互（不接收焦点，或焦点行为完全由原生元素提供）。

## 样式参考

### 皮肤

`@xihan-ui/styles/timestamp.css` 使用 `[data-scope="timestamp"][data-part="root"]` 部件选择器，位于 `xihan.components` 层。覆盖样式使用 `xihan.overrides`。

### 数据属性

由 `connect` 生成；条件不成立时不输出无值属性。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-format` | props.type |
| `root` | `data-relative` | ''（条件成立时才出现） |
| `root` | `data-state` | 'empty' |

<!-- xh-component-tokens:start -->
### CSS 变量

本组件公开覆盖槽由独立皮肤的实际消费位生成；默认来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 默认来源 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `--xh-timestamp-fg` | `root` | `color` | `default` | `--xh-fg-default` | timestamp 的 root 部件 color 覆盖槽。 |
| `--xh-timestamp-placeholder-fg` | `root` | `color` | `state=empty`<br>`state=invalid` | `--xh-fg-muted` | timestamp 的 root 部件 color 覆盖槽。 |
<!-- xh-component-tokens:end -->

### 动效

动效角色：状态（见[动效规范](../design/motion#角色)）。

`color` 走 `transition` 过渡。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。
