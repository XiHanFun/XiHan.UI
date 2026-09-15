// 循环引用 | 值出现在自己的祖先链上即停止并标为 [Circular]，不会无限递归；共享引用不算环，照常展开
import type { ReactNode } from "react";
import { XhJsonViewerRoot } from "@xihan-ui/react";

const shared = { id: 1 };
const node: Record<string, unknown> = { name: "root", left: shared, right: shared };
// 指回自己：摊到这里就停
node.parent = node;

export default function Demo(): ReactNode {
  return (
    <XhJsonViewerRoot
      value={node}
      defaultExpandedDepth={2}
      style={{ inlineSize: "100%", maxInlineSize: "420px" }}
    />
  );
}
