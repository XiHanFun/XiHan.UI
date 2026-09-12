---
'@xihan-ui/web-components': major
---

将 Command 的视口浮层物理搬迁到当前运行时的 Portal 容器。

模态 Command 以同一枚 Core Portal 租约搬迁 backdrop 与面板根；非模态 Command 仅搬迁面板，
不会激活作者 backdrop。租约覆盖真实退场并在关闭、卸载或跨 Document 重连时精确归位。
