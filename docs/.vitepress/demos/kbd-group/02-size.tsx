// 尺寸 | 小、中、大三档
import type { ReactNode } from "react";
import { XhKbdGroup } from "@xihan-ui/react";

export default function Demo(): ReactNode {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
      <XhKbdGroup keys={["Mod", "1"]} size="sm" />
      <XhKbdGroup keys={["Mod", "2"]} size="md" />
      <XhKbdGroup keys={["Mod", "3"]} size="lg" />
    </div>
  );
}
