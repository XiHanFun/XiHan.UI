const n=`// 手动收走 | create 返回的就是队列身份 id，存下来随时 dismiss 掉那一条；dismiss 直接移出队列，不走退场窗口
import type { NotificationOptions, ToastStatusChangeDetails } from "@xihan-ui/headless";
import type { ReactNode } from "react";
import {
  XhButton,
  XhNotificationGroup,
  XhNotificationItem,
  XhNotificationItemCloseTrigger,
  XhNotificationItemDescription,
  XhNotificationItemIndicator,
  XhNotificationItemTitle,
  XhNotificationRoot,
} from "@xihan-ui/react";
import { useState } from "react";

type Create = (options?: NotificationOptions) => string;
type Dismiss = (id: string) => void;

const itemTranslations = { close: "关闭" };

export default function Demo(): ReactNode {
  const [pending, setPending] = useState("");

  function start(create: Create): void {
    setPending(create({
      type: "loading",
      title: "正在导出",
      description: "loading 不自动消失，等宿主来收",
    }));
  }

  function finish(dismiss: Dismiss): void {
    if (!pending) {
      return;
    }
    dismiss(pending);
    setPending("");
  }

  // 用户自己按叉关掉时，记下的 id 也要作废
  function settle(details: ToastStatusChangeDetails, dismiss: Dismiss): void {
    if (details.status !== "unmounted") {
      return;
    }
    dismiss(details.id);
    if (details.id === pending) {
      setPending("");
    }
  }

  return (
    <XhNotificationRoot>
      {({ create, dismiss, count }) => (
        <>
          <XhButton variant="solid" disabled={!!pending} onClick={() => start(create)}>
            开始导出
          </XhButton>
          <XhButton variant="outline" disabled={!pending} onClick={() => finish(dismiss)}>
            手动收走
          </XhButton>
          <span>{\`队列：\${count} 条 · 记下的 id：\${pending || "（无）"}\`}</span>

          <XhNotificationGroup>
            {({ item }) => (
              <XhNotificationItem
                id={item.id}
                title={item.title}
                description={item.description}
                type={item.type}
                duration={item.duration}
                removeDelay={item.removeDelay}
                closable={item.closable}
                translations={itemTranslations}
                onStatusChange={details => settle(details, dismiss)}
              >
                <XhNotificationItemIndicator />
                <XhNotificationItemTitle />
                <XhNotificationItemDescription />
                <XhNotificationItemCloseTrigger />
              </XhNotificationItem>
            )}
          </XhNotificationGroup>
        </>
      )}
    </XhNotificationRoot>
  );
}
`;export{n as default};
