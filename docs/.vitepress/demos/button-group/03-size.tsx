// 尺寸 | 设置整组尺寸
import type { ReactNode } from "react";
import { XhButton, XhButtonGroup } from "@xihan-ui/react";

const sizes = ["sm", "md", "lg"] as const;
const views = ["日", "周", "月"];

export default function Demo(): ReactNode {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
      {sizes.map(s => (
        <XhButtonGroup key={s} size={s}>
          {views.map(view => <XhButton key={view}>{view}</XhButton>)}
        </XhButtonGroup>
      ))}
    </div>
  );
}
