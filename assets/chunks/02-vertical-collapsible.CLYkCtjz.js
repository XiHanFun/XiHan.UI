const e=`// 垂直与折叠 | 垂直调整并折叠面板
import type { CSSProperties, ReactNode } from "react";
import {
  XhSplitterPanel,
  XhSplitterResizeTrigger,
  XhSplitterRoot,
} from "@xihan-ui/react";

const panels = [
  { id: "top", min: 10 },
  { id: "middle", min: 10, collapsible: true, collapsedSize: 0 },
  { id: "bottom", min: 10 },
];

export default function Demo(): ReactNode {
  return (
    <XhSplitterRoot
      panels={panels}
      orientation="vertical"
      style={{ inlineSize: "min(480px, 100%)", blockSize: "240px" }}
    >
      <XhSplitterPanel index={0} style={{ background: "var(--xh-bg-subtle)" }}>
        <span data-demo-block data-tone="brand" style={{ "--xh-demo-block-block-size": "calc(100% - 24px)", "margin": "12px" } as CSSProperties} />
      </XhSplitterPanel>
      <XhSplitterResizeTrigger index={0} />
      <XhSplitterPanel index={1} style={{ background: "var(--xh-bg-brand-subtle)" }}>
        <span data-demo-block data-tone="info" style={{ "--xh-demo-block-block-size": "calc(100% - 24px)", "margin": "12px" } as CSSProperties} />
      </XhSplitterPanel>
      <XhSplitterResizeTrigger index={1} />
      <XhSplitterPanel index={2} style={{ background: "var(--xh-bg-subtle)" }}>
        <span data-demo-block data-tone="success" style={{ "--xh-demo-block-block-size": "calc(100% - 24px)", "margin": "12px" } as CSSProperties} />
      </XhSplitterPanel>
    </XhSplitterRoot>
  );
}
`;export{e as default};
