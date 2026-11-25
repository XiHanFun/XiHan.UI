---
'@xihan-ui/headless': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
'@xihan-ui/web-components': minor
'@xihan-ui/styles': minor
---

**新增** 加载指示器的遮罩形态：`overlay` 包住一块内容，等待时在内容上盖一层承载面色的遮罩、转圈居中（缺省竖排），内容报 `aria-busy`，遮罩露面后点不到也聚焦不到；`fullscreen` 让遮罩盖满视口，层级与模态层相同。新增 `loading`（缺省为真）：改成 false 时转圈藏起、遮罩撤下，改回 true 时重新计 `delay`，请求在 `delay` 之前回来遮罩就不出现。

- 解剖新增 `container`、`content`、`mask` 三个部件，只在遮罩形态下出现；Vue / React 的 `XhSpinner` 打上 `overlay` 后自己铺出这副结构，写了 `label` 时转圈下方显示这段文案；Web Components 由作者在 Light DOM 里写出同一副结构。
- 覆盖槽：`--xh-spinner-mask-bg`、`--xh-spinner-mask-p`、`--xh-spinner-layer`。
