// 禁用 | 单段禁用仍可聚焦、仍是方向键的起点，只是无法选中它；整组禁用则全部不可修改
import type { ReactNode } from "react";
import { XhSegmentedRoot } from "@xihan-ui/react";

const plans = [
  { value: "free", label: "免费版" },
  { value: "pro", label: "专业版" },
  { value: "enterprise", label: "企业版", disabled: true },
];

export default function Demo(): ReactNode {
  return (
    <div style={{ display: "flex", gap: "24px", flexWrap: "wrap" }}>
      <XhSegmentedRoot
        collection={plans}
        defaultValue="free"
        aria-label="套餐"
      />
      <XhSegmentedRoot
        collection={plans}
        disabled
        defaultValue="pro"
        aria-label="套餐（整组禁用）"
      />
    </div>
  );
}
