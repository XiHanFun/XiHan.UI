const e=`// 禁用 | 禁止调整面板比例
import type { CSSProperties, ReactNode } from "react";
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
      style={{ inlineSize: "min(480px, 100%)", blockSize: "140px" }}
    >
      <XhSplitterPanel index={0} style={{ background: "var(--xh-bg-subtle)" }}>
        <span data-demo-block data-tone="neutral" style={{ "--xh-demo-block-block-size": "calc(100% - 24px)", "margin": "12px" } as CSSProperties} />
      </XhSplitterPanel>
      <XhSplitterResizeTrigger index={0} />
      <XhSplitterPanel index={1} style={{ background: "var(--xh-bg-brand-subtle)" }}>
        <span data-demo-block data-tone="brand" style={{ "--xh-demo-block-block-size": "calc(100% - 24px)", "margin": "12px" } as CSSProperties} />
      </XhSplitterPanel>
    </XhSplitterRoot>
  );
}
`;export{e as default};
