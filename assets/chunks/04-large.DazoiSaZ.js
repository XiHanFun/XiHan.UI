const n=`// 大数据 | maxItems 把超长数组折为一行占位，maxStringLength 截断过长的字符串，一份大 JSON 不会拖慢页面
import type { ReactNode } from "react";
import { XhJsonViewerRoot } from "@xihan-ui/react";

const payload = {
  total: 240,
  cursor:
    "eyJvZmZzZXQiOjAsImxpbWl0IjoyMCwic29ydCI6ImNyZWF0ZWRfYXQgZGVzYyJ9-very-long-token",
  items: Array.from({ length: 240 }, (_, i) => \`第 \${i + 1} 条\`),
};

export default function Demo(): ReactNode {
  return (
    <XhJsonViewerRoot
      value={payload}
      defaultExpandedDepth={2}
      maxItems={5}
      maxStringLength={24}
      style={{ inlineSize: "100%", maxInlineSize: "420px" }}
    />
  );
}
`;export{n as default};
