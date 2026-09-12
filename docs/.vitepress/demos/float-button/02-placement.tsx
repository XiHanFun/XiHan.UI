// 四角 | placement 决定钉在哪一角，start / end 跟着书写方向走；那一组恒往页面中间长
import type { ReactNode } from "react";
import { XhFloatButtonList, XhFloatButtonRoot, XhFloatButtonTrigger } from "@xihan-ui/react";
import { useState } from "react";

const placements = ["top-start", "top-end", "bottom-start", "bottom-end"] as const;

export default function Demo(): ReactNode {
  const [placement, setPlacement] = useState<(typeof placements)[number]>("bottom-end");

  return (
    <div style={{ display: "grid", gap: "12px", inlineSize: "100%" }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
        {placements.map(p => (
          <label key={p} style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <input
              type="radio"
              value={p}
              checked={placement === p}
              onChange={() => setPlacement(p)}
            />
            {p}
          </label>
        ))}
      </div>

      <div
        style={{
          position: "relative",
          blockSize: "280px",
          border: "1px solid var(--xh-border-default)",
          borderRadius: "8px",
        }}
      >
        <XhFloatButtonRoot
          style={{ position: "absolute" }}
          placement={placement}
          offset={16}
          defaultOpen
        >
          <XhFloatButtonTrigger />
          <XhFloatButtonList>
            <button type="button" title="编辑">✎</button>
            <button type="button" title="分享">↗</button>
          </XhFloatButtonList>
        </XhFloatButtonRoot>
      </div>
    </div>
  );
}
