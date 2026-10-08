var e=`// 收进更多菜单 | 放不下的操作按次序收进行尾的更多按钮
import type { ReactNode } from "react";
import {
  AlignCenterIcon,
  AlignLeftIcon,
  AlignRightIcon,
  BoldIcon,
  ImageIcon,
  ItalicIcon,
  LinkIcon,
  QuoteIcon,
  UnderlineIcon,
} from "@xihan-ui/icons";
import {
  XhIcon,
  XhToolbarGroup,
  XhToolbarItem,
  XhToolbarOverflowTrigger,
  XhToolbarRoot,
  XhToolbarSeparator,
} from "@xihan-ui/react";
import { useState } from "react";

const formats = [
  { value: "bold", label: "加粗", icon: BoldIcon },
  { value: "italic", label: "斜体", icon: ItalicIcon },
  { value: "underline", label: "下划线", icon: UnderlineIcon },
];
const aligns = [
  { value: "left", label: "左对齐", icon: AlignLeftIcon },
  { value: "center", label: "居中", icon: AlignCenterIcon },
  { value: "right", label: "右对齐", icon: AlignRightIcon },
];
const inserts = [
  { value: "link", label: "插入链接", icon: LinkIcon },
  { value: "image", label: "插入图片", icon: ImageIcon },
  { value: "quote", label: "引用", icon: QuoteIcon },
];

export default function Demo(): ReactNode {
  const [pressed, setPressed] = useState(() => new Set(["bold"]));
  const [align, setAlign] = useState("left");

  function toggle(value: string): void {
    const next = new Set(pressed);
    next.has(value) ? next.delete(value) : next.add(value);
    setPressed(next);
  }

  return (
    <div style={{ maxInlineSize: 280 }}>
      <XhToolbarRoot aria-label="文本编辑">
        <XhToolbarGroup>
          {formats.map(format => (
            <XhToolbarItem
              key={format.value}
              value={format.value}
              type="button"
              aria-label={format.label}
              aria-pressed={pressed.has(format.value)}
              onClick={() => toggle(format.value)}
            >
              <XhIcon icon={format.icon} />
            </XhToolbarItem>
          ))}
        </XhToolbarGroup>
        <XhToolbarSeparator />
        <XhToolbarGroup>
          {aligns.map(item => (
            <XhToolbarItem
              key={item.value}
              value={item.value}
              type="button"
              aria-label={item.label}
              aria-pressed={align === item.value}
              onClick={() => setAlign(item.value)}
            >
              <XhIcon icon={item.icon} />
            </XhToolbarItem>
          ))}
        </XhToolbarGroup>
        <XhToolbarSeparator />
        {inserts.map(item => (
          <XhToolbarItem key={item.value} value={item.value} type="button" aria-label={item.label}>
            <XhIcon icon={item.icon} />
          </XhToolbarItem>
        ))}
        <XhToolbarOverflowTrigger />
      </XhToolbarRoot>
    </div>
  );
}
`;export{e as default};