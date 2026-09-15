const e=`// 基础用法 | 按真实卡片的封面与文字节奏占位
import type { CSSProperties, ReactNode } from "react";
import { XhSkeletonItem, XhSkeletonRoot } from "@xihan-ui/react";

export default function Demo(): ReactNode {
  return (
    <XhSkeletonRoot style={{ inlineSize: "260px" }}>
      <XhSkeletonItem shape="rect" style={{ "--xh-skeleton-rect-block-size": "120px" } as CSSProperties} />
      <XhSkeletonItem style={{ inlineSize: "60%" }} />
      <XhSkeletonItem style={{ inlineSize: "80%" }} />
      <XhSkeletonItem style={{ inlineSize: "40%" }} />
    </XhSkeletonRoot>
  );
}
`;export{e as default};
