// 码眼形状 | 只作用于三个定位图形，7×7 的外环加内心结构保持不变，读码器靠它找码
import type { ReactNode } from "react";
import { XhQrCode } from "@xihan-ui/react";

const shapes = ["square", "rounded"] as const;
const text = "https://ui.xihanfun.com/components/qr-code";

export default function Demo(): ReactNode {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "16px" }}>
      {shapes.map(shape => (
        <div key={shape} style={{ display: "grid", gap: "6px", justifyItems: "center" }}>
          <XhQrCode value={text} eyeShape={shape} pixelSize={128} />
          <span style={{ fontSize: "12px" }}>{shape}</span>
        </div>
      ))}
      {/* 码点与码眼各挑各的，两条 path 分开出几何 */}
      <div style={{ display: "grid", gap: "6px", justifyItems: "center" }}>
        <XhQrCode value={text} moduleShape="dot" eyeShape="rounded" pixelSize={128} />
        <span style={{ fontSize: "12px" }}>dot + rounded</span>
      </div>
    </div>
  );
}
