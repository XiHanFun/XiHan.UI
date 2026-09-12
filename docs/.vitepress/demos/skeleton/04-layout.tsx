// 按版面占位 | 骨架条的宽高由内联样式与组件令牌定，占位形状贴着真内容将来的样子
import type { CSSProperties, ReactNode } from "react";
import { XhSkeletonItem, XhSkeletonRoot } from "@xihan-ui/react";

export default function Demo(): ReactNode {
  return (
    <>
      {/* 卡片位：一块封面加两行正文，末行收窄，看起来像一段还没排出来的字 */}
      <XhSkeletonRoot style={{ inlineSize: "240px" }}>
        <XhSkeletonItem
          shape="rect"
          style={{ "--xh-skeleton-rect-block-size": "120px" } as CSSProperties}
        />
        <XhSkeletonItem />
        <XhSkeletonItem style={{ inlineSize: "60%" }} />
      </XhSkeletonRoot>

      {/* 控件位：圆点直径与两个按钮的宽高各自定死，加载结束后位置不会跳 */}
      <XhSkeletonRoot
        style={{ inlineSize: "240px", flexDirection: "row", alignItems: "center" }}
      >
        <XhSkeletonItem
          shape="circle"
          style={{ "--xh-skeleton-circle-size": "28px" } as CSSProperties}
        />
        <XhSkeletonItem
          shape="rect"
          style={{ "inlineSize": "96px", "--xh-skeleton-rect-block-size": "32px" } as CSSProperties}
        />
        <XhSkeletonItem
          shape="rect"
          style={{ "inlineSize": "64px", "--xh-skeleton-rect-block-size": "32px" } as CSSProperties}
        />
      </XhSkeletonRoot>
    </>
  );
}
