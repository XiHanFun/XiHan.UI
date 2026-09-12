// 禁用 | 根部件的 disabled 把触发器转成原生 disabled，浮层展不开、也不占 Tab 位
import type { ReactNode } from "react";
import { XhSelectRoot } from "@xihan-ui/react";

const fruits = [
  { value: "apple", label: "苹果" },
  { value: "banana", label: "香蕉" },
];

export default function Demo(): ReactNode {
  return (
    <XhSelectRoot
      collection={fruits}
      defaultValue={["apple"]}
      disabled
      label="水果"
      placeholder="请选择"
    />
  );
}
