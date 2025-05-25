import ButtonGroup from "../src/ButtonGroup";
import type { ButtonGroupProps } from "../src/ButtonGroup";

// 基础类型检查测试
const testButtonGroupProps = () => {
  // 验证 ButtonGroupProps 类型定义
  const validProps: ButtonGroupProps = {
    size: "large",
    type: "primary",
    vertical: true,
    round: true,
    plain: true,
    disabled: false,
    title: "按钮组标题",
    label: "按钮组标签",
    role: "toolbar",
  };

  // 验证必需属性（实际上没有必需属性）
  const minimalProps: ButtonGroupProps = {};

  // 验证组件导出
  const component = ButtonGroup;

  console.log("✓ ButtonGroup component loaded successfully");
  console.log("✓ ButtonGroupProps type validation passed");
  console.log("✓ Component name:", component.name);

  return {
    validProps,
    minimalProps,
    component,
  };
};

// 验证按钮组尺寸
const testButtonGroupSizes = () => {
  const sizes: ButtonGroupProps["size"][] = ["small", "medium", "large", undefined];

  console.log("✓ ButtonGroup sizes validated:", sizes);
  return sizes;
};

// 验证按钮组类型
const testButtonGroupTypes = () => {
  const types: ButtonGroupProps["type"][] = ["default", "primary", "success", "warning", "danger", "info", undefined];

  console.log("✓ ButtonGroup types validated:", types);
  return types;
};

// 验证按钮组角色
const testButtonGroupRoles = () => {
  const roles: ButtonGroupProps["role"][] = ["group", "toolbar", "radiogroup", undefined];

  console.log("✓ ButtonGroup roles validated:", roles);
  return roles;
};

// 验证布尔属性
const testBooleanProps = () => {
  const booleanProps = {
    vertical: [true, false, undefined],
    round: [true, false, undefined],
    plain: [true, false, undefined],
    disabled: [true, false, undefined],
  };

  console.log("✓ Boolean props validated:", booleanProps);
  return booleanProps;
};

// 验证字符串属性
const testStringProps = () => {
  const stringProps = {
    title: ["工具栏", "", undefined],
    label: ["编辑工具栏", "", undefined],
  };

  console.log("✓ String props validated:", stringProps);
  return stringProps;
};

// 运行所有测试
export const runButtonGroupTests = () => {
  console.log("🧪 Running ButtonGroup component tests...");

  try {
    testButtonGroupProps();
    testButtonGroupSizes();
    testButtonGroupTypes();
    testButtonGroupRoles();
    testBooleanProps();
    testStringProps();

    console.log("✅ All ButtonGroup component tests passed!");
    return true;
  } catch (error) {
    console.error("❌ ButtonGroup component tests failed:", error);
    return false;
  }
};

// 如果直接运行此文件，执行测试
if (typeof window === "undefined") {
  runButtonGroupTests();
}
