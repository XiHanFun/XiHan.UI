---
'@xihan-ui/headless': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
'@xihan-ui/web-components': minor
---

**新增** 数字字段的声明式格式化 `formatOptions` 与 `locale`：选项原样交给 `Intl.NumberFormat`（分组、货币、百分比、单位、紧凑记数），与统计数值的同名选项同一口径，`locale` 不写时取全局配置的语言，再没有按宿主语言。输入框失焦时显示格式化文字，聚焦编辑时换回可编辑的原值；值、`onValueChange` 与表单提交始终是原值，读屏经 `aria-valuetext` 念格式化文字。给了 `formatOptions` 时 `name` 从输入框挪到新增的 `hidden-input` 部件（Vue / React 为 `XhNumberFieldHiddenInput`），提交的是原值；不写结构时组件自己铺这份表单出口。选项不合法时当场报错。Web Components 的 `formatOptions` 只能经 property 设置。

**新增** 数字字段的 `precision`：提交时保留几位小数，步进、取端点与失焦写回的值按十进制四舍五入（一半时远离零）并补齐，非受控初值同样按它写一遍，用户正在输入时不动；夹进 [0, 20]，不给时不取整。与 `format` 同在时先取整再交给 `format`；`formatOptions` 没写小数位时显示的位数跟它走。连接层 API 新增 `displayValue`（Web Components 元素上同名只读属性）与 `getHiddenInputProps`。
