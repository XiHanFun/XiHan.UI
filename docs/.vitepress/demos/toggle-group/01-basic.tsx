// 基础用法 | 单选分段控件：root 是 radiogroup、条目是 radio；整组只占一个 Tab 位，进组后四个方向键都能走
import type { ReactNode } from "react";
import { XhToggleGroupRoot } from "@xihan-ui/react";

const aligns = [
  { value: "left", label: "左对齐" },
  { value: "center", label: "居中" },
  { value: "right", label: "右对齐" },
];

export default function Demo(): ReactNode {
  // 不传 value 即非受控，default-value 只给初值
  return <XhToggleGroupRoot collection={aligns} defaultValue="left" />;
}
