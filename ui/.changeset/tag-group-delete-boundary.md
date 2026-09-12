---
'@xihan-ui/headless': patch
'@xihan-ui/vue': patch
'@xihan-ui/react': patch
'@xihan-ui/web-components': patch
---

TagGroup 现在把标签本体的选择与摘除钮的删除严格分成两个点击边界。摘除钮会先停止 click 向标签行冒泡，再执行 Tag 的删除逻辑；single/multiple 模式下删除已选项只发一次移除后的 `value-change` 与一次 `item-delete`，不会把待删值重新选回。
