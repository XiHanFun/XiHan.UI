const n=`/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 尺寸 | 使用小、中、大三档尺寸
import type { Size } from "@xihan-ui/core";
import type { ReactNode } from "react";
import { DownloadIcon } from "@xihan-ui/icons";
import { XhDownloadTrigger, XhIcon } from "@xihan-ui/react";

const sizes: Size[] = ["sm", "md", "lg"];

export default function Demo(): ReactNode {
  return sizes.map(size => (
    <XhDownloadTrigger key={size} data="XiHan.UI" fileName="xihan-ui.txt" size={size}>
      <XhIcon icon={DownloadIcon} />
      {" "}
      下载文件
    </XhDownloadTrigger>
  ));
}
`;export{n as default};
