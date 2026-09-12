const n=`// 语气 | tone 决定点亮的星用哪族颜色，不写时沿用警示色
import type { ReactNode } from "react";
import { XhRatingControl, XhRatingItem, XhRatingLabel, XhRatingRoot } from "@xihan-ui/react";

const tones = ["brand", "neutral", "success", "warning", "danger", "info"] as const;

export default function Demo(): ReactNode {
  return (
    <div style={{ display: "flex", gap: "32px", flexWrap: "wrap" }}>
      {tones.map(t => (
        <XhRatingRoot key={t} tone={t} defaultValue={4} readOnly>
          {({ items }) => (
            <>
              <XhRatingLabel>{t}</XhRatingLabel>
              <XhRatingControl>
                {items.map(i => (
                  <XhRatingItem key={i} value={i}>★</XhRatingItem>
                ))}
              </XhRatingControl>
            </>
          )}
        </XhRatingRoot>
      ))}
    </div>
  );
}
`;export{n as default};
