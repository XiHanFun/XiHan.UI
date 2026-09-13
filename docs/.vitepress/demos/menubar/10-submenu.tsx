/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 子菜单 | 在菜单栏命令中打开下一层
import type { ReactNode } from "react";
import {
  XhMenubarContent,
  XhMenubarItem,
  XhMenubarPositioner,
  XhMenubarRoot,
  XhMenubarSeparator,
  XhMenubarSub,
  XhMenubarSubTrigger,
  XhMenubarTrigger,
  XhMenuContent,
  XhMenuItem,
  XhMenuPositioner,
} from "@xihan-ui/react";

export default function Demo(): ReactNode {
  return (
    <XhMenubarRoot style={{ background: "var(--xh-bg-subtle)" }}>
      <XhMenubarTrigger value="file">文件</XhMenubarTrigger>
      <XhMenubarTrigger value="edit">编辑</XhMenubarTrigger>
      <XhMenubarPositioner value="file">
        <XhMenubarContent>
          <XhMenubarItem value="open">打开</XhMenubarItem>
          <XhMenubarItem value="save">保存</XhMenubarItem>
          <XhMenubarSeparator />
          <XhMenubarSub value="share">
            <XhMenubarSubTrigger>发送到</XhMenubarSubTrigger>
            <XhMenuPositioner>
              <XhMenuContent>
                <XhMenuItem value="email">邮件</XhMenuItem>
                <XhMenuItem value="message">消息</XhMenuItem>
              </XhMenuContent>
            </XhMenuPositioner>
          </XhMenubarSub>
          <XhMenubarSeparator />
          <XhMenubarItem value="close">关闭</XhMenubarItem>
        </XhMenubarContent>
      </XhMenubarPositioner>
      <XhMenubarPositioner value="edit">
        <XhMenubarContent>
          <XhMenubarItem value="undo">撤销</XhMenubarItem>
          <XhMenubarItem value="redo">重做</XhMenubarItem>
        </XhMenubarContent>
      </XhMenubarPositioner>
    </XhMenubarRoot>
  );
}
