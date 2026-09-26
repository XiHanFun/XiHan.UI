---
'@xihan-ui/headless': major
'@xihan-ui/styles': minor
---

值类填充不再改变尺寸。Progress 线形的填充铺满轨道，按比例往行首平移、由轨道裁掉，进度变化只走合成，不重排也不重绘；不定进度改为固定宽度的一段平移往复。range 不再由连接层写内联 `inline-size`，改写私有槽 `--xh-_progress-value`（0–1 的比例），自带整套皮肤的使用方改为读这个槽。
