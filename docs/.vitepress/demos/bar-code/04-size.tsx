// 尺寸与静区 | barWidth 是最窄条的像素宽，整张码等比放大；height 只改条高；margin 是两侧静区的模块数
import type { ReactNode } from "react";
import { XhBarCode } from "@xihan-ui/react";

const value = "SIZE";

export default function Demo(): ReactNode {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "16px", alignItems: "end" }}>
      <div style={{ display: "grid", gap: "6px", justifyItems: "center" }}>
        <XhBarCode value={value} barWidth={1} height={40} />
        <span style={{ fontSize: "12px" }}>barWidth 1 · height 40</span>
      </div>
      <div style={{ display: "grid", gap: "6px", justifyItems: "center" }}>
        <XhBarCode value={value} />
        <span style={{ fontSize: "12px" }}>缺省：barWidth 2 · height 64 · margin 10</span>
      </div>
      <div style={{ display: "grid", gap: "6px", justifyItems: "center" }}>
        <XhBarCode value={value} barWidth={3} height={40} margin={2} />
        <span style={{ fontSize: "12px" }}>barWidth 3 · height 40 · margin 2</span>
      </div>
    </div>
  );
}
