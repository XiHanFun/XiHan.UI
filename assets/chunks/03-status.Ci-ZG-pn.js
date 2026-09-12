const n=`// 状态与失败 | 写入是异步的也真的会失败：按下先进 copying，写成功才翻成 copied，失败一律退回 idle 并把原因报出来
import type { ReactNode } from "react";
import { CheckIcon } from "@xihan-ui/icons";
import {
  XhClipboardControl,
  XhClipboardCopyTrigger,
  XhClipboardIndicator,
  XhClipboardInput,
  XhClipboardRoot,
  XhIcon,
} from "@xihan-ui/react";
import { useState } from "react";

export default function Demo(): ReactNode {
  const [status, setStatus] = useState<string>("idle");
  const [lastError, setLastError] = useState("");

  return (
    <>
      {/* timeout 决定“已复制”停留多久，到点自己回落 */}
      <XhClipboardRoot
        value="订单号 A2026-0809-117"
        timeout={2000}
        onStatusChange={details => setStatus(details.status)}
        onCopyError={details => setLastError(String(details.error))}
      >
        <XhClipboardControl>
          <XhClipboardInput />
          <XhClipboardCopyTrigger>
            <XhClipboardIndicator>复制</XhClipboardIndicator>
            <XhClipboardIndicator copied>
              <XhIcon icon={CheckIcon} />
              {" "}
              已复制
            </XhClipboardIndicator>
          </XhClipboardCopyTrigger>
        </XhClipboardControl>
      </XhClipboardRoot>

      <span style={{ fontSize: "13px" }}>
        {\`状态：\${status}\`}
        {lastError ? \` · 上次失败：\${lastError}\` : null}
      </span>
    </>
  );
}
`;export{n as default};
