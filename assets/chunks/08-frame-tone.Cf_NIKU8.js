var e=`// 底框颜色 | tone 同时决定底框与图标的配色
import type { ReactNode } from "react";
import { StarIcon } from "@xihan-ui/icons";
import { XhIcon } from "@xihan-ui/react";

const tones = ["brand", "success", "warning", "danger", "info"] as const;

export default function Demo(): ReactNode {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
      {tones.map(tone => <XhIcon key={tone} icon={StarIcon} frame="subtle" tone={tone} />)}
    </div>
  );
}
`;export{e as default};