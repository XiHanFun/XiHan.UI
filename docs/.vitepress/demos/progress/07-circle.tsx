// 环形 | variant="circle" 把同一份进度画成环，尺寸档改的是直径
import type { ReactNode } from "react";
import { XhProgress } from "@xihan-ui/react";

export default function Demo(): ReactNode {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "24px", flexWrap: "wrap" }}>
      <XhProgress variant="circle" value={30} size="sm" />
      <XhProgress variant="circle" value={72} />
      <XhProgress variant="circle" value={100} size="lg" tone="success" />
    </div>
  );
}
