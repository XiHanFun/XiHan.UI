const e=`// 基础用法 | 选中值恒是数组，条目按 value 标识身份；禁用的条目方向键会跳过
import type { ReactNode } from "react";
import { XhSelectRoot } from "@xihan-ui/react";
import { useState } from "react";

const fruits = [
  { value: "apple", label: "苹果" },
  { value: "banana", label: "香蕉" },
  { value: "blueberry", label: "蓝莓" },
  { value: "cherry", label: "樱桃（缺货）", disabled: true },
  { value: "durian", label: "榴莲" },
];

export default function Demo(): ReactNode {
  const [fruit, setFruit] = useState<string[]>([]);

  return (
    <>
      <XhSelectRoot
        value={fruit}
        onValueChange={details => setFruit(details.value)}
        collection={fruits}
        label="水果"
        placeholder="请选择"
      />
      <p>
        当前值：
        {fruit.length ? fruit.join("、") : "（未选）"}
      </p>
    </>
  );
}
`;export{e as default};
