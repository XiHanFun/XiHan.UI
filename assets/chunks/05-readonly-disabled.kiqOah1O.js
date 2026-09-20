const a=`// 只读与禁用 | 只读时已绘制的笔迹可见但不可修改，禁用时连清空按钮都不可按下；两者都使用原生 disabled，不只是视觉置灰
import type { ReactNode } from "react";
import {
  XhSignaturePadClearTrigger,
  XhSignaturePadControl,
  XhSignaturePadGuide,
  XhSignaturePadLabel,
  XhSignaturePadPath,
  XhSignaturePadRoot,
} from "@xihan-ui/react";

export default function Demo(): ReactNode {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px", maxInlineSize: "22rem" }}>
      <XhSignaturePadRoot readOnly>
        <XhSignaturePadLabel>只读</XhSignaturePadLabel>
        <XhSignaturePadControl>
          <XhSignaturePadGuide />
          <XhSignaturePadPath />
        </XhSignaturePadControl>
        <XhSignaturePadClearTrigger>清空</XhSignaturePadClearTrigger>
      </XhSignaturePadRoot>
      <XhSignaturePadRoot disabled>
        <XhSignaturePadLabel>禁用</XhSignaturePadLabel>
        <XhSignaturePadControl>
          <XhSignaturePadGuide />
          <XhSignaturePadPath />
        </XhSignaturePadControl>
        <XhSignaturePadClearTrigger>清空</XhSignaturePadClearTrigger>
      </XhSignaturePadRoot>
    </div>
  );
}
`;export{a as default};
