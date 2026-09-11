---
'@xihan-ui/core': major
'@xihan-ui/headless': patch
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
---

`trackHoverIntent` 的触发器从误导性的动态 `getTriggerEl` 改为必填 `trigger` 创建快照。跟踪器固定使用该元素所属的 Document 与 Window，严格校验动态 content、计时参数与活动 realm，并在 content 换代、重复安全三角和重复清理时完整释放旧资源。

Menu 与 SideNav 在各自 effect 的 DOM flush 中解析 trigger；无渲染器或该次提交没有节点时，该 effect 明确保持未绑定。SideNav 后续悬停会话会重新建立状态 effect，Menu 调用方则必须在启动服务前接好锚点引用。

Vue 与 React 的 `useHoverIntent` 继续接受 nullable trigger getter，并新增各自公开的 `UseHoverIntentOptions`。包装会在 DOM 提交后绑定，随 trigger 与计时参数重建；Vue 的 content getter 和意图回调读取当前响应式选项，React 读取最近一次已提交选项。
