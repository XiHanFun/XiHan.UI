const n=`// 尺寸 | 高度、内边距与字号在组上写一次，沿自定义属性流给组内每一段
import type { ReactNode } from "react";
import { XhButton, XhButtonGroup } from "@xihan-ui/react";

const sizes = ["sm", "md", "lg"] as const;
const views = ["日", "周", "月"];

export default function Demo(): ReactNode {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
      {sizes.map(s => (
        <XhButtonGroup key={s} size={s} variant="outline">
          {views.map(v => <XhButton key={v}>{v}</XhButton>)}
        </XhButtonGroup>
      ))}
    </div>
  );
}
`;export{n as default};
