// 人读文字 | text 关闭后只剩条；EAN 的守卫条按规范比数据条长 5X，不随文字变化
import type { ReactNode } from "react";
import { XhBarCode } from "@xihan-ui/react";

export default function Demo(): ReactNode {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "16px", alignItems: "start" }}>
      <div style={{ display: "grid", gap: "6px", justifyItems: "center" }}>
        <XhBarCode format="ean13" value="590123412345" />
        <span style={{ fontSize: "12px" }}>缺省印文字</span>
      </div>
      <div style={{ display: "grid", gap: "6px", justifyItems: "center" }}>
        <XhBarCode format="ean13" value="590123412345" text={false} />
        <span style={{ fontSize: "12px" }}>text=false</span>
      </div>
    </div>
  );
}
