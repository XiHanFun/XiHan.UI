---
"@xihan-ui/styles": patch
---

修：区间选择器的浮层恒亮、糊在视口左上角、怎么点都关不掉。

多面板那一版给 `content` 加了条 `:has(> calendar + calendar)` 的横排规则。它与上面那条
`[data-part='content'][hidden] { display: none }` 特指度相同（都是 0-3-0），却排在它后面，
于是收起态被它掀开：浮层一直显示，又因为定位引擎只在展开时跑、坐标恒为 0，就糊在视口左上角。
只有区间那一个示例中招——它是唯一摆了两张日历的。

选择器补上 `:not([hidden])`，与顺序、特指度都无关了。

同时新增门禁 `check-hidden-override`：某个 part 已经有 `[hidden]` 兜底，其后又有规则把
display 改回非 none 且没带 `[hidden]` / `:not([hidden])` 的，一律拦下。
拿这次的坏规则反向验证过：去掉 `:not([hidden])` 当场报错并指到行号。
全仓 109 份皮肤 · 314 条兜底扫下来，此前只有这一处。
