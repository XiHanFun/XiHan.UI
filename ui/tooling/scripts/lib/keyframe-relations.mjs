// 共享关键帧与关系组的登记：弹层只有一组（overlay，锚定与无锚定同一套进出场，设计真源 §9.5），
// 另有淡入淡出（fade）、披露（disclosure）、列表条目（list）、面板（sheet）、整幅滑入（slide）、
// 循环（loop）、数值（value）、交互光（light）与数据（data）。共享关键帧只定义在 family/motion.css，皮肤 @import 它。
//
// 两张门禁读同一份：check-keyframe-registry.mjs 把 relation 写进登记表并要求「relation 非空
// 的名字只定义在 family/motion.css、family/motion.css 里没有表外的名字」；check-motion-role.mjs
// 按组件的锚定关系核它 animation 引用的共享关键帧是否对得上。

/** 共享关键帧的唯一真源。 */
export const MOTION_FAMILY = 'family/motion.css'

/** 关键帧名 → 锚定关系。 */
export const SHARED_RELATION = Object.freeze({
  'xh-overlay-pop-in': 'overlay',
  'xh-pop-out': 'overlay',
  // 页内浮现的小件与标签行的列表加入，弹层不引
  'xh-pop-in': 'list',
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
  'xh-glint': 'light',
  'xh-draw': 'data',
})

export const RELATIONS = Object.freeze(['overlay', 'fade', 'disclosure', 'list', 'sheet', 'slide', 'loop', 'value', 'light', 'data'])

/**
 * 弹层许用的进出场关键帧（表）。锚定关系只决定有没有位移（方向槽写不写），不再分组。
 * fade 与 disclosure 不表达锚定关系，任何组件都可引。
 */
export const RELATION_KEYFRAMES = Object.freeze({
  overlay: Object.freeze(['xh-overlay-pop-in', 'xh-pop-out']),
})

/** 组件 → 弹层关系，逐行照抄设计真源 §9.5 弹层那一行列的组件；没登记的组件不受关系判据管。 */
export const OVERLAY_RELATION = Object.freeze({
  'menu': 'overlay',
  'select': 'overlay',
  'combobox': 'overlay',
  'cascader': 'overlay',
  'context-menu': 'overlay',
  'menubar': 'overlay',
  'mention': 'overlay',
  'tree-select': 'overlay',
  'date-picker': 'overlay',
  'date-range-picker': 'overlay',
  'time-picker': 'overlay',
  'time-range-picker': 'overlay',
  'tooltip': 'overlay',
  'color-picker': 'overlay',
  'side-nav': 'overlay',
  'pagination': 'overlay',
  'popover': 'overlay',
  'hover-card': 'overlay',
  'popconfirm': 'overlay',
  'tour': 'overlay',
  'command': 'overlay',
  'navigation-menu': 'overlay',
  'floating-panel': 'overlay',
  'float-button': 'overlay',
  'back-top': 'overlay',
  'log': 'overlay',
  'message-feed': 'overlay',
})
