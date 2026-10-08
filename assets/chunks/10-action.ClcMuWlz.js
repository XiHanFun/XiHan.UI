var e=`// 操作按钮 | item-action-trigger 按下时先发 action 事件，再使该条进入退场；破坏性操作配“撤销”优于事前确认
import type { ReactNode } from "react";
import {
  XhButton,
  XhNotificationItem,
  XhNotificationItemActionTrigger,
  XhNotificationItemCloseTrigger,
  XhNotificationItemContent,
  XhNotificationItemIndicator,
  XhNotificationItemTitle,
} from "@xihan-ui/react";
import { useState } from "react";

export default function Demo(): ReactNode {
  const [seq, setSeq] = useState(0);
  const [log, setLog] = useState("（还没点）");

  function onAction(details: { id: string }): void {
    setLog(\`撤销了：\${details.id}\`);
  }

  return (
    <div style={{ display: "grid", width: "100%", gap: "12px", justifyItems: "center" }}>
      <XhNotificationItem
        id="notification-demo-action"
        key={seq}
        preset="toast"
        title="已删除 1 个文件"
        duration={0}
        translations={{ close: "关闭" }}
        onAction={onAction}
      >
        <XhNotificationItemIndicator />
        <XhNotificationItemContent><XhNotificationItemTitle /></XhNotificationItemContent>
        <XhNotificationItemActionTrigger>撤销</XhNotificationItemActionTrigger>
        <XhNotificationItemCloseTrigger />
      </XhNotificationItem>
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <XhButton size="sm" variant="outline" onClick={() => setSeq(seq + 1)}>再挂一条</XhButton>
        <span>{log}</span>
      </div>
    </div>
  );
}
`;export{e as default};