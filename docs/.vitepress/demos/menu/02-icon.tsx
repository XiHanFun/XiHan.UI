// 图标、说明与快捷键 | 为常用命令补充识别信息：只交数据，图标排在文字之前，副文本与按键提示自动落位
import type { MenuNode } from "@xihan-ui/headless";
import type { ReactNode } from "react";
import { ArchiveIcon, CopyIcon, DownloadIcon } from "@xihan-ui/icons";
import { XhButton, XhMenuRoot } from "@xihan-ui/react";

const actions: MenuNode[] = [
  { value: "duplicate", label: "创建副本", icon: CopyIcon, description: "保留当前版本，另存一份", shortcut: "⌘ D" },
  { value: "export", label: "导出", icon: DownloadIcon, description: "生成 PDF 或 PNG", shortcut: "⌘ E" },
  { value: "archive", label: "归档", icon: ArchiveIcon, description: "移出列表，随时可以恢复", shortcut: "⌘ ⇧ A", separatorBefore: true },
];

export default function Demo(): ReactNode {
  return (
    <XhMenuRoot
      collection={actions}
      triggerAsChild
      trigger={<XhButton variant="subtle">更多</XhButton>}
    />
  );
}
