// 只读与禁用 | 只读画好的还看得见但改不动，禁用连清空按钮都按不动；两者都走原生 disabled，不是灰一层了事
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
