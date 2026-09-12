# Timestamp <Badge type="info" text="时间戳" />

把一个时刻渲染成文本，绝对或相对。

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/timestamp" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/timestamp.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/timestamp" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/timestamp" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/timestamp.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## 用法

渲染成 &lt;time datetime>：文本给人看，datetime 给机器读，两者取自同一个墙钟

<XhDemo src="timestamp/01-basic" />

## 组件结构

加粗的是必需部件。

`data-scope="timestamp"`：**`root`**

## 示例

### 呈现方式

date 只到日、datetime 到秒、relative 说成「几分钟前」；datetime 属性的精度跟着走

<XhDemo src="timestamp/02-type" />

### 自定义格式串

记号是 YYYY / YY / MM / M / DD / D / HH / H / mm / m / ss / s，只改看到的文本，datetime 不跟着变

<XhDemo src="timestamp/03-format" />

### 相对时间

just now / n minutes ago 四档，超过三十天退回绝对日期；locale 只换用词，不给则跟随浏览器语言

<XhDemo src="timestamp/04-relative" />

## 设计指引

### 何时使用

- 展示创建时间、更新时间、事件发生时刻。
- 需要"n 分钟前"这类相对表述。

### 何时不用

- 需要倒数剩余时长：用[计时器](./timer)。
- 需要用户选一个时间：用[时间选择器](./time-picker)。

### 特性

- `type` 切绝对与相对；相对分四档（分 / 小时 / 天），超过三十天退回绝对日期。
- `format` 自定义格式串，只改看到的文本，`datetime` 属性不跟着变。
- `locale` 只换用词与缺省格式串：`zh` 开头用中文那套，其余英文。不给就跟宿主浏览器语言，读不到才落 `en-US`。

### 组合

- 放进[列表](./list)的条目、[表格](./table)的单元格、[时间线](./timeline)的时间位。

### 最佳实践

- 相对时间旁边给出绝对时间（提示或 `title`），"3 天前"在追查问题时不够用。
- 时区要明确：跨时区团队里"昨天"是个含糊的说法。

### 反模式

- 只给相对时间且无法看到确切时刻。
- 对很久以前的事仍用相对表述（"427 天前"）。

## API 参考

### 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-timestamp>` |
| Vue 组件 | `XhTimestamp` |
| 状态机 | 无，`connect` 直接由 props 算属性 |
| 皮肤 | `@xihan-ui/styles/timestamp.css` |

### Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `format` | `string` |  | 自定义格式串，记号是 YYYY / YY / MM / M / DD / D / HH / H / mm / m / ss / s。 给了就顶掉该 locale 的缺省格式串；relative 型下只在退回绝对日期时用得上。 |
| `locale` | `string` |  | BCP 47 语言标记，决定用词与缺省格式串：zh 开头用中文那套，其余一律英文。 不给按宿主语言，宿主也没有时按 en-US。它只换给人看的文本，datetime 恒是同一种写法。 |
| `now` | `TimestampValue` |  | 算相对说法时的参照时刻，缺省取当前时刻。给定后整个组件的产出完全由入参决定。 |
| `type` | `TimestampType` |  | 呈现方式：date 只到日、datetime 到秒、relative 说成「几分钟前」，缺省 datetime。 |
| `value` | `TimestampValue` |  | 要显示的时刻。只写年月日的串按本地零点解读。 |

### 状态

公开状态写入 `data-state`。

| 部件 | 取值 |
| --- | --- |
| `root` | 'empty' |

### connect API

`getXxxProps()` 返回对应部件的宿主属性。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `date` | `Date \| undefined` | 解析出的时刻；没给或认不出时为 undefined。 |
| `text` | `string` | 给人看的文本；没有可读时刻时是空串。 |
| `stamp` | `string \| undefined` | 写进 datetime 的那个戳；没有可读时刻时为 undefined，此时根上不写这个属性。 |
| `state` | `TimestampState` | 当前状态。 |
| `relative` | `boolean` | 这一次是不是真按相对说法念的。落在四档之外退回了绝对日期时为 false。 |
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

本组件公开覆盖槽由独立皮肤的实际消费位生成；缺省来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 缺省来源 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `--xh-timestamp-fg` | `root` | `color` | `default` | `--xh-fg-default` | timestamp 的 root 部件 color 覆盖槽。 |
| `--xh-timestamp-placeholder-fg` | `root` | `color` | `state=empty`<br>`state=invalid` | `--xh-fg-muted` | timestamp 的 root 部件 color 覆盖槽。 |
<!-- xh-component-tokens:end -->

### 动效

`color` 走 `transition` 过渡。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。
