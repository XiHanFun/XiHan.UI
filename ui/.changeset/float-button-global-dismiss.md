---
'@xihan-ui/headless': minor
'@xihan-ui/react': minor
'@xihan-ui/vue': minor
'@xihan-ui/web-components': minor
'@xihan-ui/styles': patch
---

为 FloatButton 建立专用 Headless 状态机与逻辑浮层生命周期。click/hover 展开后由同一
Document 的 LayerRegistry 仲裁层外 pointerdown 和全局 Escape，后开的 Drawer/Popover
优先消解，Toast 反馈通道不占可消解父层；关闭、禁用写回与卸载均精确释放资源。

受控实例的交互只派发 open-change 意图，父级写回前不改可见 DOM；hover 模式的层外
pointer/focus 由同一次 pointerleave 收口，disabled watch 每次变更只派一次意图。三端适配器仅桥接 RuntimeConfig、
LayerRegistry 登记函数与根节点引用。
