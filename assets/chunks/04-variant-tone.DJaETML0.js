const n=`// 形态与语气 | 形态决定颜色怎么用、语气决定用哪族颜色，两者都写在组上，段自己不重复标注
import type { ReactNode } from "react";
import { XhButton, XhButtonGroup } from "@xihan-ui/react";

const variants = ["solid", "subtle", "outline", "ghost"] as const;
const views = ["日", "周", "月"];

export default function Demo(): ReactNode {
  return (
    <div style={{ display: "grid", gap: "12px", justifyItems: "start" }}>
      {variants.map(v => (
        <XhButtonGroup key={v} variant={v} tone="brand">
          {views.map(label => <XhButton key={label}>{label}</XhButton>)}
        </XhButtonGroup>
      ))}

      {/* 换一族颜色只改语气，形态那条规则一个字不动 */}
      <XhButtonGroup variant="solid" tone="danger">
        {views.map(label => <XhButton key={label}>{label}</XhButton>)}
      </XhButtonGroup>
    </div>
  );
}
`;export{n as default};
