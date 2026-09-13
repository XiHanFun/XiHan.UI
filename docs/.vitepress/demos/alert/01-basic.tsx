/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 基础用法 | 在中性抬升表面中说明当前状态与影响
import type { ReactNode } from "react";
import { XhAlertContent, XhAlertDescription, XhAlertRoot, XhAlertTitle } from "@xihan-ui/react";

export default function Demo(): ReactNode {
  return (
    <div style={{ width: "100%", display: "grid", gap: "12px" }}>
      <XhAlertRoot>
        <XhAlertContent>
          <XhAlertTitle>部署已排队</XhAlertTitle>
          <XhAlertDescription>构建完成后会自动发布。</XhAlertDescription>
        </XhAlertContent>
      </XhAlertRoot>
    </div>
  );
}
