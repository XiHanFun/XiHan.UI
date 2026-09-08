// 基础用法 | 各部件按需摆放，标题与描述都是可选的
import type { ReactNode } from "react";
import { XhAlertDescription, XhAlertRoot, XhAlertTitle } from "@xihan-ui/react";

export default function Demo(): ReactNode {
  return (
    <div style={{ width: "100%", display: "grid", gap: "12px" }}>
      <XhAlertRoot>
        <XhAlertTitle>部署已排队</XhAlertTitle>
        <XhAlertDescription>构建完成后会自动发布。</XhAlertDescription>
      </XhAlertRoot>
    </div>
  );
}
