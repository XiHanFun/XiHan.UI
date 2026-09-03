// 属性名 / 事件名常量。

// —— 公共样式接口 ——
export const DATA_SCOPE = 'data-scope' // 组件名，如 dialog
export const DATA_PART = 'data-part' // 部件名，如 content

// —— core 自用的内部标记（不作为公共样式接口）——
export const DATA_FOCUS_GUARD = 'data-xh-focus-guard'
/** 带此属性的元素及其后代不被 hideOutside 施加 inert，其祖先只递归不整块罩住。 */
export const DATA_INERT_EXEMPT = 'data-xh-inert-exempt'

// —— 结构落点 ——
/** body 末尾单一 portal 落点的 id。 */
export const PORTAL_ROOT_ID = 'xh-portal-root'

// —— 内部 CustomEvent 名 ——
export const EV_ESCAPE_KEY_DOWN = 'xh.dismiss.escapeKeyDown'
export const EV_POINTER_DOWN_OUTSIDE = 'xh.dismiss.pointerDownOutside'
export const EV_FOCUS_OUTSIDE = 'xh.dismiss.focusOutside'
export const EV_INTERACT_OUTSIDE = 'xh.dismiss.interactOutside'
export const EV_MOUNT_AUTO_FOCUS = 'xh.focusScope.mountAutoFocus'
export const EV_UNMOUNT_AUTO_FOCUS = 'xh.focusScope.unmountAutoFocus'
