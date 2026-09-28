---
'@xihan-ui/headless': minor
'@xihan-ui/styles': major
---

DownloadTrigger 的取数在途改接加载环家族配方：连接层投影 `data-xh-loading-ring="overlay"`，环压在钮正中、直径取钮的图标档，画法与 Spinner 环档一致（此前是 1em、1px、无轨道的小环）。进入在途等一个 `micro` 才起淡，钮里的文字与兜底下载字形随前景同刻淡出留位；退出在途不再硬切，按 `micro` 交叉淡回。`--xh-download-trigger-loading-duration` 照旧控制转速。破坏性：移除关键帧 `xh-download-trigger-content-hide`（文字的隐去改由过渡承担）。
