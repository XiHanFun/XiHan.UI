/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 可关闭 | closable 开启后才渲染关闭按钮；open 受控时由宿主决定去留
import type { ReactNode } from "react";
import {
  XhAlertCloseTrigger,
  XhAlertContent,
  XhAlertRoot,
  XhAlertTitle,
  XhButton,
} from "@xihan-ui/react";
import { useState } from "react";

export default function Demo(): ReactNode {
  const [open, setOpen] = useState(true);

  return (
    <div style={{ width: "100%", display: "grid", gap: "12px" }}>
      <XhAlertRoot open={open} onOpenChange={details => setOpen(details.open)} closable>
        <XhAlertContent><XhAlertTitle>点右侧关闭</XhAlertTitle></XhAlertContent>
        <XhAlertCloseTrigger />
      </XhAlertRoot>
      {!open && <XhButton size="sm" onClick={() => setOpen(true)}>再显示一次</XhButton>}
    </div>
  );
}
