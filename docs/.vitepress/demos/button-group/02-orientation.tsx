// 方向 | 水平或垂直排列
import type { ReactNode } from "react";
import { XhButton, XhButtonGroup } from "@xihan-ui/react";

const actions = ["复制", "剪切", "粘贴"];

export default function Demo(): ReactNode {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: "24px" }}>
      <XhButtonGroup variant="outline">
        {actions.map(a => <XhButton key={a}>{a}</XhButton>)}
      </XhButtonGroup>

      <XhButtonGroup orientation="vertical" variant="outline">
        {actions.map(a => <XhButton key={a}>{a}</XhButton>)}
      </XhButtonGroup>
    </div>
  );
}
