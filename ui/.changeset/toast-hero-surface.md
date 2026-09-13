---
'@xihan-ui/headless': major
'@xihan-ui/react': major
'@xihan-ui/vue': major
'@xihan-ui/web-components': major
'@xihan-ui/styles': major
---

Toast 新增必需的 `content` 文本列与可选 `description`，并将默认卡片改为中性浮层；语气只落到标题和状态图标。

全局服务默认落在底部，最多显示 3 条、间距 12px；默认停留与退场窗口分别改为 4000ms 和 300ms，关闭入口默认可用，全局服务在页面转入后台时自动暂停计时。

移除中部三种落位，只保留顶部与底部的六种边缘落位。
