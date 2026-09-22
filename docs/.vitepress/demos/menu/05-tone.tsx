// 破坏性命令 | 用语气把删除一类命令与其余区分开
import type { MenuNode } from "@xihan-ui/headless";
import type { ReactNode } from "react";
import { CopyIcon, PencilIcon, TrashIcon } from "@xihan-ui/icons";
import {
  XhButton,
  XhIcon,
  XhMenuItemIndicator,
  XhMenuItemText,
  XhMenuRoot,
} from "@xihan-ui/react";

const actions: MenuNode[] = [
  { value: "copy", label: "复制" },
  { value: "rename", label: "重命名" },
  { value: "delete", label: "移到回收站", tone: "danger", separatorBefore: true },
];

const icons = { copy: CopyIcon, rename: PencilIcon, delete: TrashIcon };

export default function Demo(): ReactNode {
  return (
    <XhMenuRoot
      collection={actions}
      triggerAsChild
      trigger={<XhButton variant="subtle">文件</XhButton>}
      renderItem={(node) => (
        <>
          <XhMenuItemIndicator>
            <XhIcon icon={icons[node.value as keyof typeof icons]} size="sm" />
          </XhMenuItemIndicator>
          <XhMenuItemText>{node.label}</XhMenuItemText>
        </>
      )}
    />
  );
}
