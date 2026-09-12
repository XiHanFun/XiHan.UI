const e=`// 尺寸 | 不传 size 即默认档；行高、内边距与字号一起换档，浮层里的候选也跟着变
import type { ReactNode } from "react";
import { XhComboboxRoot } from "@xihan-ui/react";

const sizes = [
  { size: "sm", label: "sm" },
  { size: undefined, label: "默认" },
  { size: "lg", label: "lg" },
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
        <XhComboboxRoot
          key={s.label}
          size={s.size}
          collection={fruits}
          clearable
          label={s.label}
          openOnClick
          placeholder="选择水果"
          style={{ width: "200px" }}
        />
      ))}
    </div>
  );
}
`;export{e as default};
