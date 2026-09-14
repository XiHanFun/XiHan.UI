// 动效 | 在微光、呼吸和静止三档之间选择
import type { SkeletonAnimation } from "@xihan-ui/headless";
import type { CSSProperties, ReactNode } from "react";
import { XhSkeletonItem, XhSkeletonRoot } from "@xihan-ui/react";

const animations: SkeletonAnimation[] = ["shimmer", "pulse", "none"];

export default function Demo(): ReactNode {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "20px" }}>
      {animations.map(animation => (
        <div key={animation} style={{ display: "grid", gap: "8px" }}>
          <span>{animation}</span>
          <XhSkeletonRoot animation={animation} style={{ inlineSize: "140px" }}>
            <XhSkeletonItem shape="rect" style={{ "--xh-skeleton-rect-block-size": "64px" } as CSSProperties} />
            <XhSkeletonItem style={{ inlineSize: "70%" }} />
          </XhSkeletonRoot>
        </div>
      ))}
    </div>
  );
}
