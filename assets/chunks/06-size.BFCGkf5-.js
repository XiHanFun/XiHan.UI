const n=`// 尺寸 | size 改星的大小与间距，不写即缺省中档
import type { ReactNode } from "react";
import { XhRatingControl, XhRatingItem, XhRatingLabel, XhRatingRoot } from "@xihan-ui/react";

export default function Demo(): ReactNode {
  return (
    <div style={{ display: "flex", gap: "32px", flexWrap: "wrap", alignItems: "flex-start" }}>
      <XhRatingRoot defaultValue={3} size="sm">
        {({ items }) => (
          <>
            <XhRatingLabel>sm</XhRatingLabel>
            <XhRatingControl>
              {items.map(i => (
                <XhRatingItem key={i} value={i}>★</XhRatingItem>
              ))}
            </XhRatingControl>
          </>
        )}
      </XhRatingRoot>

      <XhRatingRoot defaultValue={3}>
        {({ items }) => (
          <>
            <XhRatingLabel>缺省</XhRatingLabel>
            <XhRatingControl>
              {items.map(i => (
                <XhRatingItem key={i} value={i}>★</XhRatingItem>
              ))}
            </XhRatingControl>
          </>
        )}
      </XhRatingRoot>

      <XhRatingRoot defaultValue={3} size="lg">
        {({ items }) => (
          <>
            <XhRatingLabel>lg</XhRatingLabel>
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
