// 形态 | outline、subtle 和 ghost
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
