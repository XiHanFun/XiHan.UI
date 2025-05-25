import Icon from "../src/Icon";
import type { IconProps } from "../src/Icon";

// 基础类型检查测试
const testIconProps = () => {
  // 验证 IconProps 类型定义
  const validProps: IconProps = {
    name: "test-icon",
    size: 24,
    color: "red",
    title: "Test Icon",
    scale: 1.2,
    animation: "spin",
    flip: "horizontal",
    speed: "fast",
    label: "Test Label",
    hover: true,
    inverse: false,
  };

  // 验证必需属性
  const minimalProps: IconProps = {
    name: "test-icon",
  };

  // 验证组件导出
  const component = Icon;

  console.log("✓ Icon component loaded successfully");
  console.log("✓ IconProps type validation passed");
  console.log("✓ Component name:", component.name);

  return {
    validProps,
    minimalProps,
    component,
  };
};

// 验证动画类型
const testAnimationTypes = () => {
  const animations: IconProps["animation"][] = [
    "spin",
    "spin-pulse",
    "wrench",
    "ring",
    "pulse",
    "flash",
    "float",
    undefined,
  ];

  console.log("✓ Animation types validated:", animations);
  return animations;
};

// 验证翻转类型
const testFlipTypes = () => {
  const flips: IconProps["flip"][] = ["horizontal", "vertical", "both", undefined];

  console.log("✓ Flip types validated:", flips);
  return flips;
};

// 验证速度类型
const testSpeedTypes = () => {
  const speeds: IconProps["speed"][] = ["fast", "slow", undefined];

  console.log("✓ Speed types validated:", speeds);
  return speeds;
};

// 运行所有测试
export const runIconTests = () => {
  console.log("🧪 Running Icon component tests...");

  try {
    testIconProps();
    testAnimationTypes();
    testFlipTypes();
    testSpeedTypes();

    console.log("✅ All Icon component tests passed!");
    return true;
  } catch (error) {
    console.error("❌ Icon component tests failed:", error);
    return false;
  }
};

// 如果直接运行此文件，执行测试
if (typeof window === "undefined") {
  runIconTests();
}
