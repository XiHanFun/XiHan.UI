// 尺寸 | 提供三种尺寸
import type { ReactNode } from "react";
import { XhToggle } from "@xihan-ui/react";

export default function Demo(): ReactNode {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
      <XhToggle variant="outline" size="sm">小</XhToggle>
      <XhToggle variant="outline">中</XhToggle>
      <XhToggle variant="outline" size="lg">大</XhToggle>
    </div>
  );
}
