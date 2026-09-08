// 局部抽屉 | 把抽屉收进某块区域：遮罩与定位层从 fixed 换成 absolute，只罩住那块区域而不是盖满整屏
import type { CSSProperties, ReactNode } from "react";
import {
  XhDrawerCloseTrigger,
  XhDrawerContent,
  XhDrawerDescription,
  XhDrawerRoot,
  XhDrawerTitle,
  XhDrawerTrigger,
} from "@xihan-ui/react";
import { useState } from "react";

const box: CSSProperties = {
  position: "relative",
  overflow: "hidden",
  blockSize: "200px",
  padding: "16px",
  border: "1px solid var(--xh-border-default)",
  borderRadius: "var(--xh-shape-surface)",
};

export default function Demo(): ReactNode {
  // 容器要自己带 position，否则 absolute 会往上找到别的定位祖先
  const [panel, setPanel] = useState<HTMLElement | null>(null);

  return (
    <>
      <div ref={setPanel} style={box}>
        <p style={{ margin: "0 0 12px" }}>
          这块区域就是抽屉的容器：展开时遮罩只盖住它，页面其余部分照常可点。
        </p>

        <XhDrawerRoot container={() => panel} side="right" size="sm">
          <XhDrawerTrigger>在这块区域里展开</XhDrawerTrigger>
          <XhDrawerContent>
            <XhDrawerTitle>局部抽屉</XhDrawerTitle>
            <XhDrawerDescription>
              它贴的是这个容器的右沿，不是视口的右沿。
            </XhDrawerDescription>
            <XhDrawerCloseTrigger />
          </XhDrawerContent>
        </XhDrawerRoot>
      </div>

      <p style={{ fontSize: "13px" }}>
        不给 container 时问全局配置的 portalContainer，再没有才落 body——整屏抽屉与从前一模一样。
      </p>
    </>
  );
}
