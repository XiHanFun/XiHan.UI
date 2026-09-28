---
'@xihan-ui/headless': minor
'@xihan-ui/styles': patch
---

Layout 侧栏的首帧与跨过断点的开合直接落位：侧栏与遮罩投影 `data-instant`，挂载时就窄于断点的覆盖档侧栏不再先闪出展开面板、再播一段收起退场；视口跨过断点这类环境引起的宽度档与开合变化同样不走过渡。落位之后标记撤下，用户按把手、点遮罩、Escape 与 API 的开合照常过渡。
