const n=`// 破坏性命令 | 用语气把删除一类命令与其余区分开
import type { MenuNode } from "@xihan-ui/headless";
import type { ReactNode } from "react";
import { CopyIcon, PencilIcon, TrashIcon } from "@xihan-ui/icons";
import { XhButton, XhIcon, XhMenuRoot } from "@xihan-ui/react";

const actions: MenuNode[] = [
  { value: "copy", label: "复制", shortcut: "⌘ C" },
  { value: "rename", label: "重命名", shortcut: "F2" },
  { value: "delete", label: "移到回收站", tone: "danger", shortcut: "⌫", separatorBefore: true },
];

const icons = { copy: CopyIcon, rename: PencilIcon, delete: TrashIcon };

export default function Demo(): ReactNode {
  return (
    <XhMenuRoot
      collection={actions}
      triggerAsChild
      trigger={<XhButton variant="subtle">文件</XhButton>}
      renderItemPrefix={node => (
        <XhIcon icon={icons[node.value as keyof typeof icons]} size="sm" />
      )}
    />
  );
}
`;export{n as default};
