const e=`// 变体 | 适配页面、表面与抬升区域
import type { ReactNode } from "react";
import { XhPageHeaderDescription, XhPageHeaderRoot, XhPageHeaderTitle } from "@xihan-ui/react";

const variants = [
  { variant: undefined, label: "纯净", description: "融入页面背景" },
  { variant: "surface", label: "表面", description: "使用独立内容面" },
  { variant: "raised", label: "抬升", description: "突出当前页面" },
] as const;

export default function Demo(): ReactNode {
  return (
    <div style={{ display: "grid", gap: "12px", inlineSize: "min(720px, 100%)" }}>
      {variants.map(v => (
        <XhPageHeaderRoot key={v.label} variant={v.variant} bordered>
          <XhPageHeaderTitle>{v.label}</XhPageHeaderTitle>
          <XhPageHeaderDescription>{v.description}</XhPageHeaderDescription>
        </XhPageHeaderRoot>
      ))}
    </div>
  );
}
`;export{e as default};
