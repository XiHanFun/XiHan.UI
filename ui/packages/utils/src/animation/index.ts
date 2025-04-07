/**
 * 动画与交互工具集
 * 提供丰富的动画效果和过渡控制功能
 */

export * from "./easing";
export * from "./transition";
export * from "./spring";
export * from "./svg";
export * from "./scroll";

import easing from "./easing";
import transition from "./transition";
import spring from "./spring";
import svg from "./svg";
import scroll from "./scroll";

// 默认导出命名空间对象
export const animation = {
  easing,
  transition,
  spring,
  svg,
  scroll,
};

// 默认导出命名空间对象
export default animation;
