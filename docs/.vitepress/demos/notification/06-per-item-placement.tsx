// 逐条落位 | 单条通知自带 placement 就盖掉 notification 的默认落位；placements 报出眼下有条目的位置，一个位置一摞
import type { NotificationOptions, NotificationPlacement } from "@xihan-ui/headless";
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

type Create = (options?: NotificationOptions) => string;

const spots = [
  { placement: "top-start", label: "左上" },
  { placement: "top-end", label: "右上" },
  { placement: "bottom", label: "正下" },
] as const;

const itemTranslations = { close: "关闭" };

function pop(create: Create, placement: NotificationPlacement, label: string): void {
  create({
    placement,
    title: `落在${label}`,
    description: "每个位置各排各的队，互不挤占",
  });
}

export default function Demo(): ReactNode {
  return (
    <XhNotificationRoot duration={8000}>
      {({ create, dismiss, placements }) => (
        <>
          {spots.map(spot => (
            <XhButton
              key={spot.placement}
              size="sm"
              variant="outline"
              onClick={() => pop(create, spot.placement, spot.label)}
            >
              {`弹到${spot.label}`}
            </XhButton>
          ))}
          <span>{`眼下有条目的位置：${placements.join("、") || "（无）"}`}</span>

          {/* 一个位置一摞，没有条目的位置不必渲染 */}
          {placements.map(p => (
            <XhNotificationGroup key={p} placement={p}>
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
                  onStatusChange={({ id, status }) => {
                    if (status === "unmounted") {
                      dismiss(id);
                    }
                  }}
                >
                  <XhNotificationItemIndicator />
                  <XhNotificationItemTitle />
                  <XhNotificationItemDescription />
                  <XhNotificationItemCloseTrigger />
                </XhNotificationItem>
              )}
            </XhNotificationGroup>
          ))}
        </>
      )}
    </XhNotificationRoot>
  );
}
