// core 内部与外部唯一的属性名/事件名真源。
// 本仓约定：标识类魔法字符串集中为 const，不得内联。

// —— 公共样式接口（也是运行时 DOM 查询协议）——
export const DATA_SCOPE = 'data-scope' // 组件名，如 dialog
export const DATA_PART = 'data-part' // 部件名，如 content
export const DATA_STATE = 'data-state' // open | closed | checked | indeterminate …
export const DATA_DISABLED = 'data-disabled'
export const DATA_ORIENTATION = 'data-orientation'
export const DATA_HIGHLIGHTED = 'data-highlighted'
export const DATA_SIDE = 'data-side'
export const DATA_ALIGN = 'data-align'

// —— core 自用的内部标记（不作为公共样式接口）——
export const DATA_LAYER = 'data-xh-layer'
export const DATA_LAYER_BRANCH = 'data-xh-layer-branch'
export const DATA_COLLECTION_ITEM = 'data-xh-collection-item'
export const DATA_FOCUS_GUARD = 'data-xh-focus-guard'
export const DATA_SCROLL_SHARD = 'data-xh-scroll-shard'
/** 逃生舱：带此属性的 body 直接子元素永不被 hideOutside 施加 inert。 */
export const DATA_INERT_EXEMPT = 'data-xh-inert-exempt'

// —— 内部 CustomEvent 名（behavior 实现侧也必须从这里 import，不得字面量）——
export const EV_ESCAPE_KEY_DOWN = 'xh.dismiss.escapeKeyDown'
export const EV_POINTER_DOWN_OUTSIDE = 'xh.dismiss.pointerDownOutside'
export const EV_FOCUS_OUTSIDE = 'xh.dismiss.focusOutside'
export const EV_INTERACT_OUTSIDE = 'xh.dismiss.interactOutside'
export const EV_MOUNT_AUTO_FOCUS = 'xh.focusScope.mountAutoFocus'
export const EV_UNMOUNT_AUTO_FOCUS = 'xh.focusScope.unmountAutoFocus'
