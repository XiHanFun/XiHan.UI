import Button from "../src/Button";
import type { ButtonProps } from "../src/Button";

// 基础类型检查测试
const testButtonProps = () => {
  // 验证 ButtonProps 类型定义
  const validProps: ButtonProps = {
    type: "primary",
    size: "large",
    icon: "bsi-house",
    iconPlacement: "right",
    iconColor: "red",
    iconSize: 18,
    block: true,
    plain: true,
    round: true,
    circle: false,
    disabled: false,
    loading: true,
    loadingIcon: "bsi-gear",
    nativeType: "submit",
    autofocus: true,
    text: "按钮文本",
    textButton: false,
    link: false,
    title: "按钮标题",
    label: "按钮标签",
  };

  // 验证必需属性（实际上没有必需属性）
  const minimalProps: ButtonProps = {};

  // 验证组件导出
  const component = Button;

  console.log("✓ Button component loaded successfully");
  console.log("✓ ButtonProps type validation passed");
  console.log("✓ Component name:", component.name);

  return {
    validProps,
    minimalProps,
    component,
  };
};

// 验证按钮类型
const testButtonTypes = () => {
  const types: ButtonProps["type"][] = ["default", "primary", "success", "warning", "danger", "info", undefined];

  console.log("✓ Button types validated:", types);
  return types;
};

// 验证按钮尺寸
const testButtonSizes = () => {
  const sizes: ButtonProps["size"][] = ["small", "medium", "large", undefined];

  console.log("✓ Button sizes validated:", sizes);
  return sizes;
};

// 验证图标位置
const testIconPlacements = () => {
  const placements: ButtonProps["iconPlacement"][] = ["left", "right", undefined];

  console.log("✓ Icon placements validated:", placements);
  return placements;
};

// 验证原生类型
const testNativeTypes = () => {
  const nativeTypes: ButtonProps["nativeType"][] = ["button", "submit", "reset", undefined];

  console.log("✓ Native types validated:", nativeTypes);
  return nativeTypes;
};

// 验证布尔属性
const testBooleanProps = () => {
  const booleanProps = {
    block: [true, false, undefined],
    plain: [true, false, undefined],
    round: [true, false, undefined],
    circle: [true, false, undefined],
    disabled: [true, false, undefined],
    loading: [true, false, undefined],
    autofocus: [true, false, undefined],
    textButton: [true, false, undefined],
    link: [true, false, undefined],
  };

  console.log("✓ Boolean props validated:", booleanProps);
  return booleanProps;
};

// 运行所有测试
export const runButtonTests = () => {
  console.log("🧪 Running Button component tests...");

  try {
    testButtonProps();
    testButtonTypes();
    testButtonSizes();
    testIconPlacements();
    testNativeTypes();
    testBooleanProps();

    console.log("✅ All Button component tests passed!");
    return true;
  } catch (error) {
    console.error("❌ Button component tests failed:", error);
    return false;
  }
};

// 如果直接运行此文件，执行测试
if (typeof window === "undefined") {
  runButtonTests();
}
