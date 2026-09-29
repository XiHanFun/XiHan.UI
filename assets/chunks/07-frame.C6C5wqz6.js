const e=`// 底框 | 用 frame 给图标套一层圆形底框
import type { ReactNode } from "react";
import { CheckIcon } from "@xihan-ui/icons";
import { XhIcon } from "@xihan-ui/react";

const frames = ["solid", "subtle", "outline", "ghost"] as const;

export default function Demo(): ReactNode {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
      {frames.map(frame => <XhIcon key={frame} icon={CheckIcon} frame={frame} />)}
    </div>
  );
}
`;export{e as default};
