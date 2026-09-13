/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 子菜单 | 将相关操作收进下一层
import type { ReactNode } from "react";
import {
  XhButton,
  XhMenuContent,
  XhMenuItem,
  XhMenuPositioner,
  XhMenuRoot,
  XhMenuSeparator,
  XhMenuSub,
  XhMenuSubTrigger,
  XhMenuTrigger,
} from "@xihan-ui/react";

export default function Demo(): ReactNode {
  return (
    <XhMenuRoot>
      <XhMenuTrigger asChild>
        <XhButton variant="subtle">文件操作</XhButton>
      </XhMenuTrigger>
      <XhMenuPositioner>
        <XhMenuContent>
          <XhMenuItem value="open">打开</XhMenuItem>
          <XhMenuItem value="rename">重命名</XhMenuItem>
          <XhMenuSeparator />
          <XhMenuSub value="share">
            <XhMenuSubTrigger>发送到</XhMenuSubTrigger>
            <XhMenuPositioner>
              <XhMenuContent>
                <XhMenuItem value="email">邮件</XhMenuItem>
                <XhMenuItem value="message">消息</XhMenuItem>
              </XhMenuContent>
            </XhMenuPositioner>
          </XhMenuSub>
          <XhMenuSeparator />
          <XhMenuItem value="delete">移到回收站</XhMenuItem>
        </XhMenuContent>
      </XhMenuPositioner>
    </XhMenuRoot>
  );
}
