// 基础用法 | value 与 max 共同决定百分比
import type { ReactNode } from "react";
import { XhProgress } from "@xihan-ui/react";

export default function Demo(): ReactNode {
  return (
    <div style={{ width: "100%", display: "grid", gap: "12px" }}>
      <XhProgress value={30} />
      <XhProgress value={72} />
      <XhProgress value={3} max={4} />
    </div>
  );
}
