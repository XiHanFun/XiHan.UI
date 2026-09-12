const e=`// 多组合换行 | 每组内部不拆行，容器只在完整组合之间换行
import type { ReactNode } from "react";
import { XhKbdGroup } from "@xihan-ui/react";

export default function Demo(): ReactNode {
  return <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", inlineSize: "180px" }}>
    <XhKbdGroup keys={["Mod", "Shift", "P"]} />
    <XhKbdGroup keys={["Alt", "ArrowDown"]} />
    <XhKbdGroup keys={["Mod", "Enter"]} />
  </div>;
}
`;export{e as default};
