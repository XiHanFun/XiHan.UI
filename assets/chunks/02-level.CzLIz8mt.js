const e=`// 纠错级别 | L / M / Q / H 依次能容忍更多污损，同样的内容也因此占更多模块
import type { ReactNode } from "react";
import { XhQrCode } from "@xihan-ui/react";

const levels = ["L", "M", "Q", "H"] as const;
const text = "https://ui.xihanfun.com/components/qr-code";

export default function Demo(): ReactNode {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "16px" }}>
      {levels.map(level => (
        <div key={level} style={{ display: "grid", gap: "6px", justifyItems: "center" }}>
          <XhQrCode value={text} level={level} pixelSize={120} />
          <span style={{ fontSize: "12px" }}>{level}</span>
        </div>
      ))}
    </div>
  );
}
`;export{e as default};
