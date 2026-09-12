const e=`// 段序随 locale | 同一份标记，locale 换成 en-US 后段序自动排成月日年
import type { ReactNode } from "react";
import {
  XhDateFieldControl,
  XhDateFieldLabel,
  XhDateFieldRoot,
  XhDateFieldSegment,
  XhDateFieldSegmentGroup,
} from "@xihan-ui/react";
import { useState } from "react";

export default function Demo(): ReactNode {
  const [zh, setZh] = useState<string | null>("2026-07-28");
  const [us, setUs] = useState<string | null>("2026-07-28");

  return (
    <div style={{ display: "grid", gap: "16px" }}>
      <XhDateFieldRoot
        value={zh}
        onValueChange={details => setZh(details.value)}
        locale="zh-CN"
      >
        <XhDateFieldLabel>zh-CN</XhDateFieldLabel>
        <XhDateFieldControl>
          <XhDateFieldSegmentGroup>
            <XhDateFieldSegment index={0} />
            <span>年</span>
            <XhDateFieldSegment index={1} />
            <span>月</span>
            <XhDateFieldSegment index={2} />
            <span>日</span>
          </XhDateFieldSegmentGroup>
        </XhDateFieldControl>
      </XhDateFieldRoot>

      <XhDateFieldRoot
        value={us}
        onValueChange={details => setUs(details.value)}
        locale="en-US"
      >
        <XhDateFieldLabel>en-US</XhDateFieldLabel>
        <XhDateFieldControl>
          <XhDateFieldSegmentGroup>
            <XhDateFieldSegment index={0} />
            <span>/</span>
            <XhDateFieldSegment index={1} />
            <span>/</span>
            <XhDateFieldSegment index={2} />
          </XhDateFieldSegmentGroup>
        </XhDateFieldControl>
      </XhDateFieldRoot>

      <p style={{ margin: 0, fontSize: "13px" }}>
        {\`两份值都是 ISO 串：\${zh ?? "（空）"} · \${us ?? "（空）"}\`}
      </p>
    </div>
  );
}
`;export{e as default};
