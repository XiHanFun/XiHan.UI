---
'@xihan-ui/headless': major
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
'@xihan-ui/web-components': minor
---

Timestamp 相对时间自动刷新、支持时区与全部语言，也认将来时态：

- 相对型不给 `now` 时自动刷新：文字只在跨过分钟、小时、天的边界时才变，就只在那一刻刷新；页面隐藏或元素离开视口时暂停，回来时立即补一次。新增 `refreshInterval`（毫秒）改成固定间隔，给 0 不刷新；它是停留时长，不受减弱动效影响。
- 新增 `timeZone`（IANA 时区名）：按那个时区的墙钟显示，`datetime` 带上该时区的偏移量；不带偏移量的 `value` 串也按这个时区解读，认不出的时区落 `invalid`。
- 用词与缺省日期写法改由 `Intl.RelativeTimeFormat` / `Intl.DateTimeFormat` 按 `locale` 给出，任何语言都可用。显示文本随之变化：英文 datetime 为 `08/11/2026, 09:30:05`，中文日期为 `2026/08/11`、相对说法为 `30分钟前`，一分钟以内为该语言的「现在」（`now` / `现在`）。
- 相对说法认将来的时刻（`in 5 minutes` / `5分钟后`），离现在三十天及以上才退回绝对日期。
- `TimestampTranslations` 新增 `justNow`，可换掉一分钟以内的说法；组件新增 `translations` prop，全局配置的 timestamp 文案随之生效。

破坏性变化（headless）：Timestamp 改由状态机驱动，新增 `timestampMachine`；`connectTimestamp` 的第一个参数由 props 对象改为 `service`（`createService(timestampMachine, …)`），与其余组件同形。`formatRelativeTime` 的 `locale` 参数改为必填并新增可选的 `justNow`，将来的时刻不再返回 `undefined`；`toTimeDate`、`formatTimePattern`、`timestampMachineStamp` 各新增一个可选的 `timeZone` 参数。
