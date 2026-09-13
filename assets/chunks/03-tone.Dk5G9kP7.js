const n=`// 颜色 | 使用语义颜色
import type { ReactNode } from "react";
import { StarIcon } from "@xihan-ui/icons";
import { XhIcon, XhIconWrapper } from "@xihan-ui/react";

const tones = ["brand", "success", "warning", "danger", "info"] as const;

export default function Demo(): ReactNode {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
      {tones.map(tone => (
        <XhIconWrapper key={tone} variant="subtle" tone={tone}>
          <XhIcon icon={StarIcon} />
        </XhIconWrapper>
      ))}
    </div>
  );
}
`;export{n as default};
