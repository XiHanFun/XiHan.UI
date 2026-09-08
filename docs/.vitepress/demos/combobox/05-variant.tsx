// 形态 | variant 只改输入行的底色与描边用法，取值、过滤与键盘行为都不变
import type { ReactNode } from "react";
import { XhComboboxRoot } from "@xihan-ui/react";

const variants = ["outline", "subtle", "ghost"] as const;

const fruits = [
  { value: "apple", label: "苹果" },
  { value: "banana", label: "香蕉" },
  { value: "cherry", label: "樱桃" },
];

export default function Demo(): ReactNode {
  return (
    <div style={{ display: "grid", gap: "16px", justifyItems: "start" }}>
      {variants.map(v => (
        <XhComboboxRoot
          key={v}
          variant={v}
          collection={fruits}
          clearable
          label={v}
          openOnClick
          placeholder="选择水果"
          style={{ width: "240px" }}
        />
      ))}
    </div>
  );
}
