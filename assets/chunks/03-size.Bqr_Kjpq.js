const e=`// 尺寸 | size 换的是各段的内边距与标题字号，不写 size 即默认档
import type { ReactNode } from "react";
import { XhCardBody, XhCardHeader, XhCardRoot, XhCardTitle } from "@xihan-ui/react";

// 中间一档不写 size，用 undefined 表达
const sizes = [
  { size: "sm", label: "小" },
  { size: undefined, label: "默认" },
  { size: "lg", label: "大" },
] as const;

export default function Demo(): ReactNode {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-start", gap: "16px" }}>
      {sizes.map(s => (
        <XhCardRoot
          key={s.label}
          size={s.size}
          variant="outline"
          style={{ inlineSize: "200px" }}
        >
          <XhCardHeader>
            <XhCardTitle>{s.label}</XhCardTitle>
          </XhCardHeader>
          <XhCardBody>正文。</XhCardBody>
        </XhCardRoot>
      ))}
    </div>
  );
}
`;export{e as default};
