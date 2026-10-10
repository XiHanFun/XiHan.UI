---
'@xihan-ui/core': minor
---

`trackListMotion` 新增 `exiting` 选项：条目被删时已经在播自己的退场、或已经播完（例如通知卡片的 dismissing / unmounted），返回 `true` 就不放离场替身。自己带退场的条目播完常与宿主删节点落在同一次渲染里，还没来得及藏起就被删了，不认这一位会再放一个替身重播一遍。
