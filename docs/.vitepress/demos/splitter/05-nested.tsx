// 嵌套 | 面板里再放一套分栏即可拆出第二根轴，里外两层各管各的尺寸，互不干涉
import type { ReactNode } from "react";
import {
  XhSplitterPanel,
  XhSplitterResizeTrigger,
  XhSplitterRoot,
} from "@xihan-ui/react";

const outer = [
  { id: "aside", min: 15, max: 50 },
  { id: "workbench", min: 30 },
];
const inner = [
  { id: "editor", min: 20 },
  { id: "console", min: 15 },
];

export default function Demo(): ReactNode {
  return (
    <XhSplitterRoot panels={outer} style={{ inlineSize: "100%", blockSize: "220px" }}>
      <XhSplitterPanel index={0}>
        <p style={{ padding: "12px" }}>侧栏</p>
      </XhSplitterPanel>
      <XhSplitterResizeTrigger index={0} />
      <XhSplitterPanel index={1}>
        {/* 内层是另一套分栏：跨轴尺寸取满外层这一格 */}
        <XhSplitterRoot
          panels={inner}
          orientation="vertical"
          style={{ inlineSize: "100%", blockSize: "100%" }}
        >
          <XhSplitterPanel index={0}>
            <p style={{ padding: "12px" }}>编辑区</p>
          </XhSplitterPanel>
          <XhSplitterResizeTrigger index={0} />
          <XhSplitterPanel index={1}>
            <p style={{ padding: "12px" }}>输出区</p>
          </XhSplitterPanel>
        </XhSplitterRoot>
      </XhSplitterPanel>
    </XhSplitterRoot>
  );
}
