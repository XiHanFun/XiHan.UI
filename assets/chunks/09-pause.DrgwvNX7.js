const t=`// 计时与暂停 | duration 结束后自动退场；指针停在卡片上或焦点进入卡片内都会暂停计时，离开后继续剩余部分；单条卡片也可以单独摆放
import type { ReactNode } from "react";
import {
  XhButton,
  XhNotificationItem,
  XhNotificationItemCloseTrigger,
  XhNotificationItemContent,
  XhNotificationItemIndicator,
  XhNotificationItemTitle,
} from "@xihan-ui/react";
import { useState } from "react";

export default function Demo(): ReactNode {
  const [seq, setSeq] = useState(0);

  return (
    <div style={{ display: "grid", width: "100%", gap: "12px", justifyItems: "center" }}>
      <XhNotificationItem
        key={seq}
        preset="toast"
        title="6 秒后自动收走"
        duration={6000}
        translations={{ close: "关闭" }}
      >
        {({ item }) => (
          <>
            <XhNotificationItemIndicator />
            <XhNotificationItemContent>
              <XhNotificationItemTitle />
              <span style={{ fontSize: "12px", opacity: 0.75 }}>
                {\`状态：\${item.status} · \${item.paused ? "计时已按住" : "计时在走"}\`}
              </span>
            </XhNotificationItemContent>
            <XhNotificationItemCloseTrigger />
          </>
        )}
      </XhNotificationItem>
      <XhButton size="sm" variant="outline" onClick={() => setSeq(seq + 1)}>重新计时</XhButton>
    </div>
  );
}
`;export{t as default};
