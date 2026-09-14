// 方向 | 水平或垂直排列
import type { ReactNode } from "react";
import { XhButton, XhButtonGroup } from "@xihan-ui/react";

const actions = ["复制", "剪切", "粘贴"];

export default function Demo(): ReactNode {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: "24px" }}>
      <XhButtonGroup>
        {actions.map(action => <XhButton key={action}>{action}</XhButton>)}
      </XhButtonGroup>

      <XhButtonGroup orientation="vertical">
        {actions.map(action => <XhButton key={action}>{action}</XhButton>)}
      </XhButtonGroup>
    </div>
  );
}
