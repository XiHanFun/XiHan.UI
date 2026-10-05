来源：https://ui.docs.xihanfun.com/components/timestamp

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

```vue
<script setup lang="ts">
import { XhTimestamp } from "@xihan-ui/vue";

// 三种写法都收：只写年月日的串按本地零点解读，不会掉到前一天去
const iso = "2026-08-11T09:30:05";
const dateOnly = "2026-08-11";
const stamp = new Date(2026, 7, 11, 9, 30, 5).getTime();
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 8px">
    <XhTimestamp :value="iso" />
    <XhTimestamp :value="dateOnly" />
    <XhTimestamp :value="stamp" />
    <XhTimestamp :value="new Date(2026, 7, 11, 9, 30, 5)" />
  </div>
</template>
```

```html
<div style="display: flex; flex-direction: column; gap: 8px">
  <!-- 三种写法都收：只写年月日的串按本地零点解读，不会掉到前一天去 -->
  <xh-timestamp value="2026-08-11T09:30:05">
    <time data-xh-part="root"></time>
  </xh-timestamp>

  <xh-timestamp value="2026-08-11">
    <time data-xh-part="root"></time>
  </xh-timestamp>

  <xh-timestamp id="time-basic-stamp">
    <time data-xh-part="root"></time>
  </xh-timestamp>

  <xh-timestamp id="time-basic-date">
    <time data-xh-part="root"></time>
  </xh-timestamp>
</div>

<script type="module">
  // 时间戳与 Date 只能走 property：属性里的一串数字与年份写法分不开
  const moment = new Date(2026, 7, 11, 9, 30, 5);
  document.getElementById("time-basic-stamp").value = moment.getTime();
  document.getElementById("time-basic-date").value = moment;
</script>
```

## 组件结构

加粗的是必需部件。

`data-scope="timestamp"`：**`root`**

## 示例

### 呈现方式

date 只到日、datetime 到秒、relative 表述为几分钟前等相对说法；datetime 属性的精度随之变化

```vue
<script setup lang="ts">
import { XhTimestamp } from "@xihan-ui/vue";

const value = "2026-08-11T09:30:05";
// 参照时刻写死，示例的产出才不随打开页面的时间变
const now = "2026-08-11T12:00:00";

const types = ["date", "datetime", "relative"] as const;
</script>

<template>
  <div style="display: grid; grid-template-columns: auto auto; gap: 8px 24px; justify-content: start">
    <template v-for="type in types" :key="type">
      <code>{{ type }}</code>
      <XhTimestamp :value="value" :type="type" :now="now" />
    </template>
  </div>
</template>
```

```html
<!-- 参照时刻写死，示例的产出才不随打开页面的时间变 -->
<div
  style="
    display: grid;
    grid-template-columns: auto auto;
    gap: 8px 24px;
    justify-content: start;
  "
>
  <code>date</code>
  <xh-timestamp value="2026-08-11T09:30:05" type="date" now="2026-08-11T12:00:00">
    <time data-xh-part="root"></time>
  </xh-timestamp>

  <code>datetime</code>
  <xh-timestamp value="2026-08-11T09:30:05" type="datetime" now="2026-08-11T12:00:00">
    <time data-xh-part="root"></time>
  </xh-timestamp>

  <code>relative</code>
  <xh-timestamp value="2026-08-11T09:30:05" type="relative" now="2026-08-11T12:00:00">
    <time data-xh-part="root"></time>
  </xh-timestamp>
</div>
```

### 自定义格式串

记号是 YYYY / YY / MM / M / DD / D / HH / H / mm / m / ss / s，只改变看到的文本，datetime 不随之变化

```vue
<script setup lang="ts">
import { XhTimestamp } from "@xihan-ui/vue";

const value = "2026-08-05T09:03:07";

// 两位记号补零，一位记号不补；记号之外的字符原样留着
const patterns = [
  "YYYY-MM-DD HH:mm:ss",
  "YYYY 年 M 月 D 日",
  "M/D H:mm",
  "YY.MM.DD",
];
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 8px">
    <div v-for="pattern in patterns" :key="pattern">
      <code style="margin-inline-end: 12px">{{ pattern }}</code>
      <XhTimestamp :value="value" :format="pattern" />
    </div>
  </div>
</template>
```

```html
<!-- 两位记号补零，一位记号不补；记号之外的字符原样留着 -->
<div style="display: flex; flex-direction: column; gap: 8px">
  <div>
    <code style="margin-inline-end: 12px">YYYY-MM-DD HH:mm:ss</code>
    <xh-timestamp value="2026-08-05T09:03:07" format="YYYY-MM-DD HH:mm:ss">
      <time data-xh-part="root"></time>
    </xh-timestamp>
  </div>

  <div>
    <code style="margin-inline-end: 12px">YYYY 年 M 月 D 日</code>
    <xh-timestamp value="2026-08-05T09:03:07" format="YYYY 年 M 月 D 日">
      <time data-xh-part="root"></time>
    </xh-timestamp>
  </div>

  <div>
    <code style="margin-inline-end: 12px">M/D H:mm</code>
    <xh-timestamp value="2026-08-05T09:03:07" format="M/D H:mm">
      <time data-xh-part="root"></time>
    </xh-timestamp>
  </div>

  <div>
    <code style="margin-inline-end: 12px">YY.MM.DD</code>
    <xh-timestamp value="2026-08-05T09:03:07" format="YY.MM.DD">
      <time data-xh-part="root"></time>
    </xh-timestamp>
  </div>
</div>
```

### 相对时间

一分钟以内是「现在」，其余按分、时、天取整，过去说「几分钟前」、将来说「几分钟后」，离现在三十天及以上退回绝对日期；用词由 Intl 按 locale 给出，未提供时跟随浏览器语言

```vue
<script setup lang="ts">
import { XhTimestamp } from "@xihan-ui/vue";

// 参照时刻给定后产出完全确定，不给则取当前时刻
const now = "2026-08-11T12:00:00";

const moments = [
  "2026-08-11T11:59:40",
  "2026-08-11T11:30:00",
  "2026-08-11T09:00:00",
  "2026-08-09T12:00:00",
  // 将来的时刻
  "2026-08-11T12:30:00",
  // 超过三十天，没有档位可用，改报绝对日期
  "2026-01-01T00:00:00",
];
</script>

<template>
  <div style="display: grid; grid-template-columns: auto auto; gap: 8px 24px; justify-content: start">
    <template v-for="moment in moments" :key="moment">
      <XhTimestamp :value="moment" type="relative" :now="now" locale="en-US" />
      <XhTimestamp :value="moment" type="relative" :now="now" locale="zh-CN" />
    </template>
  </div>
</template>
```

```html
<!-- 参照时刻给定后产出完全确定，不给则取当前时刻 -->
<div
  style="
    display: grid;
    grid-template-columns: auto auto;
    gap: 8px 24px;
    justify-content: start;
  "
>
  <xh-timestamp
    value="2026-08-11T11:59:40"
    type="relative"
    now="2026-08-11T12:00:00"
    locale="en-US"
  >
    <time data-xh-part="root"></time>
  </xh-timestamp>
  <xh-timestamp
    value="2026-08-11T11:59:40"
    type="relative"
    now="2026-08-11T12:00:00"
    locale="zh-CN"
  >
    <time data-xh-part="root"></time>
  </xh-timestamp>

  <xh-timestamp
    value="2026-08-11T11:30:00"
    type="relative"
    now="2026-08-11T12:00:00"
    locale="en-US"
  >
    <time data-xh-part="root"></time>
  </xh-timestamp>
  <xh-timestamp
    value="2026-08-11T11:30:00"
    type="relative"
    now="2026-08-11T12:00:00"
    locale="zh-CN"
  >
    <time data-xh-part="root"></time>
  </xh-timestamp>

  <xh-timestamp
    value="2026-08-11T09:00:00"
    type="relative"
    now="2026-08-11T12:00:00"
    locale="en-US"
  >
    <time data-xh-part="root"></time>
  </xh-timestamp>
  <xh-timestamp
    value="2026-08-11T09:00:00"
    type="relative"
    now="2026-08-11T12:00:00"
    locale="zh-CN"
  >
    <time data-xh-part="root"></time>
  </xh-timestamp>

  <xh-timestamp
    value="2026-08-09T12:00:00"
    type="relative"
    now="2026-08-11T12:00:00"
    locale="en-US"
  >
    <time data-xh-part="root"></time>
  </xh-timestamp>
  <xh-timestamp
    value="2026-08-09T12:00:00"
    type="relative"
    now="2026-08-11T12:00:00"
    locale="zh-CN"
  >
    <time data-xh-part="root"></time>
  </xh-timestamp>

  <!-- 将来的时刻 -->
  <xh-timestamp
    value="2026-08-11T12:30:00"
    type="relative"
    now="2026-08-11T12:00:00"
    locale="en-US"
  >
    <time data-xh-part="root"></time>
  </xh-timestamp>
  <xh-timestamp
    value="2026-08-11T12:30:00"
    type="relative"
    now="2026-08-11T12:00:00"
    locale="zh-CN"
  >
    <time data-xh-part="root"></time>
  </xh-timestamp>

  <!-- 超过三十天，没有档位可用，改报绝对日期 -->
  <xh-timestamp
    value="2026-01-01T00:00:00"
    type="relative"
    now="2026-08-11T12:00:00"
    locale="en-US"
  >
    <time data-xh-part="root"></time>
  </xh-timestamp>
  <xh-timestamp
    value="2026-01-01T00:00:00"
    type="relative"
    now="2026-08-11T12:00:00"
    locale="zh-CN"
  >
    <time data-xh-part="root"></time>
  </xh-timestamp>
</div>
```

### 自动刷新

相对型不给 now 时自己刷新：文字只在跨过分钟、小时、天的边界时才变，就只在那一刻刷新；页面隐藏或离开视口时暂停，回来时立即补一次

```vue
<script setup lang="ts">
import { XhTimestamp } from "@xihan-ui/vue";

// 打开页面的那一刻，与两分钟之后的一个日程
const openedAt = Date.now();
const meetingAt = openedAt + 2 * 60 * 1000 + 5 * 1000;
</script>

<template>
  <div style="display: grid; grid-template-columns: auto auto; gap: 8px 24px; justify-content: start">
    <span>打开本页</span>
    <XhTimestamp :value="openedAt" type="relative" />
    <span>下一场会议</span>
    <XhTimestamp :value="meetingAt" type="relative" />
  </div>
</template>
```

```html
<div
  style="
    display: grid;
    grid-template-columns: auto auto;
    gap: 8px 24px;
    justify-content: start;
  "
>
  <span>打开本页</span>
  <xh-timestamp id="timestamp-live-opened" type="relative">
    <time data-xh-part="root"></time>
  </xh-timestamp>
  <span>下一场会议</span>
  <xh-timestamp id="timestamp-live-meeting" type="relative">
    <time data-xh-part="root"></time>
  </xh-timestamp>
</div>

<script type="module">
  // 数字时间戳只能经 property 赋值：打开页面的那一刻，与两分钟之后的一个日程
  const openedAt = Date.now();
  document.getElementById("timestamp-live-opened").value = openedAt;
  document.getElementById("timestamp-live-meeting").value = openedAt + 2 * 60 * 1000 + 5 * 1000;
</script>
```

### 时区

time-zone 给了 IANA 时区名就按那个时区的墙钟显示，datetime 带上该时区的偏移量；不带偏移量的 value 串也按这个时区解读

```vue
<script setup lang="ts">
import { XhTimestamp } from "@xihan-ui/vue";

// 同一个时刻：带 Z 的串是确切时刻，与时区无关
const launch = "2026-08-11T01:30:00Z";

const zones = [
  { label: "上海", timeZone: "Asia/Shanghai" },
  { label: "伦敦", timeZone: "Europe/London" },
  { label: "纽约", timeZone: "America/New_York" },
];
</script>

<template>
  <div style="display: grid; grid-template-columns: auto auto; gap: 8px 24px; justify-content: start">
    <template v-for="zone in zones" :key="zone.timeZone">
      <span>{{ zone.label }}</span>
      <XhTimestamp :value="launch" :time-zone="zone.timeZone" locale="zh-CN" />
    </template>
  </div>
</template>
```

```html
<!-- 同一个时刻：带 Z 的串是确切时刻，与时区无关 -->
<div
  style="
    display: grid;
    grid-template-columns: auto auto;
    gap: 8px 24px;
    justify-content: start;
  "
>
  <span>上海</span>
  <xh-timestamp value="2026-08-11T01:30:00Z" time-zone="Asia/Shanghai" locale="zh-CN">
    <time data-xh-part="root"></time>
  </xh-timestamp>
  <span>伦敦</span>
  <xh-timestamp value="2026-08-11T01:30:00Z" time-zone="Europe/London" locale="zh-CN">
    <time data-xh-part="root"></time>
  </xh-timestamp>
  <span>纽约</span>
  <xh-timestamp value="2026-08-11T01:30:00Z" time-zone="America/New_York" locale="zh-CN">
    <time data-xh-part="root"></time>
  </xh-timestamp>
</div>
```

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

`@xihan-ui/styles/timestamp.css` 按 `[data-scope="timestamp"][data-part="root"]` 部件选择器书写，发布产物以挂载类 `.xh-scope-timestamp` 代替其中的 data-scope（特异性相同），位于 `xihan.components` 层。覆盖样式使用 `xihan.overrides`，部件选择器照常可用。

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
