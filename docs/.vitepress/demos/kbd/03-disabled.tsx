// 禁用 | 只表达对应动作不可用，不会降低整段文字的不透明度
import type { ReactNode } from "react";
import { XhKbd } from "@xihan-ui/react";

export default function Demo(): ReactNode {
  return <p style={{ display: "flex", alignItems: "center", gap: "8px" }}>
    当前不能按 <XhKbd value="Delete" disabled />
  </p>;
}
