---
'@xihan-ui/core': major
---

`hideOutside` 现在严格使用 Scope 所属 Window 的 MutationObserver，并能在 iframe、画中画窗口与 adopted 节点场景下重算后挂的 inert 豁免节点。

跨 Document 的 target、离线 Document、缺少 MutationObserver 的宿主与观察器初始化失败现在都会明确抛错；初始化失败不会留下 inert 状态或层栈订阅。
