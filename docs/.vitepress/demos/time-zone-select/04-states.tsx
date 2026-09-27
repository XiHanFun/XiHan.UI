// 状态与文案 | 禁用、校验失败和本地化文案沿用字段与 Combobox 契约
import type { ReactNode } from "react";
import { XhTimeZoneSelect } from "@xihan-ui/react";

const zones = ["UTC", "Asia/Shanghai", "America/New_York"];
const translations = { label: "会议时区", placeholder: "搜索城市或偏移", empty: "没有匹配的时区", trigger: "展开时区", clearTrigger: "清空时区" };

export default function Demo(): ReactNode {
  return (
    <div data-demo-stack>
      <XhTimeZoneSelect defaultValue="UTC" timeZones={zones} disabled translations={translations} />
      <XhTimeZoneSelect timeZones={zones} invalid translations={translations} />
    </div>
  );
}
