const e=`// 基础用法 | 把颜色串画成一小块：颜色旁边写出串本身，看得见也读得出
import type { ReactNode } from "react";
import { XhColorSwatch } from "@xihan-ui/react";

const colors = ["#e11d48", "#f59e0b", "#10b981", "#3b82f6", "#8b5cf6"];

export default function Demo(): ReactNode {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
      {colors.map(color => (
        <span key={color} style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
          <XhColorSwatch value={color} />
          <code style={{ fontSize: "12px" }}>{color}</code>
        </span>
      ))}
    </div>
  );
}
`;export{e as default};
