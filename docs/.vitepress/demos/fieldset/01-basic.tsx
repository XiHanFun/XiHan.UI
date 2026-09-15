// 基础用法 | 一组字段收进原生 fieldset：legend 是该组的名字，说明文案自动派生 id 并接入 aria-describedby
import type { ReactNode } from "react";
import { XhFieldsetDescription, XhFieldsetLegend, XhFieldsetRoot } from "@xihan-ui/react";

export default function Demo(): ReactNode {
  return (
    <XhFieldsetRoot style={{ inlineSize: "320px" }}>
      <XhFieldsetLegend>通知方式</XhFieldsetLegend>
      <label style={{ display: "flex", gap: "8px", alignItems: "center" }}>
        <input type="checkbox" defaultChecked />
        站内消息
      </label>
      <label style={{ display: "flex", gap: "8px", alignItems: "center" }}>
        <input type="checkbox" />
        邮件
      </label>
      <label style={{ display: "flex", gap: "8px", alignItems: "center" }}>
        <input type="checkbox" />
        短信
      </label>
      <XhFieldsetDescription>至少保留一种，重要变更会照此通知你</XhFieldsetDescription>
    </XhFieldsetRoot>
  );
}
