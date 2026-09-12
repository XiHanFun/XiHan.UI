const n=`// 笔迹外形 | drawing 调笔宽与压感：thinning 越大，划得越快笔画越细，simulatePressure 决定压感取设备值还是按速度算
import type { ReactNode } from "react";
import { XhSignaturePadControl, XhSignaturePadGuide, XhSignaturePadPath, XhSignaturePadRoot } from "@xihan-ui/react";

export default function Demo(): ReactNode {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px", maxInlineSize: "22rem" }}>
      {/* 默认：4px 恒定粗细，压感不参与 */}
      <XhSignaturePadRoot>
        <XhSignaturePadControl>
          <XhSignaturePadGuide />
          <XhSignaturePadPath />
        </XhSignaturePadControl>
      </XhSignaturePadRoot>
      {/* 粗笔加重压感：起笔厚、划快了收细 */}
      <XhSignaturePadRoot drawing={{ size: 10, thinning: 0.8 }}>
        <XhSignaturePadControl>
          <XhSignaturePadGuide />
          <XhSignaturePadPath />
        </XhSignaturePadControl>
      </XhSignaturePadRoot>
    </div>
  );
}
`;export{n as default};
