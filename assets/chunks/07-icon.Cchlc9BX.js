const n=`// 自定义图案 | 星形由作者写，条目自带这颗的点亮状态，点亮与未点亮可以画成两个字形
import type { ReactNode } from "react";
import { XhRatingControl, XhRatingItem, XhRatingLabel, XhRatingRoot } from "@xihan-ui/react";

export default function Demo(): ReactNode {
  return (
    <div style={{ display: "flex", gap: "32px", flexWrap: "wrap" }}>
      <XhRatingRoot defaultValue={3}>
        {({ items }) => (
          <>
            <XhRatingLabel>换个字形</XhRatingLabel>
            <XhRatingControl>
              {items.map(i => (
                <XhRatingItem key={i} value={i}>♥</XhRatingItem>
              ))}
            </XhRatingControl>
          </>
        )}
      </XhRatingRoot>

      <XhRatingRoot defaultValue={2} allowHalf>
        {({ items }) => (
          <>
            <XhRatingLabel>空心与实心（半颗仍由皮肤裁）</XhRatingLabel>
            <XhRatingControl>
              {items.map(i => (
                <XhRatingItem key={i} value={i}>
                  {({ highlighted }) => (highlighted ? "★" : "☆")}
                </XhRatingItem>
              ))}
            </XhRatingControl>
          </>
        )}
      </XhRatingRoot>
    </div>
  );
}
`;export{n as default};
