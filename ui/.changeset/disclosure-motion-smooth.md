---
'@xihan-ui/tokens': minor
'@xihan-ui/styles': minor
'@xihan-ui/headless': patch
'@xihan-ui/vue': patch
'@xihan-ui/react': patch
'@xihan-ui/web-components': patch
---

**修复** 手风琴、折叠区域、Reasoning、ToolCall 的开合动画。行高现在真的从 0 长到全开：`0fr` 的下限是 `auto`，正文是文本节点时行轨道被内容撑住，之前整段动画只有内缩在动、文字第一帧就全部露出。内容区的 `hidden` 改跟退场走、播完才落：宿主有 `[hidden]{display:none!important}`（Tailwind 4 的 preflight 就是这条）时，收起之前一帧都播不出来。React 手风琴第一次开合不再因为 `data-instant` 晚一拍撤而跳过动画。开合现在带淡变，正文与箭头同时长、同曲线，新增令牌 `--xh-motion-ease-disclosure`（缓起缓停，展开与收起同用）。`--xh-motion-duration-collapse` 由 150ms 改为 200ms，与展开等长：单开切换时一收一展的总高度一路单调，下方内容不再先过冲再弹回；Alert 关闭后的收拢、引用预览与代码折叠用的是同一支，随之变为 200ms。
