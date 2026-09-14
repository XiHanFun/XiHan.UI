// 基础用法 | 为滚动容器添加滚动条
import type { ReactNode } from "react";
import { XhScrollbarRoot, XhScrollbarThumb, XhScrollbarTrack } from "@xihan-ui/react";
import { useRef } from "react";

const items = ["项目概览", "组件规范", "设计令牌", "无障碍", "交互状态", "主题配置", "发布记录", "迁移指南"];

const boxStyle = {
  blockSize: "144px",
  overflow: "auto",
  scrollbarWidth: "none",
  borderRadius: "var(--xh-shape-surface)",
  background: "var(--xh-bg-subtle)",
  padding: "12px",
} as const;

export default function Demo(): ReactNode {
  const box = useRef<HTMLDivElement>(null);

  return (
    <div style={{ position: "relative", inlineSize: "240px" }}>
      <div ref={box} style={boxStyle}>
        {items.map(item => (
          <div key={item} style={{ paddingBlock: "6px" }}>
            {item}
          </div>
        ))}
      </div>

      <XhScrollbarRoot scrollable={() => box.current} type="always">
        <XhScrollbarTrack>
          <XhScrollbarThumb />
        </XhScrollbarTrack>
      </XhScrollbarRoot>
    </div>
  );
}
