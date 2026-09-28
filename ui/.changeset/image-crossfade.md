---
'@xihan-ui/headless': minor
'@xihan-ui/web-components': minor
'@xihan-ui/styles': minor
---

Image 载入改为交叉淡变：占位层（模糊小图、骨架）在图片载好或失败时原地淡出，图片在它底下直接落位，模糊小图的揭开不再被打断、中间不露一拍底色；没有占位层时图片照旧自己淡入。回退内容在图片载好时浮到图片之上淡出，播完才藏起。占位层与回退节点带上 scope 派生的 id；Web Components 的显隐改照连接层的 `hidden`。
