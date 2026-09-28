---
'@xihan-ui/headless': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
'@xihan-ui/web-components': minor
'@xihan-ui/styles': minor
---

Avatar 载入改为交叉淡变：图片载好时回退内容浮在图片之上原地淡出、与图片的淡入同时进行，播完才藏起，中间不再露一拍底色。新增 `fallbackDelay`（毫秒，默认 `AVATAR_FALLBACK_DELAY` = 300）：载入中回退内容等过这段才露面，图片在这段里载好就直接出图，缓存命中与虚拟列表回收行时不再闪首字母；没有 src 或载入失败时回退内容立即露面。回退节点带上 scope 派生的 id；Web Components 的显隐改照连接层的 `hidden`。
