---
'@xihan-ui/headless': minor
'@xihan-ui/styles': minor
---

Accordion 首帧不播开合：挂载时已经展开或收起的条目，内容与箭头投影 `data-instant`，直接呈现，不再在页面载入时播一遍展开 / 收起动画（收起项此前会闪过一段内容收起）；某一项第一次开合（用户操作或受控值改写）起撤掉标记，按动效走。
