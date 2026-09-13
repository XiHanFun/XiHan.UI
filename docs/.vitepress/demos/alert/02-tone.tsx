/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 语气 | tone 只改配色，语义仍由内容与 role 决定
import type { ReactNode } from "react";
import { XhAlertContent, XhAlertRoot, XhAlertTitle } from "@xihan-ui/react";

export default function Demo(): ReactNode {
  return (
    <div style={{ width: "100%", display: "grid", gap: "12px" }}>
      <XhAlertRoot tone="success"><XhAlertContent><XhAlertTitle>保存成功</XhAlertTitle></XhAlertContent></XhAlertRoot>
      <XhAlertRoot tone="warning"><XhAlertContent><XhAlertTitle>配额即将用尽</XhAlertTitle></XhAlertContent></XhAlertRoot>
      <XhAlertRoot tone="danger"><XhAlertContent><XhAlertTitle>发布失败</XhAlertTitle></XhAlertContent></XhAlertRoot>
    </div>
  );
}
