const e=`// 中间省略 | position="middle" 把单行文字的省略号收在中间，文件名的开头与扩展名都看得见
import type { ReactNode } from "react";
import { XhTruncate } from "@xihan-ui/react";

const files = [
  "2026-第三季度-经营分析报告-终稿-已审阅.pdf",
  "design-system-tokens-export-dark-theme-v2.json",
  "IMG_20260928_081530_HDR_panorama_edited.jpg",
];

export default function Demo(): ReactNode {
  return (
    <div style={{ display: "grid", gap: 8, inlineSize: 240, maxInlineSize: "100%" }}>
      {files.map(file => <XhTruncate key={file} position="middle" tooltip>{file}</XhTruncate>)}
    </div>
  );
}
`;export{e as default};
