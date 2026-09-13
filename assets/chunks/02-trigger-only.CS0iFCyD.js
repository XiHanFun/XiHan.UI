const n=`/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 独立按钮 | 内容已在页面中展示时，只保留复制按钮
import type { ReactNode } from "react";
import { CheckIcon, ClipboardIcon } from "@xihan-ui/icons";
import { XhClipboardCopyTrigger, XhClipboardIndicator, XhClipboardRoot, XhIcon } from "@xihan-ui/react";

export default function Demo(): ReactNode {
  return (
    <XhClipboardRoot value="https://xihan.dev">
      <XhClipboardCopyTrigger>
        <XhClipboardIndicator>
          <XhIcon icon={ClipboardIcon} />
          {" "}
          复制链接
        </XhClipboardIndicator>
        <XhClipboardIndicator copied>
          <XhIcon icon={CheckIcon} />
          {" "}
          已复制
        </XhClipboardIndicator>
      </XhClipboardCopyTrigger>
    </XhClipboardRoot>
  );
}
`;export{n as default};
