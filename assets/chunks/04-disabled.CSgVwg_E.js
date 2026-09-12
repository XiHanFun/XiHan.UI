const e=`// 禁用 | disabled 后拖不动也推不动，分隔条整个退出 Tab 序列，方向键放行给页面
import type { ReactNode } from "react";
import {
  XhSplitterPanel,
  XhSplitterResizeTrigger,
  XhSplitterRoot,
} from "@xihan-ui/react";

const panels = [{ id: "aside" }, { id: "main" }];

export default function Demo(): ReactNode {
  return (
    <XhSplitterRoot
      panels={panels}
      disabled
      style={{ inlineSize: "100%", blockSize: "120px" }}
    >
      <XhSplitterPanel index={0}>
        <p style={{ padding: "12px" }}>侧栏</p>
      </XhSplitterPanel>
      <XhSplitterResizeTrigger index={0} />
      <XhSplitterPanel index={1}>
        <p style={{ padding: "12px" }}>正文</p>
      </XhSplitterPanel>
    </XhSplitterRoot>
  );
}
`;export{e as default};
