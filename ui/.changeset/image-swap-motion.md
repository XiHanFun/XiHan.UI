---
'@xihan-ui/core': minor
'@xihan-ui/headless': patch
'@xihan-ui/styles': patch
---

**新增** `markGhost` 从包主入口导出：替身的公共标记（摘掉整棵子树上的 id、表单名与 `data-xh-part`，标上 `inert`、`aria-hidden` 与 `data-xh-ghost`），列表离场、密集展开收起与换图共用。

**修复** 头像与图片换图时硬切：换了 `src`、新图还在载入时，旧图的替身原样盖在原处（src 取上一回载好的那一张，不取宿主此刻写进 DOM 的新地址）；新图载好或载入失败那一刻替身淡出、播完即移除，与新图的淡入交叉，中间不露一拍底色或回退内容。图片部件带上 `id` 供机器找到它。

`avatar.css` 体积基线从 2024 字节升到 2408 字节、`image.css` 从 2334 字节升到 2716 字节（去注释压空白后）：两份各涨在旧图替身的定位规则与它的退场规则。
