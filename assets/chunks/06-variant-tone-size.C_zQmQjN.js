const e=`// 形态、语气与尺寸 | 三轴只改按钮外观，取数与落盘那条链一个字都不动
import type { ReactNode } from "react";
import { XhDownloadTrigger } from "@xihan-ui/react";

const notes = "曦寒 UI 导出示例：这一行会被写进 notes.txt";

export default function Demo(): ReactNode {
  return (
    <>
      <XhDownloadTrigger data={notes} fileName="notes.txt" variant="solid">实心</XhDownloadTrigger>
      <XhDownloadTrigger data={notes} fileName="notes.txt" variant="outline">描边</XhDownloadTrigger>
      <XhDownloadTrigger data={notes} fileName="notes.txt" variant="ghost">幽灵</XhDownloadTrigger>

      <XhDownloadTrigger data={notes} fileName="notes.txt" tone="neutral">中性</XhDownloadTrigger>
      <XhDownloadTrigger data={notes} fileName="notes.txt" tone="success">成功</XhDownloadTrigger>

      <XhDownloadTrigger data={notes} fileName="notes.txt" size="sm">小</XhDownloadTrigger>
      <XhDownloadTrigger data={notes} fileName="notes.txt" size="lg">大</XhDownloadTrigger>
    </>
  );
}
`;export{e as default};
