const e=`// 码点形状 | square / dot / rounded；三种形状的墨都盖住每个模块的格心，读码器按格心取样
import type { ReactNode } from "react";
import { XhQrCode } from "@xihan-ui/react";

const shapes = ["square", "dot", "rounded"] as const;
const text = "https://ui.xihanfun.com/components/qr-code";

export default function Demo(): ReactNode {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "16px" }}>
      {shapes.map(shape => (
        <div key={shape} style={{ display: "grid", gap: "6px", justifyItems: "center" }}>
          {/* 时序图形与校正图形不跟着变形：它们是透视校正的几何基准 */}
          <XhQrCode value={text} moduleShape={shape} pixelSize={128} />
          <span style={{ fontSize: "12px" }}>{shape}</span>
        </div>
      ))}
    </div>
  );
}
`;export{e as default};
