// 默认展开层数 | defaultExpandedDepth 决定初次摊到第几层：1 只展开根行，3 连孙层一起铺开
import type { ReactNode } from "react";
import { XhJsonViewerRoot } from "@xihan-ui/react";

const payload = {
  server: {
    host: "127.0.0.1",
    port: 5173,
    tls: { enabled: false, cert: null },
  },
  build: { target: "es2022", minify: true },
};

export default function Demo(): ReactNode {
  return (
    <div style={{ display: "grid", gap: "16px", inlineSize: "100%", maxInlineSize: "420px" }}>
      <XhJsonViewerRoot value={payload} defaultExpandedDepth={1} />
      <XhJsonViewerRoot value={payload} defaultExpandedDepth={3} />
    </div>
  );
}
