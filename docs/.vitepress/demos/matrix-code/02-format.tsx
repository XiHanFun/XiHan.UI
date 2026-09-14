// 码制 | qr 之外还有三种：工业打标用的 Data Matrix（rectangular 从矩形尺寸里挑）、运单证件用的 PDF417、票务用的 Aztec
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
      <div style={{ display: "grid", gap: "6px", justifyItems: "center" }}>
        <XhMatrixCode format="pdf417" value={text} pixelSize={240} />
        <span style={{ fontSize: "12px" }}>pdf417</span>
      </div>
      <div style={{ display: "grid", gap: "6px", justifyItems: "center" }}>
        <XhMatrixCode format="aztec" value={text} pixelSize={120} />
        <span style={{ fontSize: "12px" }}>aztec</span>
      </div>
    </div>
  );
}
