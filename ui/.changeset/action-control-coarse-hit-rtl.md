---
'@xihan-ui/styles': patch
---

Action Control 家族在 `(pointer: coarse)` 下扩热区的 `::after`，以及 DownloadTrigger / Sortable 皮肤复制到 `::before` 的同一套几何，rtl 下热区中心不再偏出宿主一个盒宽。起点 `inset-inline-start: 50%` 是逻辑属性、`translate: -50%` 是物理通道：rtl 下起点落在右半边、再往左挪半个盒，按钮 / 勾选框 / 开关 / 下载钮 / 排序把手本体在触屏上完全摸不着。现在 `:dir(rtl)` 下行内分量掉头（`translate: 50% -50%`），皮肤把平移钉回 `translate: none` 的字形规则特指度更高，不受影响。
