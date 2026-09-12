---
'@xihan-ui/core': patch
---

DOM 类型守卫改为使用节点所属窗口的构造器，`createScope` 现在能正确识别 iframe 中的 Document、Window、Element、HTMLElement 与 ShadowRoot，不再静默回落到主文档。
