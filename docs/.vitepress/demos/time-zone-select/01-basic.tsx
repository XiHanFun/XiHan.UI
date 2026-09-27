// 基础用法 | 按地区、城市或 UTC 偏移检索 IANA 时区
import type { ReactNode } from "react";
import { XhTimeZoneSelect } from "@xihan-ui/react";
import { useState } from "react";

const zones = ["UTC", "Asia/Shanghai", "Asia/Tokyo", "Asia/Kolkata", "Europe/London", "Europe/Paris", "America/New_York", "America/Los_Angeles", "Australia/Sydney"];

export default function Demo(): ReactNode {
  const [value, setValue] = useState<string | null>("Asia/Shanghai");
  return (
    <div data-demo-stack>
      <XhTimeZoneSelect value={value} timeZones={zones} onValueChange={details => setValue(details.value)} />
      <p>
        当前值：
        {value ?? "未选择"}
      </p>
    </div>
  );
}
