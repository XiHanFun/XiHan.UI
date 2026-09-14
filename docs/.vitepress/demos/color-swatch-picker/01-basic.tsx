// 基础用法 | 交一组颜色数据就自动铺开；每格是一颗 radio，方向键在格子间移动并选中
import type { ReactNode } from "react";
import { XhColorSwatchPickerRoot } from "@xihan-ui/react";
import { useState } from "react";

const swatches = [
  { value: "#e11d48", label: "玫红" },
  { value: "#f59e0b", label: "琥珀" },
  { value: "#10b981", label: "翠绿" },
  { value: "#3b82f6", label: "天蓝" },
  { value: "#8b5cf6", label: "紫罗兰" },
  { value: "#64748b", label: "石板灰" },
];

export default function Demo(): ReactNode {
  const [value, setValue] = useState<string | null>("#3b82f6");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      <XhColorSwatchPickerRoot
        value={value}
        onValueChange={details => setValue(details.value)}
        swatches={swatches}
        label="主题色"
        name="theme"
      />
      <span style={{ fontSize: "13px" }}>
        当前：
        <code>{value ?? "（未选）"}</code>
      </span>
    </div>
  );
}
