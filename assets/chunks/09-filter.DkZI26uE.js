var e=`// 级别过滤 | levels 只显示所选级别的行，用切换按钮组选；没写级别的行不受影响
import type { LogLevel } from "@xihan-ui/headless";
import type { ReactNode } from "react";
import { XhLogContent, XhLogLine, XhLogRoot, XhLogViewport, XhToggleGroupRoot } from "@xihan-ui/react";
import { useState } from "react";

const entries: { level: LogLevel; text: string }[] = [
  { level: "debug", text: "12:00:01  读取配置 config/app.yaml" },
  { level: "info", text: "12:00:02  数据库连接池就绪" },
  { level: "info", text: "12:00:04  POST /api/orders  201  118ms" },
  { level: "warn", text: "12:00:05  慢查询 1,240ms  select * from orders" },
  { level: "error", text: "12:00:06  支付网关超时，第 1 次重试" },
  { level: "info", text: "12:00:08  支付网关恢复，订单 8812 已确认" },
];

const options = [
  { value: "debug", label: "Debug" },
  { value: "info", label: "Info" },
  { value: "warn", label: "Warn" },
  { value: "error", label: "Error" },
];

export default function Demo(): ReactNode {
  const [levels, setLevels] = useState<LogLevel[]>(["info", "warn", "error"]);
  return (
    <div style={{ display: "grid", gap: "12px", inlineSize: "100%" }}>
      <XhToggleGroupRoot
        value={levels}
        collection={options}
        multiple
        aria-label="显示的级别"
        onValueChange={details => setLevels(details.value as LogLevel[])}
      />
      <XhLogRoot rows={6} levels={levels}>
        <XhLogViewport>
          <XhLogContent>
            {entries.map((entry, i) => <XhLogLine key={i} level={entry.level}>{entry.text}</XhLogLine>)}
          </XhLogContent>
        </XhLogViewport>
      </XhLogRoot>
    </div>
  );
}
`;export{e as default};