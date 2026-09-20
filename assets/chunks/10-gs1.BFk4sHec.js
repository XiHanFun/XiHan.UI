const a=`// GS1 | gs1 开启后最前面放置 FNC1，读码器把内容视为 GS1 元素串：变长 AI 后面用 GS（U+001D）与下一个隔开；医药 UDI 用 GS1 DataMatrix，零售 2D 迁移用 GS1 QR
import type { ReactNode } from "react";
import { XhMatrixCode } from "@xihan-ui/react";

// GS 是控制字符，用码点写；(01) GTIN 定长 14 位、(17) 有效期定长 6 位、(10) 批号变长——它后面才需要分隔，(21) 序列号收尾
const GS = String.fromCharCode(0x1D);
const value = ["0109501101530003", "17250630", "10ABC123", GS, "21SN001"].join("");

export default function Demo(): ReactNode {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "16px", alignItems: "end" }}>
      <div style={{ display: "grid", gap: "6px", justifyItems: "center" }}>
        <XhMatrixCode format="data-matrix" value={value} gs1 pixelSize={120} label="GS1 DataMatrix" />
        <span style={{ fontSize: "12px" }}>GS1 DataMatrix</span>
      </div>
      <div style={{ display: "grid", gap: "6px", justifyItems: "center" }}>
        <XhMatrixCode value={value} gs1 pixelSize={120} label="GS1 QR" />
        <span style={{ fontSize: "12px" }}>GS1 QR</span>
      </div>
      <span style={{ fontSize: "12px" }}>(01)09501101530003 (17)250630 (10)ABC123 (21)SN001</span>
    </div>
  );
}
`;export{a as default};
