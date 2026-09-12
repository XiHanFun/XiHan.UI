// 基础用法 | 集中常用编辑操作
import type { ReactNode } from "react";
import { BoldIcon, ItalicIcon, RotateLeftIcon, RotateRightIcon, UnderlineIcon } from "@xihan-ui/icons";
import {
  XhIcon,
  XhToolbarItem,
  XhToolbarRoot,
  XhToolbarSeparator,
} from "@xihan-ui/react";
import { useState } from "react";

const formats = [
  { value: "bold", label: "加粗", icon: BoldIcon },
  { value: "italic", label: "斜体", icon: ItalicIcon },
  { value: "underline", label: "下划线", icon: UnderlineIcon },
];

export default function Demo(): ReactNode {
  const [selected, setSelected] = useState(() => new Set(["bold"]));

  function toggle(value: string): void {
    const next = new Set(selected);
    next.has(value) ? next.delete(value) : next.add(value);
    setSelected(next);
  }

  return (
    <XhToolbarRoot aria-label="文本编辑">
      <XhToolbarItem value="undo" type="button" aria-label="撤销">
        <XhIcon icon={RotateLeftIcon} />
      </XhToolbarItem>
      <XhToolbarItem value="redo" type="button" aria-label="重做">
        <XhIcon icon={RotateRightIcon} />
      </XhToolbarItem>
      <XhToolbarSeparator />
      {formats.map(format => (
        <XhToolbarItem
          key={format.value}
          value={format.value}
          type="button"
          aria-label={format.label}
          aria-pressed={selected.has(format.value)}
          onClick={() => toggle(format.value)}
        >
          <XhIcon icon={format.icon} />
        </XhToolbarItem>
      ))}
    </XhToolbarRoot>
  );
}
