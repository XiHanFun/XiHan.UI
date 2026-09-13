const n=`// 禁用 | 禁止触发下载
import type { ReactNode } from "react";
import { DownloadIcon } from "@xihan-ui/icons";
import { XhDownloadTrigger, XhIcon } from "@xihan-ui/react";

export default function Demo(): ReactNode {
  return (
    <XhDownloadTrigger disabled data="XiHan.UI" fileName="xihan-ui.txt">
      <XhIcon icon={DownloadIcon} />
      {" "}
      下载文件
    </XhDownloadTrigger>
  );
}
`;export{n as default};
