const e=`// 垂直与折叠 | 垂直调整并折叠面板
import type { ReactNode } from "react";
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
        <p style={{ padding: "12px" }}>预览</p>
      </XhSplitterPanel>
      <XhSplitterResizeTrigger index={0} />
      <XhSplitterPanel index={1} style={{ background: "var(--xh-bg-brand-subtle)" }}>
        <p style={{ padding: "12px" }}>编辑器</p>
      </XhSplitterPanel>
      <XhSplitterResizeTrigger index={1} />
      <XhSplitterPanel index={2} style={{ background: "var(--xh-bg-subtle)" }}>
        <p style={{ padding: "12px" }}>控制台</p>
      </XhSplitterPanel>
    </XhSplitterRoot>
  );
}
`;export{e as default};
