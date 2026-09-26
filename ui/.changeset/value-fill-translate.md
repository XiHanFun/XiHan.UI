---
'@xihan-ui/headless': major
'@xihan-ui/styles': minor
---

值类填充不再改变尺寸。Progress 线形的填充铺满轨道，按比例往行首平移、由轨道裁掉，进度变化只走合成，不重排也不重绘；不定进度改为固定宽度的一段平移往复。range 不再由连接层写内联 `inline-size`，改写私有槽 `--xh-_progress-value`（0–1 的比例），自带整套皮肤的使用方改为读这个槽。

LoadingBar 的进度段同样铺满轨道、按比例平移，末端亮边随之落在露出的前端；range 改写私有槽 `--xh-_loading-bar-value`。减弱动效下作者写进 `--xh-loading-bar-speed` / `--xh-loading-bar-fade` 的时长不作数、退回令牌：平移立刻到位，收尾的淡出保留减弱档的 120ms。

FileUpload 的传输进度条按同一方式推进，填充不再改宽度。

Toast 与 Notification 的倒计时条不再缩宽度，改为裁切从行尾往行首收起（共享关键帧 `xh-countdown` 随之改写），RTL 下从左往右收；减弱动效下按秒分段走，段数由连接层写进私有槽 `--xh-_toast-progress-steps` / `--xh-_notification-progress-steps`。

`loading-bar` 皮肤因补上 RTL 下的反向平移与减弱动效两段时长规则，体积由 1989 涨到 2377 字节（去注释压空白后），单份体积基线随之重落。
