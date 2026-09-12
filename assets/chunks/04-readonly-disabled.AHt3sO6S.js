const n=`// 只读与禁用 | read-only 仍进 Tab 序列、读屏念得出但改不动；disabled 整条退出 Tab 序列
import type { ReactNode } from "react";
import { XhRatingControl, XhRatingItem, XhRatingLabel, XhRatingRoot } from "@xihan-ui/react";

export default function Demo(): ReactNode {
  return (
    <div style={{ display: "flex", gap: "32px", flexWrap: "wrap" }}>
      <XhRatingRoot defaultValue={4} readOnly>
        {({ items }) => (
          <>
            <XhRatingLabel>只读（4 星）</XhRatingLabel>
            <XhRatingControl>
              {items.map(i => (
                <XhRatingItem key={i} value={i}>★</XhRatingItem>
              ))}
            </XhRatingControl>
          </>
        )}
      </XhRatingRoot>

      <XhRatingRoot defaultValue={2} disabled>
        {({ items }) => (
          <>
            <XhRatingLabel>禁用（2 星）</XhRatingLabel>
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
