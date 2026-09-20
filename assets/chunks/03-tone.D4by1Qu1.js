const n=`// 语气 | tone 决定勾中后方框使用哪族颜色，因此这里都设为勾中
import type { ReactNode } from "react";
import { XhCheckbox } from "@xihan-ui/react";

const tones = ["brand", "neutral", "success", "warning", "danger", "info"] as const;

export default function Demo(): ReactNode {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
      {tones.map(t => (
        <XhCheckbox key={t} tone={t} defaultChecked>{t}</XhCheckbox>
      ))}
    </div>
  );
}
`;export{n as default};
