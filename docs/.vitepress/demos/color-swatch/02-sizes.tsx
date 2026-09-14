// 尺寸 | sm / md / lg 三档换的是边长与棋盘格粒度，圆角恒是内嵌档
import type { ReactNode } from "react";
import { XhColorSwatch } from "@xihan-ui/react";

export default function Demo(): ReactNode {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
      <XhColorSwatch value="#3b82f6" size="sm" label="小" />
      <XhColorSwatch value="#3b82f6" label="中" />
      <XhColorSwatch value="#3b82f6" size="lg" label="大" />
    </div>
  );
}
