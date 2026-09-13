/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 悬停展开 | 指针进入时展开，键盘与触控仍可点击
import type { ReactNode } from "react";
import { MessageCircleIcon, ShareIcon } from "@xihan-ui/icons";
import { XhFloatButtonList, XhFloatButtonRoot, XhFloatButtonTrigger, XhIcon } from "@xihan-ui/react";

export default function Demo(): ReactNode {
  return (
    <XhFloatButtonRoot style={{ position: "static" }} expandTrigger="hover">
      <XhFloatButtonTrigger />
      <XhFloatButtonList>
        <button type="button" aria-label="消息"><XhIcon icon={MessageCircleIcon} /></button>
        <button type="button" aria-label="分享"><XhIcon icon={ShareIcon} /></button>
      </XhFloatButtonList>
    </XhFloatButtonRoot>
  );
}
