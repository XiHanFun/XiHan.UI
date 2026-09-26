---
'@xihan-ui/headless': minor
'@xihan-ui/styles': minor
---

MessageFeed 首屏的历史消息不再逐条入场：条目到达的追踪接上之前 list 投影 `data-instant`（服务端渲染的首屏同样生效），接上时已在的消息各自带上 `data-instant` 直接呈现；之后新到的一批消息播进场，同一批按到达顺序错开（`--xh-_stagger-index`），不按它排在第几条。
