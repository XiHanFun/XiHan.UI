const e=`// 基础用法 | 容器竖着码放骨架条，形状缺省是一行文字
import type { ReactNode } from "react";
import { XhSkeletonItem, XhSkeletonRoot } from "@xihan-ui/react";

export default function Demo(): ReactNode {
  return (
    <XhSkeletonRoot style={{ inlineSize: "260px" }}>
      <XhSkeletonItem />
      <XhSkeletonItem />
      <XhSkeletonItem />
    </XhSkeletonRoot>
  );
}
`;export{e as default};
