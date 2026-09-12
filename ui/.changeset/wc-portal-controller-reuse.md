---
'@xihan-ui/web-components': patch
---

让 Dialog、Drawer、ImageViewer 与 Command 复用统一的 Web Components Portal 租约控制器。

组件只声明何时激活、视觉来源和需要搬迁的根；租约换代、目标校验、Core PortalLease 创建与
释放不再在四个适配器元素内分别维护，既有模态、contained、退场和精确归位语义保持不变。
