---
'@xihan-ui/headless': minor
'@xihan-ui/styles': minor
---

ToolCall 与 Reasoning 首帧不播开合：挂载时已经展开或收起（含在跑时自动展开）的内容与箭头投影 `data-instant`，直接呈现；挂载后第一次开合（用户操作、自动开合、程序化或受控改写）起才按动效走。Reasoning 的标签与时长在「想完」那一下的整句替换淡入，也只在挂载后真的想完时播，首帧就已想完的直接呈现。
