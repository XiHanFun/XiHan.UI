// 分隔条里放内容 | 分隔条内可以再摆一个把手，粗细由 --xh-splitter-trigger-thickness 让出位置
import type { CSSProperties, ReactNode } from "react";
import {
  XhSplitterPanel,
  XhSplitterResizeTrigger,
  XhSplitterRoot,
} from "@xihan-ui/react";

const panels = [
  { id: "list", min: 25, max: 75 },
  { id: "detail", min: 25 },
];
const defaultSize = [40, 60];

// 把手不参与命中判定，指针与键盘照旧落在分隔条自己身上
const gripStyle = {
  fontSize: "12px",
  lineHeight: "1",
  color: "var(--xh-fg-muted)",
};

export default function Demo(): ReactNode {
  return (
    <XhSplitterRoot
      panels={panels}
      defaultSizes={defaultSize}
      style={{ inlineSize: "100%", blockSize: "140px" }}
    >
      <XhSplitterPanel index={0}>
        <p style={{ padding: "12px" }}>列表</p>
      </XhSplitterPanel>
      <XhSplitterResizeTrigger
        index={0}
        style={{ "--xh-splitter-trigger-thickness": "14px" } as CSSProperties}
      >
        <span aria-hidden="true" style={gripStyle}>⋮⋮</span>
      </XhSplitterResizeTrigger>
      <XhSplitterPanel index={1}>
        <p style={{ padding: "12px" }}>详情</p>
      </XhSplitterPanel>
    </XhSplitterRoot>
  );
}
