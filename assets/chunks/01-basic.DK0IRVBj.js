const n=`/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 基础用法 | 集中常用编辑操作
import type { ReactNode } from "react";
import { BoldIcon, ClipboardIcon, CopyIcon, ItalicIcon, UnderlineIcon } from "@xihan-ui/icons";
import {
  XhIcon,
  XhToolbarGroup,
  XhToolbarItem,
  XhToolbarRoot,
  XhToolbarSeparator,
} from "@xihan-ui/react";
import { Fragment, useState } from "react";

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
      <XhToolbarGroup>
        {formats.map((format, index) => (
          <Fragment key={format.value}>
            {index > 0 ? <XhToolbarSeparator /> : null}
            <XhToolbarItem
              value={format.value}
              type="button"
              aria-label={format.label}
              aria-pressed={selected.has(format.value)}
              onClick={() => toggle(format.value)}
            >
              <XhIcon icon={format.icon} />
            </XhToolbarItem>
          </Fragment>
        ))}
      </XhToolbarGroup>
      <XhToolbarSeparator />
      <XhToolbarGroup>
        <XhToolbarItem value="copy" type="button" aria-label="复制">
          <XhIcon icon={CopyIcon} />
        </XhToolbarItem>
        <XhToolbarSeparator />
        <XhToolbarItem value="paste" type="button" aria-label="粘贴">
          <XhIcon icon={ClipboardIcon} />
        </XhToolbarItem>
      </XhToolbarGroup>
    </XhToolbarRoot>
  );
}
`;export{n as default};
