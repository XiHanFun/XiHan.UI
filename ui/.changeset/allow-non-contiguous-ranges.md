---
'@xihan-ui/headless': major
'@xihan-ui/vue': major
'@xihan-ui/react': major
'@xihan-ui/web-components': major
---

**破坏性** CalendarRangePicker 与 DateRangePicker 的「区间可以跨过不可选的日子」从 `allowsNonContiguousRanges` 改叫 `allowNonContiguousRanges`：全库需要宾语的能力开关都写成 `allowX`（`allowCustomValue`、`allowOverflow`、`allowRowDrop`），只有这一处多了个 s。

| 旧名 | 新名 |
| --- | --- |
| `allowsNonContiguousRanges`（WC attribute `allows-non-contiguous-ranges`） | `allowNonContiguousRanges`（Vue 模板与 WC attribute `allow-non-contiguous-ranges`） |
