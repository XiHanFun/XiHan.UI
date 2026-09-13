const n=`/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 异步内容 | 点击后获取下载内容
import type { ReactNode } from "react";
import { DownloadIcon } from "@xihan-ui/icons";
import { XhDownloadTrigger, XhIcon } from "@xihan-ui/react";

async function createCsv(): Promise<string> {
  await new Promise(resolve => setTimeout(resolve, 600));
  return "订单号,金额\\nA-1001,128.00\\nA-1002,96.50";
}

export default function Demo(): ReactNode {
  return (
    <XhDownloadTrigger data={createCsv} fileName="orders.csv" mimeType="text/csv">
      <XhIcon icon={DownloadIcon} />
      {" "}
      导出订单
    </XhDownloadTrigger>
  );
}
`;export{n as default};
