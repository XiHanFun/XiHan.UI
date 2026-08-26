---
"@xihan-ui/styles": patch
---

日历的「大步翻」两颗钮不再被无条件收掉，« » 与 ‹ › 同一副长相。

四条规则的选择器列表里，限定只跟在后两条上：`[data-part='prev-year-trigger'], [data-part='prev-trigger'][hidden], [data-part='next-year-trigger'], [data-part='next-trigger'][hidden]` —— 年那两颗是裸的，于是无条件命中 `display: none`，翻年的钮从来就没画出来过。行为层一直是通的（`canGoPrevYear` / `stepYear` / `getPrevYearTriggerProps` 都在），只是看不见也点不着。

同样的漏写还在悬停、禁用、聚焦环三条上：那三条把月钮的状态样式无条件加在了年钮身上。四条一并补齐限定。

新增 `tests/browser/calendar-nav-skin.spec.ts` 钉住：四颗翻页钮都画得出来、同一副尺寸，打上 `hidden` 才收起，禁用态四颗同一副长相。这类「被一条 display 悄悄收掉」只有在真实浏览器里按级联算才验得出来。
