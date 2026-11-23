// 限定多选数量 | max-selected=2：选满后其余选项不可再选，点掉一个即腾出名额
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
        maxSelected={2}
        label="水果（最多两种）"
        placeholder="请选择"
      />
      <p data-demo-output>
        已选
        {" "}
        {picked.length}
        {" "}
        / 2：
        {picked.length ? picked.join("、") : "（无）"}
      </p>
    </>
  );
}
