---
"@xihan-ui/headless": minor
---

`carousel` 的划动收进多指会话：`carousel.connect.ts` 里的 `setPointerCapture` 与 `onPointerMove` / `onPointerUp` / `onPointerCancel` 三个处理器一并撤掉，连接层只报落点。至此 M0 记的两处指针捕获遗留清空。

跟手改挂在文档上：手划出轨道、划出窗口都跟得住，系统收走指针也会收尾——原先靠捕获，这两种情形的表现随浏览器而异。

会话常驻整个生命周期，不按拖动状态挂卸。常驻的代价是拖动之外几个早退的 `pointermove`，换来的是状态树一行都不用改：拆卸时机由根级效应给，不必为了"有地方拆"去加拖动子状态。

只交第一根手指进会话——轮播是单指划动，已经在划的时候第二根落下不算数。
