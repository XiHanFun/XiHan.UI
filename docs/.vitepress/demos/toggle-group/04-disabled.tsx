// 禁用 | 禁用单个选项
import type { ReactNode } from "react";
import { XhToggleGroupRoot } from "@xihan-ui/react";

const aligns = [
  { value: "left", label: "左对齐" },
  { value: "center", label: "居中", disabled: true },
  { value: "right", label: "右对齐" },
];

export default function Demo(): ReactNode {
  return <XhToggleGroupRoot collection={aligns} defaultValue="center" />;
}
