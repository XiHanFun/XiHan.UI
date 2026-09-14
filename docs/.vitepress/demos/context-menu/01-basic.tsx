// 基础用法 | 在目标区域右键打开命令菜单
import type { ReactNode } from "react";
import { XhContextMenuRoot } from "@xihan-ui/react";

const commands = [
  { value: "open", label: "打开" },
  { value: "rename", label: "重命名" },
  { value: "duplicate", label: "创建副本" },
  { value: "delete", label: "移到回收站", separatorBefore: true },
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
            gap: "6px",
            inlineSize: "min(480px, 100%)",
            minBlockSize: "160px",
            borderRadius: "var(--xh-shape-surface)",
            background: "var(--xh-bg-subtle)",
            cursor: "context-menu",
          }}
        >
          <strong>设计规范.pdf</strong>
          <span style={{ color: "var(--xh-fg-muted)" }}>右键打开菜单</span>
        </span>
      )}
    />
  );
}
