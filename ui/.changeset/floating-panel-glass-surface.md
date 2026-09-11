---
"@xihan-ui/styles": minor
---

**FloatingPanel 默认皮肤迁移到 M3 浮动玻璃配方。**

内容面、标题栏、边缘、顶边高光与投影现在统一消费 `material.glass`；原有 `--xh-floating-panel-*` 覆盖槽仍优先。标题栏的形态和关闭按钮在键盘聚焦时先落到 `material.glass.focus-surface` 的实体隔离底，避免透入宿主背景后看不清焦点环。高对比、减少透明、强制色和打印不再由组件另开分支，而是由 M3 令牌原位改为可读的实体表面。
