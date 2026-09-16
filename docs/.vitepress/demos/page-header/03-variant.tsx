// 形态 | ghost 贴在页面底色上，outline 为带描边的独立面，subtle 淡底
import type { ReactNode } from "react";
import { XhPageHeaderDescription, XhPageHeaderRoot, XhPageHeaderTitle } from "@xihan-ui/react";

const variants = [
  { variant: "ghost", label: "贴底", description: "融入页面背景" },
  { variant: "outline", label: "描边", description: "使用带描边的独立内容面" },
  { variant: "subtle", label: "淡底", description: "以淡底区分页头区域" },
] as const;

export default function Demo(): ReactNode {
  return (
    <div style={{ display: "grid", gap: "12px", inlineSize: "min(720px, 100%)" }}>
      {variants.map(v => (
        <XhPageHeaderRoot key={v.label} variant={v.variant}>
          <XhPageHeaderTitle>{v.label}</XhPageHeaderTitle>
          <XhPageHeaderDescription>{v.description}</XhPageHeaderDescription>
        </XhPageHeaderRoot>
      ))}
    </div>
  );
}
