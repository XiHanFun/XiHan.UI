// 自定义格式串 | 记号是 YYYY / YY / MM / M / DD / D / HH / H / mm / m / ss / s，只改看到的文本，datetime 不跟着变
import type { ReactNode } from "react";
import { XhTimestamp } from "@xihan-ui/react";

const value = "2026-08-05T09:03:07";

// 两位记号补零，一位记号不补；记号之外的字符原样留着
const patterns = [
  "YYYY-MM-DD HH:mm:ss",
  "YYYY 年 M 月 D 日",
  "M/D H:mm",
  "YY.MM.DD",
];

export default function Demo(): ReactNode {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      {patterns.map(pattern => (
        <div key={pattern}>
          <code style={{ marginInlineEnd: "12px" }}>{pattern}</code>
          <XhTimestamp value={value} format={pattern} />
        </div>
      ))}
    </div>
  );
}
