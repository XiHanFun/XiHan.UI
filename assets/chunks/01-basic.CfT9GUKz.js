const n=`// 基础用法 | 内容已经在手里就直接给字符串，点一下即交给浏览器；文件名连同扩展名都由 file-name 说了算
import type { ReactNode } from "react";
import { XhDownloadTrigger } from "@xihan-ui/react";

const notes = "曦寒 UI 导出示例：这一行会被写进 notes.txt";

export default function Demo(): ReactNode {
  return (
    <XhDownloadTrigger data={notes} fileName="notes.txt">
      导出文本
    </XhDownloadTrigger>
  );
}
`;export{n as default};
