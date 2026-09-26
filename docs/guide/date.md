# 日期与时间

`@xihan-ui/core/date` 提供不带时区的日期值、公历运算、时区换算、按地区划分的周与格式化。日期族的 8 个组件（日期字段、时间字段、日期选择器、日期范围选择器、日历选择器、日历范围选择器、时间选择器、时间范围选择器）都建立在它之上。自研实现，零运行时依赖，整个子入口压缩后 6.52 kB。

命名、取值范围与越界规则沿用 Temporal：`PlainDate` / `PlainTime` / `PlainDateTime` 与 `Temporal.PlainDate` 等同名同义，运行环境普遍提供 Temporal 之后，调用点可以逐个换成原生对象。

## 存在的原因

组件对外的值一律是 ISO 串（`2026-09-26`、`14:05`、`2026-09-26T14:05`）。把串换成可运算的值时，以下细节写错一处，症状就是边界日期错位：

- 月份加减要夹住日号。1 月 31 日加一个月是 2 月 28 日（闰年 29 日），不是 3 月 3 日。
- `Date` 表示时刻而不是日期。以 `Date` 做日期运算时，运行环境所在的时区隐式参与，跨越夏令时的那一天会多出或少掉一小时；`Date.UTC` 还会把 0–99 年映射到 1900 年代。
- 一周从星期几开始由地区决定：美国、日本从星期日开始，中国、欧洲多数国家从星期一开始，埃及从星期六开始。月历的首列与行数都随之变化。
- ISO 周固定从星期一开始，跨年的那一周归星期四所在的年：2027-01-01 属于 2026 年的第 53 周。
- 墙上时间在某些时区里不唯一：夏令时开始时有一段时间不存在，结束时有一段时间出现两次，换成时刻前必须决定取哪一刻。

## 用法

```ts
import { PlainDate, today } from "@xihan-ui/core/date";

PlainDate.from("2026-01-31").add({ months: 1 }).toString(); // '2026-02-28'
today("Asia/Shanghai").toString(); // 上海此刻的日期
```

组件内部已经接入，日常使用不涉及这一层。需要在组件之外计算日期（快捷预设、查询参数、min / max）时直接使用。

## 值类型

| 类型 | 字段 | 字符串形态 |
| --- | --- | --- |
| `PlainDate` | `year` `month` `day` | `YYYY-MM-DD`；0–9999 以外的年份写成 `±YYYYYY-MM-DD` |
| `PlainTime` | `hour` `minute` `second` `millisecond` | `HH`、`HH:mm`、`HH:mm:ss`、`HH:mm:ss.SSS`，可带前缀 `T` |
| `PlainDateTime` | 以上全部 | `YYYY-MM-DD`（时间取 00:00）或 `YYYY-MM-DDTHH[:mm[:ss[.SSS]]]`，分隔符可以是 `T` 或空格 |

三种值都不可变，实例冻结，所有运算返回新值。月份从 1 起算，星期几按 ISO 8601 编号：1 = 星期一 … 7 = 星期日。日期范围与 Temporal 相同：-271821-04-19 至 +275760-09-13。

字符串解析是严格的：`2026-02-29`、`2026-1-1`、带时区偏移的串（`...Z`、`...+08:00`）都抛 `RangeError`。组件内部把解析失败当作「没有值」处理，不会抛给使用者。

### 构造与越界

构造函数只接受合法字段，越界抛 `RangeError`。`from(fields)` 与 `with(fields)` 缺省把越界的字段夹到最近的合法值，传 `{ overflow: 'reject' }` 改为抛错：

```ts
import { PlainDate } from "@xihan-ui/core/date";

PlainDate.from({ year: 2026, month: 2, day: 31 }).toString(); // '2026-02-28'
PlainDate.from("2026-01-31").with({ month: 2 }).toString(); // '2026-02-28'
PlainDate.from({ year: 2026, month: 2, day: 31 }, { overflow: "reject" }); // RangeError
```

### 运算

| 方法 | 说明 |
| --- | --- |
| `add(duration)` / `subtract(duration)` | 先加年月并夹住日号，再加周与日。`PlainDateTime` 先加时间部分、满一天进位，再按同样规则加日期部分。`PlainTime` 跨过午夜时绕回 |
| `with(fields)` | 换掉部分字段 |
| `until(other, { largestUnit })` / `since(other, ...)` | 两者之差，`since` 是 `until` 的相反数。`largestUnit` 缺省为天；取月或年时，月数取「不越过终点」的最大值，起点加上结果恰好落在终点 |
| `round({ smallestUnit, roundingIncrement, roundingMode })` | `PlainTime` 与 `PlainDateTime` 按单位与步长取整。步长须整除上一级单位，例如按 15 分钟取整；取整方式与 Temporal 相同的九种 |
| `compare(a, b)` / `equals(other)` | 先后比较与相等判断 |

值对象不能直接比大小或做算术：`a < b`、`a + 1` 会抛 `TypeError`，比较一律用 `compare`。`toString()` 与 `toJSON()` 输出 ISO 串，放进模板字符串与 `JSON.stringify` 都得到 ISO 串。

`PlainDate` 与 `PlainDateTime` 另有只读字段 `dayOfWeek`、`dayOfYear`、`weekOfYear`、`yearOfWeek`、`daysInMonth`、`daysInYear`、`inLeapYear`。其中 `weekOfYear` 与 `yearOfWeek` 按 ISO 周计算。

## 时区

值对象不带时区。与时刻互换时显式给出时区，不给时取运行环境所在的时区：

| 导出 | 说明 |
| --- | --- |
| `today(timeZone?)` / `now(timeZone?)` | 某个时区里的今天与此刻 |
| `PlainDate.fromDate(instant, timeZone?)` / `PlainDateTime.fromDate(...)` | 时刻（`Date` 或毫秒数）在某个时区里的日期与日期时间 |
| `plainDate.toDate(timeZone?)` | 这一天在某个时区里开始的时刻 |
| `plainDateTime.toDate(timeZone?, { disambiguation })` | 墙上时间在某个时区里对应的时刻 |
| `getLocalTimeZone()` | 运行环境所在时区的 IANA 名 |
| `getTimeZoneOffset(instant, timeZone?)` | 该时刻的偏移量，毫秒，东正西负 |
| `isValidTimeZone(timeZone)` | 运行环境是否认得这个时区名 |

偏移量向 `Intl` 询问，库里不带时区数据库。墙上时间不唯一时按 `disambiguation` 取舍：

| 取值 | 夏令时跳过的时间 | 夏令时重复的时间 |
| --- | --- | --- |
| `compatible`（缺省） | 跳过之后的那一刻 | 较早的一次 |
| `earlier` | 跳过之前的那一刻 | 较早的一次 |
| `later` | 跳过之后的那一刻 | 较晚的一次 |
| `reject` | 抛 `RangeError` | 抛 `RangeError` |

零点被夏令时跳过的日子（例如智利），`plainDate.toDate()` 取当天第一个存在的时刻。

日期类组件的 `timeZone` prop 只决定「今天」是哪一天（聚焦日的兜底、今天的标记、快捷预设）与日期字段的 `valueAsDate`。格式化只由日期字段决定，与时区无关。

## 周与地区

```ts
import { getWeekInfo, PlainDate, startOfWeek, weeksInMonth } from "@xihan-ui/core/date";

getWeekInfo("en-US"); // { firstDay: 7, weekend: [6, 7] }
startOfWeek(PlainDate.from("2026-09-26"), "zh-CN").toString(); // '2026-09-21'
weeksInMonth(PlainDate.from("2026-08-01"), "en-US"); // 6
```

| 导出 | 说明 |
| --- | --- |
| `getWeekInfo(locale)` | 周首日与周末 |
| `startOfWeek(date, weekStart)` / `endOfWeek(date, weekStart)` | 所在那一周的第一天与最后一天 |
| `dayOfWeekIn(date, weekStart)` | 在那一周里排第几，0 即周首日 |
| `weeksInMonth(date, weekStart)` | 所在月份在月历上占几行（4–6） |
| `isWeekend(date, locale)` | 是否周末 |

`weekStart` 可以是 locale，也可以直接给出星期几（`1` 即 ISO 周的周一起算）。周规则取自 Unicode CLDR 48 的 weekData，按地区查表；只写语言时按语言推断地区（`zh` 按中国、`ar` 按埃及）。认 `-u-fw-`（`en-US-u-fw-mon`）、`-u-ca-iso8601`（周一起）与 `-u-rg-`（`en-US-u-rg-gbzzzz` 按英国）三种扩展。

不向 `Intl.Locale#getWeekInfo` 询问：各浏览器对它的支持与数据版本不一，同一个 locale 会排出不同的月历。

## 月、季度与年

| 导出 | 说明 |
| --- | --- |
| `startOfMonth` / `endOfMonth` | 月初与月末 |
| `startOfQuarter` / `endOfQuarter` / `quarterOf` | 季初、季末与第几季度 |
| `startOfYear` / `endOfYear` | 年初与年末 |
| `fromIsoWeek(yearOfWeek, week, dayOfWeek?)` | ISO 周年的第几周、星期几是哪一天 |
| `isoWeeksInYear(year)` | 一个 ISO 周年有 52 周还是 53 周 |
| `isLeapYear` / `daysInMonth` / `daysInYear` | 按年份与月份的公历常识 |

边界函数对 `PlainDateTime` 只挪日期，保留时间部分。

## 格式化

```ts
import { createDateFormatter, PlainDate } from "@xihan-ui/core/date";

const heading = createDateFormatter("zh-CN", { year: "numeric", month: "long" });
heading.format(PlainDate.from("2026-02-01")); // '2026年2月'
```

`createDateFormatter(locales, options)` 建一个可复用的格式化器，提供 `format`、`formatToParts`、`formatRange`、`formatRangeToParts` 与 `resolvedOptions`，参数同 `Intl.DateTimeFormat`，不含时区。值对象上的 `toLocaleString(locales, options)` 做同样的事。

值本身不带时区，格式化按字段原样呈现，结果与运行环境所在的时区无关。没有给任何日期或时间字段时，日期按年月日、时间按时分秒、日期时间两者都输出。`Intl.DateTimeFormat` 的构造开销较大，同一组参数只构造一次。

## 与 Temporal 的差异

| 方面 | 本模块 | Temporal |
| --- | --- | --- |
| 精度 | 毫秒 | 纳秒 |
| 历法 | 只有 ISO 8601 推及历 | 支持多种历法 |
| 字符串解析 | 只认上文列出的扩展格式，不收时区偏移与时区注记 | 另收基本格式、偏移与注记 |
| 带时区的值 | 与 `Date` 互换（`toDate` / `fromDate`） | `ZonedDateTime` |
| 时长 | 冻结的普通对象 | `Temporal.Duration` |
| 周与季度 | 另有按地区的周规则、季度与边界函数 | 无 |
