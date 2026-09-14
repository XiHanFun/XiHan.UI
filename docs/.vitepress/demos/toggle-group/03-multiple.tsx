// 多选 | 同时选择多个格式
import type { ReactNode } from "react";
import { XhToggleGroupRoot } from "@xihan-ui/react";

const formats = [
  { value: "bold", label: "B" },
  { value: "italic", label: "I" },
  { value: "underline", label: "U" },
];

export default function Demo(): ReactNode {
  return <XhToggleGroupRoot collection={formats} defaultValue={["bold"]} multiple />;
}
