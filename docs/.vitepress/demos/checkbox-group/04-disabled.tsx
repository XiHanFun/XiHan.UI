// 禁用与只读 | 禁用项不可操作，只读项仍可聚焦
import type { ReactNode } from "react";
import { XhCheckboxGroupRoot } from "@xihan-ui/react";

const items = [
  { value: "cheese", label: "芝士" },
  { value: "bacon", label: "培根" },
];

// 单项禁用写在数据里，条目部件上不必再声明一遍
const partly = [
  { value: "cheese", label: "芝士" },
  { value: "truffle", label: "松露", disabled: true },
];

export default function Demo(): ReactNode {
  return (
    <>
      <XhCheckboxGroupRoot defaultValue={["cheese"]} collection={items} label="整组禁用" disabled />

      <XhCheckboxGroupRoot defaultValue={["cheese"]} collection={items} label="整组只读" readOnly />

      <XhCheckboxGroupRoot defaultValue={["cheese"]} collection={partly} label="单项禁用" />
    </>
  );
}
