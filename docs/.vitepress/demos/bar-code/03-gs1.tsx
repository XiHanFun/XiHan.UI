// GS1-128 | gs1 开启后起始符后放置 FNC1；定长 AI 直接连写，变长 AI 后面用 GS（U+001D）与下一个隔开
import type { ReactNode } from "react";
import { BAR_FNC1_CHAR } from "@xihan-ui/headless";
import { XhBarCode } from "@xihan-ui/react";

// (01) GTIN 定长 14 位、(17) 有效期定长 6 位、(10) 批号变长——它后面才需要分隔，(21) 序列号收尾
const value = ["0109501101530003", "17250630", "10ABC123", BAR_FNC1_CHAR, "21SN001"].join("");

export default function Demo(): ReactNode {
  return (
    <div style={{ display: "grid", gap: "6px", justifyItems: "start" }}>
      <XhBarCode value={value} gs1 label="GS1-128 物流标签" />
      <span style={{ fontSize: "12px" }}>(01)09501101530003 (17)250630 (10)ABC123 (21)SN001</span>
    </div>
  );
}
