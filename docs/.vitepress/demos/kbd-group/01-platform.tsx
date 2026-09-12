// 平台 | Mac 使用符号，其他平台使用文字
import type { ReactNode } from "react";
import { XhKbdGroup } from "@xihan-ui/react";

const combo = ["Mod", "S"];

export default function Demo(): ReactNode {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
      <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <span>Mac</span>
        <XhKbdGroup keys={combo} platform="mac" />
      </span>
      <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <span>Windows</span>
        <XhKbdGroup keys={combo} platform="other" />
      </span>
    </div>
  );
}
