// 表单提交 | 保存 IANA 时区名，而不是当前 UTC 偏移
import type { ReactNode } from "react";
import { XhTimeZoneSelect } from "@xihan-ui/react";
import { useState } from "react";

const zones = ["UTC", "Asia/Shanghai", "America/New_York"];

export default function Demo(): ReactNode {
  const [value, setValue] = useState<string | null>(null);
  return (
    <form onSubmit={event => event.preventDefault()}>
      <XhTimeZoneSelect name="timeZone" value={value} timeZones={zones} onValueChange={details => setValue(details.value)} />
      <button type="submit">保存排期</button>
    </form>
  );
}
