// 码制 | format 切到 data-matrix 就是工业打标常用的 Data Matrix：L 形定位图形、纠错率随尺寸固定；rectangular 从矩形尺寸里挑
import type { ReactNode } from "react";
import { XhMatrixCode } from "@xihan-ui/react";

const text = "SN-2026-0915-0001";

export default function Demo(): ReactNode {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "16px", alignItems: "end" }}>
      <div style={{ display: "grid", gap: "6px", justifyItems: "center" }}>
        <XhMatrixCode value={text} pixelSize={120} />
        <span style={{ fontSize: "12px" }}>qr</span>
      </div>
      <div style={{ display: "grid", gap: "6px", justifyItems: "center" }}>
        <XhMatrixCode format="data-matrix" value={text} pixelSize={120} />
        <span style={{ fontSize: "12px" }}>data-matrix</span>
      </div>
      <div style={{ display: "grid", gap: "6px", justifyItems: "center" }}>
        <XhMatrixCode format="data-matrix" value={text} rectangular pixelSize={240} />
        <span style={{ fontSize: "12px" }}>data-matrix · rectangular</span>
      </div>
    </div>
  );
}
