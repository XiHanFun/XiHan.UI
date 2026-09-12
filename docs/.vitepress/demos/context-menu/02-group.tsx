// 分组 | 使用标题与分隔线组织命令
import type { ReactNode } from "react";
import { XhContextMenuRoot } from "@xihan-ui/react";

const commands = [
  { value: "name", label: "按名称", indicator: "✓", group: "sort", groupLabel: "排序方式" },
  { value: "time", label: "按修改时间", group: "sort" },
  { value: "list", label: "列表", group: "view", groupLabel: "视图", separatorBefore: true },
  { value: "grid", label: "网格", group: "view" },
];

export default function Demo(): ReactNode {
  return (
    <XhContextMenuRoot
      collection={commands}
      trigger={(
        <span
          style={{
            display: "grid",
            placeItems: "center",
            inlineSize: "min(480px, 100%)",
            minBlockSize: "144px",
            borderRadius: "var(--xh-shape-surface)",
            background: "var(--xh-bg-subtle)",
            cursor: "context-menu",
          }}
        >
          右键设置文件视图
        </span>
      )}
    />
  );
}
