const e=`// 值变化事件 | value-change 每次带上整份 ISO 串，段位被清掉时它是 null
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
  const [log, setLog] = useState<string[]>([]);

  // 只留最近三条，新的排在前面
  function onValueChange(details: { value: string | null }): void {
    setLog(prev => [details.value ?? "null", ...prev].slice(0, 3));
  }

  return (
    <>
      <XhDateFieldRoot
        defaultValue="2026-07-28"
        locale="zh-CN"
        onValueChange={onValueChange}
      >
        <XhDateFieldLabel>改一改再看下面</XhDateFieldLabel>
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

      <span style={{ fontSize: "13px" }}>
        {\`最近变化：\${log.length ? log.join(" ← ") : "（还没动过）"}\`}
      </span>
    </>
  );
}
`;export{e as default};
