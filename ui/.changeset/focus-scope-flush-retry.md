---
"@xihan-ui/core": minor
"@xihan-ui/headless": patch
---

**焦点域挂载聚焦：宿主提交 DOM 后先补试一次，不再只等下一帧。**

`createFocusScope` 新增可选的 `flush`（取机器的 flush）。各家「渲染」与「机器效应」的先后不同：Vue / React 先渲染出带 tabindex 的部件再跑效应，建域那一刻同步聚焦即落定；Web Components 行为宿主先把机器 mount 起来才有属性可写，建域时容器还没接线、`initialFocus` 也还是 null，此前只能等 rAF 重试，`defaultOpen` 的浮层在挂载那一拍焦点仍在 body。现在宿主提交之后立刻补试一次，挂载帧里的焦点落点与先渲染后跑效应的框架一致；逐帧 rAF 重试仍作兜底。浮层壳（overlay-shell）与 popover / dialog / drawer / command / image-viewer / tour 的焦点域都交了 flush。
