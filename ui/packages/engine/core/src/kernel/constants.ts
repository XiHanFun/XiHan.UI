/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 属性名 / 事件名常量。

// —— 公共样式接口 ——
export const DATA_SCOPE = 'data-scope' // 组件名，如 dialog
export const DATA_PART = 'data-part' // 部件名，如 content

/**
 * 皮肤的挂载类前缀：每个角色节点另带 `xh-scope-<组件名>`，与 data-scope 一一对应。
 * 皮肤产物以它领头（与属性选择器同为 (0,1,0)，层叠不变）：浏览器按类名给规则分桶，
 * 而属性选择器只按属性名分桶——几千条皮肤规则都以 [data-scope] 领头时，
 * 每个带 data-scope 的节点每次样式重算都要逐条试一遍。
 */
export const SCOPE_CLASS_PREFIX = 'xh-scope-'

/** 组件名对应的挂载类，如 dialog → xh-scope-dialog。 */
export function scopeClass(scope: string): string {
  return SCOPE_CLASS_PREFIX + scope
}

/**
 * 去掉 class 串里的挂载类，其余词原样保留。asChild 把部件属性合进自带解剖的子节点时用：
 * data-scope 让位给子节点自己的，挂载类也得一起让位，否则一个节点会同时吃两个组件的皮肤。
 */
export function stripScopeClass(value: string): string {
  return value.split(/\s+/).filter(token => token && !token.startsWith(SCOPE_CLASS_PREFIX)).join(' ')
}

// —— core 自用的内部标记（不作为公共样式接口）——
export const DATA_FOCUS_GUARD = 'data-xh-focus-guard'
/**
 * 带此属性的元素及其后代不被 hideOutside 藏起（不打 aria-hidden），其祖先只递归不整块罩住。
 * 属性名沿用早先打 inert 时的叫法，语义仍是「不随模态背景一起失活」。
 */
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
