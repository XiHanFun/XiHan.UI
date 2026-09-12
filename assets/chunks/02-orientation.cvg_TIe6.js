const t=`// 排布 | 横排在左右两端留圆角，竖排改在上下两端；合边跟着换轴
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
`;export{t as default};
