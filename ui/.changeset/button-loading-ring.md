---
'@xihan-ui/headless': minor
'@xihan-ui/styles': minor
---

Button 在途改为与 Clipboard、DownloadTrigger 同一种做法：`indicator` 不再常驻占位（静止时标签左侧不再空一格），而是居中压在钮上、钮宽不变；部件空着时由加载环家族配方画一枚环（连接层投影 `data-xh-loading-ring="overlay"` 与 `data-loading`）。进入在途要等一个 `micro` 才起淡，标签、前后缀同刻淡出留位，不到一个 `micro` 就结束的短请求什么都不闪；退出在途不等，环与内容按 `micro` 交叉淡回。作者往 `indicator` 里放了自己的图形时环让位，作者图形按同一节拍淡入淡出并转。示例改用空的 `indicator`。
