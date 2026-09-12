const n=`// 基础用法 | 一块画布加一条笔迹路径就够了：按下落笔、移动成迹、抬笔收一笔
import type { ReactNode } from "react";
import { XhSignaturePadControl, XhSignaturePadPath, XhSignaturePadRoot } from "@xihan-ui/react";

export default function Demo(): ReactNode {
  return (
    <XhSignaturePadRoot style={{ maxInlineSize: "22rem" }}>
      {/* 画布是 svg，笔迹全落在它里面那一条 path 上 */}
      <XhSignaturePadControl>
        <XhSignaturePadPath />
      </XhSignaturePadControl>
    </XhSignaturePadRoot>
  );
}
`;export{n as default};
