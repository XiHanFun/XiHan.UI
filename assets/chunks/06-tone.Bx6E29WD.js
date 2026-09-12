const n=`// 语气 | tone 决定用哪族颜色，与 variant 正交；这里固定 outline 只看语气的差别
import type { ReactNode } from "react";
import { XhPinInputInput, XhPinInputLabel, XhPinInputRoot } from "@xihan-ui/react";

const tones = ["brand", "neutral", "success", "warning", "danger", "info"] as const;
const cells = Array.from({ length: 4 }, (_, i) => i);

export default function Demo(): ReactNode {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "20px" }}>
      {tones.map(t => (
        <XhPinInputRoot
          key={t}
          variant="outline"
          tone={t}
          length={4}
          placeholder="·"
        >
          <XhPinInputLabel>{t}</XhPinInputLabel>
          <div style={{ display: "flex" }}>
            {cells.map(i => <XhPinInputInput key={i} index={i} />)}
          </div>
        </XhPinInputRoot>
      ))}
    </div>
  );
}
`;export{n as default};
