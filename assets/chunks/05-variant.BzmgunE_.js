const n=`// 形态 | variant 只改盒的颜色槽位，浮层与键盘行为三档一致
import type { ReactNode } from "react";
import { XhSelectRoot } from "@xihan-ui/react";

const variants = ["outline", "subtle", "ghost"] as const;
const fruits = [
  { value: "apple", label: "苹果" },
  { value: "banana", label: "香蕉" },
  { value: "cherry", label: "樱桃" },
];

export default function Demo(): ReactNode {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "16px" }}>
      {variants.map(v => (
        <XhSelectRoot
          key={v}
          variant={v}
          collection={fruits}
          defaultValue={["apple"]}
          label={v}
          placeholder="请选择"
        />
      ))}
    </div>
  );
}
`;export{n as default};
