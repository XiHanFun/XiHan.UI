// 基础用法 | 滚过 200px 按钮才露面，点它滚回顶部
import type { CSSProperties, ReactNode } from "react";
import { XhBackTopRoot, XhBackTopTrigger } from "@xihan-ui/react";
import { useState } from "react";

const boxStyle: CSSProperties = {
  blockSize: "240px",
  overflow: "auto",
  padding: "12px",
  border: "1px solid var(--xh-border-default)",
  borderRadius: "8px",
};

const rootStyle = {
  "position": "absolute",
  "--xh-back-top-inset-block": "12px",
  "--xh-back-top-inset-inline": "12px",
} as CSSProperties;

export default function Demo(): ReactNode {
  const [scrollEl, setScrollEl] = useState<HTMLElement | null>(null);

  return (
    // 定位壳缺省钉在视口一角；这里把它改成钉在面板内，示例才不必占用整页
    <div style={{ position: "relative", inlineSize: "100%" }}>
      <div ref={setScrollEl} style={boxStyle}>
        {Array.from({ length: 20 }, (_, i) => i + 1).map(i => (
          <p key={i} style={{ margin: "0 0 12px" }}>{`第 ${i} 段内容，往下滚。`}</p>
        ))}
      </div>

      <XhBackTopRoot target={scrollEl} style={rootStyle}>
        <XhBackTopTrigger />
      </XhBackTopRoot>
    </div>
  );
}
