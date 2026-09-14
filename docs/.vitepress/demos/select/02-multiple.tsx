// 多选 | 选择多个值
import type { ReactNode } from "react";
import { XhSelectRoot } from "@xihan-ui/react";
import { useState } from "react";

const fruits = [
  { value: "apple", label: "苹果" },
  { value: "banana", label: "香蕉" },
  { value: "blueberry", label: "蓝莓" },
  { value: "durian", label: "榴莲" },
];

export default function Demo(): ReactNode {
  const [picked, setPicked] = useState<string[]>(["apple"]);

  return (
    <>
      <XhSelectRoot
        value={picked}
        onValueChange={details => setPicked(details.value)}
        collection={fruits}
        multiple
        label="水果（多选）"
        placeholder="请选择"
      />
      <p>
        已选：
        {picked.length ? picked.join("、") : "（无）"}
      </p>
    </>
  );
}
