// 基础用法 | 下载文本文件
import type { ReactNode } from "react";
import { DownloadIcon } from "@xihan-ui/icons";
import { XhDownloadTrigger, XhIcon } from "@xihan-ui/react";

const content = "XiHan.UI";

export default function Demo(): ReactNode {
  return (
    <XhDownloadTrigger data={content} fileName="xihan-ui.txt">
      <XhIcon icon={DownloadIcon} />
      {" "}
      下载文件
    </XhDownloadTrigger>
  );
}
