---
'@xihan-ui/headless': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
'@xihan-ui/web-components': minor
---

NumberAnimation 的文字改由 `Intl.NumberFormat` 铺出：新增 `locale`（未提供时跟随宿主语言，宿主也没有时按 en-US）决定小数点、分组习惯与数字系统，新增 `formatOptions` 交给 Intl 铺货币、百分比、单位与紧凑记数（`useGrouping` 打开即按该语言的习惯分组）。小数位仍归 `precision`，`separator` 仍是分组符，给了即分组。宿主语言不是英语时，缺省小数点随语言变化（如 de-DE 显示 `1234,5`）。`formatNumberAnimation` 新增第 4 个可选参数 `{ locale, options }`，缺省 en-US，原有三参数调用结果不变。
