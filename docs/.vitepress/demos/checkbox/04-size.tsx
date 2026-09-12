// 尺寸 | size 同时缩放方框与勾选标记，不写就是缺省档
import type { ReactNode } from "react";
import { XhCheckbox } from "@xihan-ui/react";

export default function Demo(): ReactNode {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
      <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
        <XhCheckbox size="sm" defaultChecked />
        <span>小</span>
      </span>
      <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
        <XhCheckbox defaultChecked />
        <span>缺省</span>
      </span>
      <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
        <XhCheckbox size="lg" defaultChecked />
        <span>大</span>
      </span>
    </div>
  );
}
