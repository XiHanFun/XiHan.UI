const n=`/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// Blob | 下载 JSON 文件
import type { ReactNode } from "react";
import { DownloadIcon } from "@xihan-ui/icons";
import { XhDownloadTrigger, XhIcon } from "@xihan-ui/react";

const data = new Blob([JSON.stringify({ name: "XiHan.UI", version: "1.1.0" }, null, 2)], {
  type: "application/json",
});

export default function Demo(): ReactNode {
  return (
    <XhDownloadTrigger data={data} fileName="package.json">
      <XhIcon icon={DownloadIcon} />
      {" "}
      导出 JSON
    </XhDownloadTrigger>
  );
}
`;export{n as default};
