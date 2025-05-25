// === Button 样式系统统一入口 ===

// 传统样式类名（向后兼容）
export { legacyButtonClasses, legacyButtonSelectors } from "./legacy-styles";

// 简化版 CSS-in-JS 样式（推荐使用）
export { buttonStyles, useButtonStyles } from "./simple-styles";

// 高级版 CSS-in-JS 样式（暂时注释，等待类型问题修复）
// export {
//   buttonStyles as advancedButtonStyles,
//   useButtonStyles as useAdvancedButtonStyles,
// } from "./css-in-js";
