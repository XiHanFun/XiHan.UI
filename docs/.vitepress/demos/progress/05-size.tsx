// 尺寸 | size 只改轨道厚度，不写即缺省中档
import type { ReactNode } from "react";
import { XhProgress } from "@xihan-ui/react";

const labelStyle = { minWidth: "64px", fontSize: "13px", opacity: 0.7 };
const rowStyle = { display: "flex", gap: "12px", alignItems: "center" };

export default function Demo(): ReactNode {
  return (
    <div style={{ width: "100%", display: "grid", gap: "16px" }}>
      <div style={rowStyle}>
        <span style={labelStyle}>sm</span>
        <XhProgress value={65} size="sm" style={{ flex: 1 }} />
      </div>
      <div style={rowStyle}>
        <span style={labelStyle}>缺省</span>
        <XhProgress value={65} style={{ flex: 1 }} />
      </div>
      <div style={rowStyle}>
        <span style={labelStyle}>lg</span>
        <XhProgress value={65} size="lg" style={{ flex: 1 }} />
      </div>
    </div>
  );
}
