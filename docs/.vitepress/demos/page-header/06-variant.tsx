// 形态 | 不写 variant 即不画面（与写 plain 一个样）；surface 加底色、圆角与左右内衬，raised 再加一层抬起投影，bordered 在这两档改画整圈描边
import type { ReactNode } from "react";
import { XhPageHeaderDescription, XhPageHeaderRoot, XhPageHeaderTitle } from "@xihan-ui/react";

// 第一档不写 variant，用 undefined 表达
const variants = [
  { variant: undefined, label: "不画面" },
  { variant: "surface", label: "有面" },
  { variant: "raised", label: "抬起" },
] as const;

export default function Demo(): ReactNode {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      {variants.map(v => (
        <XhPageHeaderRoot key={v.label} variant={v.variant} bordered>
          <XhPageHeaderTitle>{v.label}</XhPageHeaderTitle>
          <XhPageHeaderDescription>页头贴在什么底上，由这一轴决定</XhPageHeaderDescription>
        </XhPageHeaderRoot>
      ))}
    </div>
  );
}
