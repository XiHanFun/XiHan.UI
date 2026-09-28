---
"@xihan-ui/viz": minor
---

新增两条大数据子路径：`@xihan-ui/viz/columns` 与 `@xihan-ui/viz/canvas`，支撑几十万到百万点的行情与采集数据。

- `createColumnStore({ fields, capacity, columns })`：列式数据仓。每个字段一列 `Float64Array`，缺失写 `NaN`，日期取时间值；`append` / `appendColumns` / `setLast`（改写正在形成的那一行）/ `shift` / `clear`，一次调用只通知一次订阅者。`capacity` 是行数上限：追加超出时从头部挤掉最旧的行，数据段追到尾整段挪回开头，列视图始终连续、零拷贝。只有最后一行可改写，按序号缓存的极值与合并对整块永久有效。数据仓是冻结对象，传进 Vue 的 props 不会被包成响应式代理。
- `bisectLeft` / `bisectRight` / `nearestIndex` / `isAscending`：有序数值列上的二分与校验。
- `createExtentIndex(source, low, high)`：分块（1024 行一块，按序号对齐）求区间极值，整块算一次缓存；100 万点首次全段约 1.3 ms，之后的区间查询约 8 µs。
- `decimateLine(x, y, from, to, pixel, { y2, gaps })`：M4 降采样，每个像素列保留首、末、最小、最大（带 `y2` 时再加它的最小与最大），画出来与全量逐像素相同、尖峰不丢；缺失值写断点。100 万点 → 1000 px 约 6 ms。
- `bucketSize` / `bucketOhlc` / `bucketPeak`：K 线与柱窄到画不出实体时按 2 的幂根一组合并（K 线开取首、收取末、高取最高、低取最低；柱取绝对值最大的一根），组边界按全局序号对齐，平移时画面不抖。
- `thinPoints`：散点按像素格稀疏，每格留最上面的点，输出仍按数据次序；100 万点约 6.5 ms。`createPointIndex`：像素网格上的最近点查询。
- `ordinalTimeTicks`：等距排列（跳过休市、周末）的时间轴刻度，仍落在整点、整天、月初这些边界之后的第一根上。
- `tracePolyline` / `traceBand`：类型化数组上的像素坐标写成折线、面积与区间带（NaN 断开，含三种阶梯），写进 `PathSink`，Canvas 2D 上下文可直接传入。
- `parseCssColor` / `mixCssColor` / `formatCssColor` / `formatSrgbColor` / `createColorRamp`：按 CSS `color-mix` 的规则（alpha 预乘、oklch 色相走较短的弧、无色相的一端取另一端的色相）解析与插值计算样式里的颜色，结果写回原空间的函数式；画布不认某种写法时 `formatSrgbColor` 按浏览器在 sRGB 屏上的画法逐通道截断。
- 两条子路径不从包入口导出，各自计体积：columns 实测 4.8 kB（限额 5.3 kB），canvas 2.55 kB（限额 2.8 kB）。
