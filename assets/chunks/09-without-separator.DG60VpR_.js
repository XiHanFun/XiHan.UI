const o=`/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 无分隔线 | 省略分隔线部件
import type { ReactNode } from "react";
import { BoldIcon, ItalicIcon, UnderlineIcon } from "@xihan-ui/icons";
import { XhIcon, XhToggleGroupItem, XhToggleGroupRoot } from "@xihan-ui/react";

export default function Demo(): ReactNode {
  return (
    <XhToggleGroupRoot defaultValue={["bold"]} separators={false} multiple>
      <XhToggleGroupItem value="bold" aria-label="粗体">
        <XhIcon icon={BoldIcon} />
      </XhToggleGroupItem>
      <XhToggleGroupItem value="italic" aria-label="斜体">
        <XhIcon icon={ItalicIcon} />
      </XhToggleGroupItem>
      <XhToggleGroupItem value="underline" aria-label="下划线">
        <XhIcon icon={UnderlineIcon} />
      </XhToggleGroupItem>
    </XhToggleGroupRoot>
  );
}
`;export{o as default};
