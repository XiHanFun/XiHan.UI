// 再点一次清空 | allowClear 缺省就开：点中当前那一档清回“还没评”，键盘在最低档再往下走一步同样清零；设为 false 关掉
import type { ReactNode } from "react";
import { XhRatingControl, XhRatingItem, XhRatingLabel, XhRatingRoot } from "@xihan-ui/react";
import { useState } from "react";

export default function Demo(): ReactNode {
  const [score, setScore] = useState(3);
  const [sticky, setSticky] = useState(3);

  return (
    <div style={{ display: "grid", gap: "12px" }}>
      <div>
        <XhRatingRoot value={score} onValueChange={details => setScore(details.value)}>
          {({ items }) => (
            <>
              <XhRatingLabel>整体满意度（可清空）</XhRatingLabel>
              <XhRatingControl>
                {items.map(i => (
                  <XhRatingItem key={i} value={i}>★</XhRatingItem>
                ))}
              </XhRatingControl>
            </>
          )}
        </XhRatingRoot>
        <p style={{ margin: "4px 0 0", fontSize: "13px" }}>{`当前：${score === 0 ? "还没评" : score}`}</p>
      </div>
      <div>
        <XhRatingRoot
          value={sticky}
          onValueChange={details => setSticky(details.value)}
          allowClear={false}
        >
          {({ items }) => (
            <>
              <XhRatingLabel>关掉清空（再点不清）</XhRatingLabel>
              <XhRatingControl>
                {items.map(i => (
                  <XhRatingItem key={i} value={i}>★</XhRatingItem>
                ))}
              </XhRatingControl>
            </>
          )}
        </XhRatingRoot>
        <p style={{ margin: "4px 0 0", fontSize: "13px" }}>{`当前：${sticky}`}</p>
      </div>
    </div>
  );
}
