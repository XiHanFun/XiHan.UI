const n=`// 基础用法 | 不传 value 即为非受控，组件自己维护评分；default-value 只决定初始那一档
import type { ReactNode } from "react";
import { XhRatingControl, XhRatingItem, XhRatingLabel, XhRatingRoot } from "@xihan-ui/react";

export default function Demo(): ReactNode {
  return (
    <XhRatingRoot defaultValue={3}>
      {({ items }) => (
        <>
          <XhRatingLabel>整体满意度</XhRatingLabel>
          <XhRatingControl>
            {items.map(i => (
              <XhRatingItem key={i} value={i}>★</XhRatingItem>
            ))}
          </XhRatingControl>
        </>
      )}
    </XhRatingRoot>
  );
}
`;export{n as default};
