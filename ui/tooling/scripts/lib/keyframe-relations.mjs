// 共享关键帧与关系组的登记：浮层按锚定关系分锚定列表 / 锚定面板 / 无锚定弹出三组，
// 另有淡入淡出（fade）、披露（disclosure）、列表条目（list）、面板（sheet）、整幅滑入（slide）、
// 循环（loop）与数值（value）。共享关键帧只定义在 family/motion.css，皮肤 @import 它。
//
// 两张门禁读同一份：check-keyframe-registry.mjs 把 relation 写进登记表并要求「relation 非空
// 的名字只定义在 family/motion.css、family/motion.css 里没有表外的名字」；check-motion-role.mjs
// 按组件的锚定关系核它 animation 引用的共享关键帧是否对得上。

/** 共享关键帧的唯一真源。 */
export const MOTION_FAMILY = 'family/motion.css'

/** 关键帧名 → 锚定关系。 */
export const SHARED_RELATION = Object.freeze({
  'xh-overlay-slide-in': 'anchored-list',
  'xh-overlay-slide-out': 'anchored-list',
  'xh-overlay-pop-in': 'anchored-panel',
  'xh-pop-out': 'anchored-panel',
  'xh-pop-in': 'detached',
  'xh-fade-in': 'fade',
  'xh-fade-out': 'fade',
  'xh-rise-in': 'fade',
  'xh-disclosure-expand': 'disclosure',
  'xh-disclosure-collapse': 'disclosure',
  'xh-drop-in': 'fade',
  'xh-item-in': 'list',
  'xh-sheet-in': 'sheet',
  'xh-sheet-out': 'sheet',
  'xh-slide-in': 'slide',
  'xh-slide-out': 'slide',
  'xh-slide-fade-in': 'slide',
  'xh-slide-fade-out': 'slide',
  'xh-spin': 'loop',
  'xh-shimmer': 'loop',
  'xh-breathe': 'loop',
  'xh-breathe-halo': 'loop',
  'xh-countdown': 'value',
})

export const RELATIONS = Object.freeze(['anchored-list', 'anchored-panel', 'detached', 'fade', 'disclosure', 'list', 'sheet', 'slide', 'loop', 'value'])

/**
 * 浮层的三种锚定关系各自许用的进出场关键帧（表）。
 * xh-pop-out 同时是锚定面板与无锚定弹出的退场；fade 与 disclosure 不表达锚定关系，任何组件都可引。
 */
export const RELATION_KEYFRAMES = Object.freeze({
  'anchored-list': Object.freeze(['xh-overlay-slide-in', 'xh-overlay-slide-out']),
  'anchored-panel': Object.freeze(['xh-overlay-pop-in', 'xh-pop-out']),
  'detached': Object.freeze(['xh-pop-in', 'xh-pop-out']),
})

/** 组件 → 锚定关系，逐行照抄锚定关系表的三行；没登记的组件不受关系判据管。 */
export const OVERLAY_RELATION = Object.freeze({
  'menu': 'anchored-list',
  'select': 'anchored-list',
  'combobox': 'anchored-list',
  'cascader': 'anchored-list',
  'context-menu': 'anchored-list',
  'menubar': 'anchored-list',
  'mention': 'anchored-list',
  'tree-select': 'anchored-list',
  'date-picker': 'anchored-list',
  'date-range-picker': 'anchored-list',
  'time-picker': 'anchored-list',
  'time-range-picker': 'anchored-list',
  'tooltip': 'anchored-list',
  'popover': 'anchored-panel',
  'hover-card': 'anchored-panel',
  'popconfirm': 'anchored-panel',
  'tour': 'anchored-panel',
  'command': 'anchored-panel',
  'navigation-menu': 'detached',
  'side-nav': 'detached',
  'floating-panel': 'detached',
  'float-button': 'detached',
  'pagination': 'detached',
})
