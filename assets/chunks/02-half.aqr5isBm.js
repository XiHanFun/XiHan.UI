const n=`// 半星与悬停预览 | allow-half 让落点分左右半边；划过只发 hover-change，评分要点下去才改
import type { ReactNode } from "react";
import { XhRatingControl, XhRatingItem, XhRatingLabel, XhRatingRoot } from "@xihan-ui/react";
import { useState } from "react";

export default function Demo(): ReactNode {
  const [score, setScore] = useState(2.5);
  const [preview, setPreview] = useState<number | null>(null);

  function onHoverChange(details: { value: number | null }): void {
    setPreview(details.value);
  }

  return (
    <>
      <XhRatingRoot
        value={score}
        onValueChange={details => setScore(details.value)}
        allowHalf
        onHoverChange={onHoverChange}
      >
        {({ items }) => (
          <>
            <XhRatingLabel>服务评分</XhRatingLabel>
            <XhRatingControl>
              {items.map(i => (
                <XhRatingItem key={i} value={i}>★</XhRatingItem>
              ))}
            </XhRatingControl>
          </>
        )}
      </XhRatingRoot>
      <p>{\`评分：\${score} · 悬停预览：\${preview ?? "（无）"}\`}</p>
    </>
  );
}
`;export{n as default};
