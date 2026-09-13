/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 禁用 | 禁止调整面板比例
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
      style={{ inlineSize: "min(480px, 100%)", blockSize: "140px" }}
    >
      <XhSplitterPanel index={0} style={{ background: "var(--xh-bg-subtle)" }}>
        <p style={{ padding: "12px" }}>侧栏</p>
      </XhSplitterPanel>
      <XhSplitterResizeTrigger index={0} />
      <XhSplitterPanel index={1} style={{ background: "var(--xh-bg-brand-subtle)" }}>
        <p style={{ padding: "12px" }}>正文</p>
      </XhSplitterPanel>
    </XhSplitterRoot>
  );
}
