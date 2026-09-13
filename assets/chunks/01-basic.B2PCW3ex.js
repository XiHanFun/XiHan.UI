const t=`/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 基础用法 | 展开一组悬浮操作
import type { ReactNode } from "react";
import { MessageCircleIcon, SettingsIcon, ShareIcon } from "@xihan-ui/icons";
import { XhFloatButtonList, XhFloatButtonRoot, XhFloatButtonTrigger, XhIcon } from "@xihan-ui/react";

export default function Demo(): ReactNode {
  return (
    <XhFloatButtonRoot style={{ position: "static" }} defaultOpen>
      <XhFloatButtonTrigger />
      <XhFloatButtonList>
        <button type="button" aria-label="消息"><XhIcon icon={MessageCircleIcon} /></button>
        <button type="button" aria-label="分享"><XhIcon icon={ShareIcon} /></button>
        <button type="button" aria-label="设置"><XhIcon icon={SettingsIcon} /></button>
      </XhFloatButtonList>
    </XhFloatButtonRoot>
  );
}
`;export{t as default};
