const n=`// 嵌套分栏 | 组合水平和垂直面板
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
    <XhSplitterRoot panels={outer} style={{ inlineSize: "min(640px, 100%)", blockSize: "240px" }}>
      <XhSplitterPanel index={0} style={{ background: "var(--xh-bg-subtle)" }}>
        <p style={{ padding: "12px" }}>文件</p>
      </XhSplitterPanel>
      <XhSplitterResizeTrigger index={0} />
      <XhSplitterPanel index={1}>
        <XhSplitterRoot
          panels={inner}
          orientation="vertical"
          style={{ inlineSize: "100%", blockSize: "100%" }}
        >
          <XhSplitterPanel index={0} style={{ background: "var(--xh-bg-brand-subtle)" }}>
            <p style={{ padding: "12px" }}>编辑器</p>
          </XhSplitterPanel>
          <XhSplitterResizeTrigger index={0} />
          <XhSplitterPanel index={1} style={{ background: "var(--xh-bg-subtle)" }}>
            <p style={{ padding: "12px" }}>控制台</p>
          </XhSplitterPanel>
        </XhSplitterRoot>
      </XhSplitterPanel>
    </XhSplitterRoot>
  );
}
`;export{n as default};
