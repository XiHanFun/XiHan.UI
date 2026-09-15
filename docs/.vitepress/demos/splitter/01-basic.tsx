// 基础用法 | 调整侧栏和编辑区域的比例
import type { CSSProperties, ReactNode } from "react";
import {
  XhSplitterPanel,
  XhSplitterResizeTrigger,
  XhSplitterRoot,
} from "@xihan-ui/react";

const panels = [
  { id: "aside", min: 20, max: 60 },
  { id: "main", min: 25 },
];

export default function Demo(): ReactNode {
  return (
    <XhSplitterRoot panels={panels} aria-label="可调整比例的占位区块" style={{ inlineSize: "min(640px, 100%)", blockSize: "180px" }}>
      <XhSplitterPanel index={0} style={{ padding: "16px" }}>
        <span data-demo-block data-tone="neutral" style={{ "--xh-demo-block-block-size": "100%", "--xh-demo-block-min-block-size": "100%" } as CSSProperties} />
      </XhSplitterPanel>
      <XhSplitterResizeTrigger index={0} />
      <XhSplitterPanel index={1} style={{ padding: "16px" }}>
        <span data-demo-block data-tone="brand" style={{ "--xh-demo-block-block-size": "100%", "--xh-demo-block-min-block-size": "100%" } as CSSProperties} />
      </XhSplitterPanel>
    </XhSplitterRoot>
  );
}
