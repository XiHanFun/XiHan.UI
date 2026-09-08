// 方向 | 竖向分隔线需要父容器有确定高度
import type { ReactNode } from "react";
import { XhSeparator } from "@xihan-ui/react";

export default function Demo(): ReactNode {
  return (
    <>
      <div style={{ width: "100%" }}>
        <p>上一段</p>
        <XhSeparator />
        <p>下一段</p>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "12px", height: "24px" }}>
        <span>左</span>
        <XhSeparator orientation="vertical" />
        <span>右</span>
      </div>
    </>
  );
}
