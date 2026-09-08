// 尺寸 | 盒与浮层条目一起换档，不传 size 即默认档
import type { ReactNode } from "react";
import { XhSelectRoot } from "@xihan-ui/react";

// 中间一档不写 size，用 undefined 表达
const sizes = [
  { size: "sm", label: "小" },
  { size: undefined, label: "默认" },
  { size: "lg", label: "大" },
] as const;
const fruits = [
  { value: "apple", label: "苹果" },
  { value: "banana", label: "香蕉" },
  { value: "cherry", label: "樱桃" },
];

export default function Demo(): ReactNode {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-end", gap: "16px" }}>
      {sizes.map(s => (
        <XhSelectRoot
          key={s.label}
          size={s.size}
          collection={fruits}
          defaultValue={["apple"]}
          label={s.label}
          placeholder="请选择"
        />
      ))}
    </div>
  );
}
