// 视觉隐藏但保留在布局与表单里的内联样式，与皮肤 .xh-visually-hidden 的声明逐条同值。
// 不用 display:none：原生校验提示需要一个可定位的框。

/** 隐藏输入 / 活动区域的内联样式：1px 盒绝对定位、裁掉、文本不换行。 */
export const VISUALLY_HIDDEN_STYLE = {
  position: 'absolute',
  inlineSize: '1px',
  blockSize: '1px',
  padding: '0',
  margin: '-1px',
  overflow: 'hidden',
  clipPath: 'inset(50%)',
  whiteSpace: 'nowrap',
  border: '0',
} as const
