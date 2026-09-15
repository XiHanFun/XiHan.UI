const n=`// 基础用法 | 调整侧栏和编辑区域的比例
import type { ReactNode } from "react";
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
    <XhSplitterRoot panels={panels} style={{ inlineSize: "min(640px, 100%)", blockSize: "180px" }}>
      <XhSplitterPanel index={0} style={{ padding: "16px", background: "var(--xh-bg-subtle)" }}>文件</XhSplitterPanel>
      <XhSplitterResizeTrigger index={0} />
      <XhSplitterPanel index={1} style={{ padding: "16px", background: "var(--xh-bg-brand-subtle)" }}>编辑器</XhSplitterPanel>
    </XhSplitterRoot>
  );
}
`;export{n as default};
