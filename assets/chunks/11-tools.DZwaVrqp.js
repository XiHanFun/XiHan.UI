var e=`// 内建工具条 | tools 打开内建工具条：树档有展开全部 / 收起全部，原文档有自动换行，复制原文与原文开关固定在末端；数组只铺列出的几项
import type { ReactNode } from "react";
import { XhJsonViewerRoot } from "@xihan-ui/react";

const payload = {
  traceId: "9ef5a8c3e1b44f0f",
  request: {
    method: "POST",
    url: "/api/workflow/definition/new-version?tenant=hangzhou-branch&operator=owner&reason=quarterly-review",
    headers: { "content-type": "application/json", "x-request-id": "c0d1e2f3" },
  },
  response: { status: 200, elapsed: 35, body: { id: "207795978470952990", version: 3 } },
};

export default function Demo(): ReactNode {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px", inlineSize: "100%", maxInlineSize: "480px" }}>
      <XhJsonViewerRoot value={payload} tools defaultExpandedDepth={2} />
      <XhJsonViewerRoot value={payload} tools={["copy", "view"]} defaultView="text" />
    </div>
  );
}
`;export{e as default};