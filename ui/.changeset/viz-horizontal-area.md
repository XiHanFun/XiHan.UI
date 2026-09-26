---
'@xihan-ui/viz': minor
---

面积标记支持横向：`AreaMark` 新增 `orientation`（缺省 `vertical`），`horizontal` 时沿 y 铺开、以点上的 `x0` 为基线，供转置后的面积图使用。`KeyedPoint` 新增 `x0`，点序列插值与过渡的「从基线升起」同样按 `x0` 处理。
