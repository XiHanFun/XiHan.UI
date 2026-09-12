const n=`// 自定义颜色 | 点亮色与未点亮色各是一个组件令牌，写在行内即可脱开语气档
import type { CSSProperties, ReactNode } from "react";
import { XhRatingControl, XhRatingItem, XhRatingLabel, XhRatingRoot } from "@xihan-ui/react";

const highlightedOnly = { "--xh-rating-item-fg-highlighted": "#4fb233" } as CSSProperties;
const bothColors = {
  "--xh-rating-item-fg-highlighted": "#e11d48",
  "--xh-rating-item-fg": "#fecdd3",
} as CSSProperties;

export default function Demo(): ReactNode {
  return (
    <div style={{ display: "flex", gap: "32px", flexWrap: "wrap" }}>
      <XhRatingRoot defaultValue={4} readOnly style={highlightedOnly}>
        {({ items }) => (
          <>
            <XhRatingLabel>只换点亮色</XhRatingLabel>
            <XhRatingControl>
              {items.map(i => (
                <XhRatingItem key={i} value={i}>★</XhRatingItem>
              ))}
            </XhRatingControl>
          </>
        )}
      </XhRatingRoot>

      <XhRatingRoot defaultValue={2.5} allowHalf style={bothColors}>
        {({ items }) => (
          <>
            <XhRatingLabel>点亮与未点亮各给一色</XhRatingLabel>
            <XhRatingControl>
              {items.map(i => (
                <XhRatingItem key={i} value={i}>★</XhRatingItem>
              ))}
            </XhRatingControl>
          </>
        )}
      </XhRatingRoot>
    </div>
  );
}
`;export{n as default};
