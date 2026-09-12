// 自定义档数 | count 决定几颗星，星星按 1..count 逐颗写出
import type { ReactNode } from "react";
import { XhRatingControl, XhRatingItem, XhRatingLabel, XhRatingRoot } from "@xihan-ui/react";
import { useState } from "react";

export default function Demo(): ReactNode {
  const [level, setLevel] = useState(7);

  return (
    <>
      <XhRatingRoot
        value={level}
        onValueChange={details => setLevel(details.value)}
        count={10}
      >
        {({ items }) => (
          <>
            <XhRatingLabel>推荐指数（10 档）</XhRatingLabel>
            <XhRatingControl>
              {items.map(i => (
                <XhRatingItem key={i} value={i}>★</XhRatingItem>
              ))}
            </XhRatingControl>
          </>
        )}
      </XhRatingRoot>
      <p>{`当前：${level} / 10`}</p>
    </>
  );
}
