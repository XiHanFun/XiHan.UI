// 语气 | tone 只改配色，语义仍由内容与 role 决定
import type { ReactNode } from "react";
import { XhAlertRoot, XhAlertTitle } from "@xihan-ui/react";

export default function Demo(): ReactNode {
  return (
    <div style={{ width: "100%", display: "grid", gap: "12px" }}>
      <XhAlertRoot tone="success"><XhAlertTitle>保存成功</XhAlertTitle></XhAlertRoot>
      <XhAlertRoot tone="warning"><XhAlertTitle>配额即将用尽</XhAlertTitle></XhAlertRoot>
      <XhAlertRoot tone="danger"><XhAlertTitle>发布失败</XhAlertTitle></XhAlertRoot>
    </div>
  );
}
