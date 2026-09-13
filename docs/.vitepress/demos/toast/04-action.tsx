/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 操作按钮 | action-trigger 按下时先发 action 事件，再让这条进入退场；closable 决定还要不要那颗叉
import type { ReactNode } from "react";
import {
  XhButton,
  XhToastActionTrigger,
  XhToastCloseTrigger,
  XhToastContent,
  XhToastIndicator,
  XhToastRoot,
  XhToastTitle,
} from "@xihan-ui/react";
import { useState } from "react";

export default function Demo(): ReactNode {
  const [seq, setSeq] = useState(0);
  const [log, setLog] = useState("（还没点）");

  function onAction(details: { id: string }): void {
    setLog(`撤销了：${details.id}`);
  }

  return (
    <div style={{ display: "grid", width: "100%", gap: "12px", justifyItems: "center" }}>
      <XhToastRoot
        id="toast-demo-action"
        key={seq}
        title="已删除 1 个文件"
        duration={0}
        translations={{ close: "关闭" }}
        onAction={onAction}
      >
        <XhToastIndicator />
        <XhToastContent><XhToastTitle /></XhToastContent>
        <XhToastActionTrigger>撤销</XhToastActionTrigger>
        <XhToastCloseTrigger />
      </XhToastRoot>
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <XhButton size="sm" variant="outline" onClick={() => setSeq(seq + 1)}>再挂一条</XhButton>
        <span>{log}</span>
      </div>
    </div>
  );
}
