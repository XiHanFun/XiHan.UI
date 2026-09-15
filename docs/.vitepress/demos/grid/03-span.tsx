// 跨列与错列 | 控制内容占用的列
import type { ReactNode } from "react";
import { XhGridItem, XhGridRoot } from "@xihan-ui/react";

export default function Demo(): ReactNode {
  return (
    <XhGridRoot cols={4} gap="sm" style={{ inlineSize: "min(640px, 100%)" }}>
      <XhGridItem span={3} data-demo-block data-tone="brand" />
      <XhGridItem data-demo-block data-tone="info" />
      <XhGridItem span={2} data-demo-block data-tone="success" />
      <XhGridItem span={2} data-demo-block data-tone="warning" />
      <XhGridItem offset={1} span={2} data-demo-block data-tone="danger" />
    </XhGridRoot>
  );
}
