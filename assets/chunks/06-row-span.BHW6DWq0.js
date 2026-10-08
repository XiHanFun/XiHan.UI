var e=`// 跨行 | row-span 让一格占几条行轨道，常用来放一块比同行其余格子更高的主内容
import type { CSSProperties, ReactNode } from "react";
import { XhGridItem, XhGridRoot } from "@xihan-ui/react";

// 示例块的高度槽改成 auto，才会被拉满它占的两条行轨道
const tall = { "--xh-demo-block-block-size": "auto" } as CSSProperties;

export default function Demo(): ReactNode {
  return (
    <XhGridRoot cols={3} gap="sm" style={{ inlineSize: "min(640px, 100%)" }}>
      <XhGridItem rowSpan={2} data-demo-block data-tone="brand" style={tall} />
      <XhGridItem data-demo-block data-tone="info" />
      <XhGridItem data-demo-block data-tone="success" />
      <XhGridItem data-demo-block data-tone="warning" />
      <XhGridItem data-demo-block data-tone="danger" />
    </XhGridRoot>
  );
}
`;export{e as default};