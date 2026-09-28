---
'@xihan-ui/styles': patch
---

ScrollArea `fade` 变体滚到头时，那一侧的遮罩带沿 micro 过渡收起、离开端点时淡回，不再在到端那一帧瞬间消失。四条带宽经 `@property` 登记成长度才能过渡；不认 `@property` 的引擎照旧按端点收放、没有过渡。
