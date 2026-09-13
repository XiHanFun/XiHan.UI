const r=`/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 双轴滚动 | 同时显示横向和纵向滚动条
import type { ReactNode } from "react";
import {
  XhScrollAreaContent,
  XhScrollAreaCorner,
  XhScrollAreaRoot,
  XhScrollAreaScrollbar,
  XhScrollAreaThumb,
  XhScrollAreaTrack,
  XhScrollAreaViewport,
} from "@xihan-ui/react";

const rows = Array.from({ length: 10 }, (_, index) => \`ORD-\${String(index + 1).padStart(4, "0")} · 华东区域 · 企业版年度订阅 · 已完成\`);

export default function Demo(): ReactNode {
  return (
    <XhScrollAreaRoot
      type="always"
      style={{ blockSize: "160px", inlineSize: "min(420px, 100%)", borderRadius: "var(--xh-shape-surface)", background: "var(--xh-bg-subtle)" }}
    >
      <XhScrollAreaViewport>
        <XhScrollAreaContent style={{ padding: "12px 16px" }}>
          {rows.map(row => (
            <p
              key={row}
              style={{ margin: 0, lineHeight: "28px", whiteSpace: "nowrap" }}
            >
              {row}
            </p>
          ))}
        </XhScrollAreaContent>
      </XhScrollAreaViewport>
      <XhScrollAreaScrollbar orientation="vertical">
        <XhScrollAreaTrack>
          <XhScrollAreaThumb />
        </XhScrollAreaTrack>
        <XhScrollAreaCorner />
      </XhScrollAreaScrollbar>
      <XhScrollAreaScrollbar orientation="horizontal">
        <XhScrollAreaTrack>
          <XhScrollAreaThumb />
        </XhScrollAreaTrack>
      </XhScrollAreaScrollbar>
    </XhScrollAreaRoot>
  );
}
`;export{r as default};
