---
'@xihan-ui/core': minor
---

新增 `createPortalLease`、`PortalLease` 与 `PortalLeaseOptions`，把物理 Portal 的多 root 搬迁、
同 Document 目标校验、独占无盒壳、既有视觉桥、初始化回滚、占位精确归位、幂等释放和多异常
聚合收敛到 Core。适配器可通过 `onShellReady` 在 root 搬迁前挂接组件特有逻辑所有权，并在
roots 全部归位后清理；不新增 Web Components 的 `portalContainer` 公开 API，也不改变视觉环境轴。
