---
'@xihan-ui/core': patch
---

FormResetBridge 改用跨 realm 的原生 HTMLElement 品牌与 `form` 节点名识别 reset 目标。iframe 表单和从其他 Window adopt 的表单现在会正确重置组件，普通元素派发的同名事件仍被忽略。
