const n=`// 形态 | variant 只改每格的颜色槽位，跳格与粘贴铺开的行为三档一致
import type { ReactNode } from "react";
import { XhPinInputInput, XhPinInputLabel, XhPinInputRoot } from "@xihan-ui/react";

const variants = ["outline", "subtle", "ghost"] as const;
const cells = Array.from({ length: 4 }, (_, i) => i);

export default function Demo(): ReactNode {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "20px" }}>
      {variants.map(v => (
        <XhPinInputRoot key={v} variant={v} length={4} placeholder="·">
          <XhPinInputLabel>{v}</XhPinInputLabel>
          {/* 格间距长在格子自己身上，这层包裹只负责排成一行 */}
          <div style={{ display: "flex" }}>
            {cells.map(i => <XhPinInputInput key={i} index={i} />)}
          </div>
        </XhPinInputRoot>
      ))}
    </div>
  );
}
`;export{n as default};
