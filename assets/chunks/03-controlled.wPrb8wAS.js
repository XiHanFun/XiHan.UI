const n=`// 受控展开 | 传了 expandedValue 就由宿主说了算，组件只发 expanded-value-change 不落内部值，写回它才动
import type { ReactNode } from "react";
import { JSON_VIEWER_ROOT_PATH, jsonExpandedPathsToDepth } from "@xihan-ui/headless";
import { XhButton, XhJsonViewerRoot } from "@xihan-ui/react";
import { useState } from "react";

const payload = {
  request: { method: "POST", path: "/api/login" },
  response: { code: 200, body: { token: "eyJhbGciOi…", expiresIn: 7200 } },
};

export default function Demo(): ReactNode {
  const [expanded, setExpanded] = useState<string[]>([JSON_VIEWER_ROOT_PATH]);

  return (
    <div style={{ display: "grid", gap: "12px", inlineSize: "100%", maxInlineSize: "420px" }}>
      <div style={{ display: "flex", gap: "8px" }}>
        <XhButton size="sm" onClick={() => setExpanded(jsonExpandedPathsToDepth(payload, 9))}>
          全部展开
        </XhButton>
        <XhButton size="sm" onClick={() => setExpanded([])}>全部收起</XhButton>
      </div>

      <XhJsonViewerRoot
        value={payload}
        expandedValue={expanded}
        onExpandedValueChange={details => setExpanded(details.value)}
      />

      <span>{\`展开了 \${expanded.length} 处\`}</span>
    </div>
  );
}
`;export{n as default};
