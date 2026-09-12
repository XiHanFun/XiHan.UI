// 宽度充满 | 选项等分可用宽度
import type { ReactNode } from "react";
import { XhToggleGroupRoot } from "@xihan-ui/react";

const options = [
  { value: "list", label: "列表" },
  { value: "grid", label: "网格" },
  { value: "board", label: "看板" },
];

export default function Demo(): ReactNode {
  return (
    <div style={{ inlineSize: "min(100%, 360px)" }}>
      <XhToggleGroupRoot collection={options} defaultValue="list" fullWidth />
    </div>
  );
}
