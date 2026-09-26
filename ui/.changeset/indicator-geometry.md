---
'@xihan-ui/headless': major
'@xihan-ui/styles': minor
---

滑动指示器改量排布位、位置交给 transform。Segmented 的滑块沿 offsetParent 链量选中段相对根的位置，祖先带缩放（对话框进场）时不再跟着缩小偏位；段或根变尺寸、段增减、字体加载完成都会重量。皮肤以 `transform: translate()` 摆放滑块、只走合成，RTL 下由 `:dir(rtl)` 翻转位移。随之删除导出 `resolveSegmentedIndicator` 与类型 `SegmentedBox`，量测改用内部的共用几何。

Tabs 的指示条同样改量排布位、位置交给 transform，与标签带平移的 translate 叠加而不互相覆盖；方向缺省从标签带现读，整页 RTL 而没传 `dir` 时不再落错。
