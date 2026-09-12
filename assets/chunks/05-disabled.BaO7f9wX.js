const n=`// 禁用 | 禁用的触发器不可聚焦也点不动，连取数函数都不会被调用
import type { ReactNode } from "react";
import { XhDownloadTrigger } from "@xihan-ui/react";

const notes = "曦寒 UI 导出示例：这一行会被写进 notes.txt";

export default function Demo(): ReactNode {
  return (
    <XhDownloadTrigger disabled data={notes} fileName="notes.txt">
      导出文本（暂不可用）
    </XhDownloadTrigger>
  );
}
`;export{n as default};
