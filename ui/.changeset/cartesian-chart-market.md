---
"@xihan-ui/viz": minor
"@xihan-ui/headless": minor
"@xihan-ui/vue": minor
"@xihan-ui/react": minor
"@xihan-ui/web-components": minor
---

直角坐标图补齐行情看板要用的写法，大数据的几条主路径进了性能预算。

- 坐标轴新增 `minSize`（px）：这根轴至少占这么厚，上下叠放的 K 线与成交量写同一个值，绘图区左边对齐；不是非负有限数时报 `chart.scale-param`。viz 的 `layoutAxis` / `solvePlotRect` 对应新增 `minThickness`。
- 修正：缩放窗口整段落在自变量轴之外（数据还没到、窗口指着已经挤掉的时段）时不再抛错，自变量轴按整条画；viz 的 `domainToWindow` 这时落成贴着那一端的零宽窗口。
- 刻度格式器按比例尺只建一次，viz 的 `createTimeFormat` 按语言与时区复用、UTC 不再经 Intl 拆字段：时间轴的一次布局快了一个量级，流式每帧与缩放一帧的耗时随之下降。
- 列式数据的缩放条缩略线改为按列取最低与最高的一遍扫描。
