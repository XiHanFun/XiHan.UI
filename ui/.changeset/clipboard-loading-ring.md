---
'@xihan-ui/headless': minor
'@xihan-ui/styles': minor
---

Clipboard 复制钮的写入在途改接加载环家族配方：连接层投影 `data-xh-loading-ring="overlay"`，环压在钮正中、直径取钮的图标档，画法与 Spinner 环档一致（一整圈轨道 + 粗环，此前是 1em、1px、无轨道的小环）。进入在途等一个 `micro` 才起淡，钮里的文字与字形随前景同刻淡出留位；退出在途不再硬切，按 `micro` 交叉淡回。`--xh-clipboard-loading-duration` 照旧控制转速。加载环配方新增私有槽 `--xh-_loading-ring-duration`，供承载者把自己的时长槽接进来。
