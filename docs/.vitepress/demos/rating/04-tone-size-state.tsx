// 语气、尺寸与状态 | tone 决定点亮的星使用哪族颜色，不写时沿用警示色；size 改变星的大小与间距，不写即默认中档；read-only 仍进入 Tab 序列、读屏可朗读但不可修改，disabled 整条退出 Tab 序列
import type { ReactNode } from "react";
import { XhRatingControl, XhRatingItem, XhRatingLabel, XhRatingRoot } from "@xihan-ui/react";

const tones = ["brand", "neutral", "success", "warning", "danger", "info"] as const;

export default function Demo(): ReactNode {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--xh-space-6)" }}>
      <div style={{ display: "flex", gap: "var(--xh-space-8)", flexWrap: "wrap" }}>
        {tones.map(t => (
          <XhRatingRoot key={t} tone={t} defaultValue={4} readOnly>
            {({ items }) => (
              <>
                <XhRatingLabel>{t}</XhRatingLabel>
                <XhRatingControl>
                  {items.map(i => (
                    <XhRatingItem key={i} value={i}></XhRatingItem>
                  ))}
                </XhRatingControl>
              </>
            )}
          </XhRatingRoot>
        ))}
      </div>

      <div style={{ display: "flex", gap: "var(--xh-space-8)", flexWrap: "wrap", alignItems: "flex-start" }}>
        <XhRatingRoot defaultValue={3} size="sm">
          {({ items }) => (
            <>
              <XhRatingLabel>sm</XhRatingLabel>
              <XhRatingControl>
                {items.map(i => (
                  <XhRatingItem key={i} value={i}></XhRatingItem>
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
                  <XhRatingItem key={i} value={i}></XhRatingItem>
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
                  <XhRatingItem key={i} value={i}></XhRatingItem>
                ))}
              </XhRatingControl>
            </>
          )}
        </XhRatingRoot>
      </div>

      <div style={{ display: "flex", gap: "var(--xh-space-8)", flexWrap: "wrap" }}>
        <XhRatingRoot defaultValue={4} readOnly>
          {({ items }) => (
            <>
              <XhRatingLabel>只读（4 星）</XhRatingLabel>
              <XhRatingControl>
                {items.map(i => (
                  <XhRatingItem key={i} value={i}></XhRatingItem>
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
                  <XhRatingItem key={i} value={i}></XhRatingItem>
                ))}
              </XhRatingControl>
            </>
          )}
        </XhRatingRoot>
      </div>
    </div>
  );
}
