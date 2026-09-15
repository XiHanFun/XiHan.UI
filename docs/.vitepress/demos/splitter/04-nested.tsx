// 嵌套分栏 | 组合水平和垂直面板
import type { CSSProperties, ReactNode } from "react";
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
    <XhSplitterRoot panels={outer} style={{ inlineSize: "min(640px, 100%)", blockSize: "240px" }}>
      <XhSplitterPanel index={0} style={{ background: "var(--xh-bg-subtle)" }}>
        <span data-demo-block data-tone="neutral" style={{ "--xh-demo-block-block-size": "calc(100% - 24px)", "margin": "12px" } as CSSProperties} />
      </XhSplitterPanel>
      <XhSplitterResizeTrigger index={0} />
      <XhSplitterPanel index={1}>
        <XhSplitterRoot
          panels={inner}
          orientation="vertical"
          style={{ inlineSize: "100%", blockSize: "100%" }}
        >
          <XhSplitterPanel index={0} style={{ background: "var(--xh-bg-brand-subtle)" }}>
            <span data-demo-block data-tone="brand" style={{ "--xh-demo-block-block-size": "calc(100% - 24px)", "margin": "12px" } as CSSProperties} />
          </XhSplitterPanel>
          <XhSplitterResizeTrigger index={0} />
          <XhSplitterPanel index={1} style={{ background: "var(--xh-bg-subtle)" }}>
            <span data-demo-block data-tone="info" style={{ "--xh-demo-block-block-size": "calc(100% - 24px)", "margin": "12px" } as CSSProperties} />
          </XhSplitterPanel>
        </XhSplitterRoot>
      </XhSplitterPanel>
    </XhSplitterRoot>
  );
}
