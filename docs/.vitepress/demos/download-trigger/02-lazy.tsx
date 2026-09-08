// 按需取数 | data 给函数就是点了才算：它可以返回 Promise，这段时间状态是 preparing，再点也不会重复取一遍
import type { ReactNode } from "react";
import { XhDownloadTrigger } from "@xihan-ui/react";

// 点下去才拼这份 CSV，页面加载时不把整份内容备在内存里
async function makeCsv(): Promise<string> {
  await new Promise(resolve => setTimeout(resolve, 600));
  const rows = [
    ["日期", "订单号", "金额"],
    ["2026-08-01", "A-1001", "128.00"],
    ["2026-08-02", "A-1002", "96.50"],
  ];
  return rows.map(row => row.join(",")).join("\n");
}

export default function Demo(): ReactNode {
  return (
    <XhDownloadTrigger
      data={makeCsv}
      fileName="orders.csv"
      mimeType="text/csv"
    >
      导出订单（取数 600 毫秒）
    </XhDownloadTrigger>
  );
}
