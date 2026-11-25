// 落位 | notification 的 placement 决定堆叠缺省贴视口的哪个角，单条通知自带 placement 即覆盖它；placements 报告当前有条目的位置，一个位置一个堆叠
import type { NotificationOptions, NotificationPlacement } from "@xihan-ui/headless";
import type { ReactNode } from "react";
import {
  XhButton,
  XhNotificationGroup,
  XhNotificationItem,
  XhNotificationItemCloseTrigger,
  XhNotificationItemContent,
  XhNotificationItemDescription,
  XhNotificationItemIndicator,
  XhNotificationItemTitle,
  XhNotificationRoot,
} from "@xihan-ui/react";

type Create = (options?: NotificationOptions) => string;

const spots = [
  { placement: "top-start", label: "左上" },
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
    <XhNotificationRoot placement="top-end" duration={8000}>
      {({ create, dismiss, placements }) => (
        <>
          <XhButton
            size="sm"
            variant="outline"
            onClick={() => create({ title: "落在缺省位", description: "没写 placement，取 notification 的 top-end" })}
          >
            按缺省落位
          </XhButton>
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
          <span data-demo-output>{`眼下有条目的位置：${placements.join("、") || "（无）"}`}</span>

          {/* 一个位置一摞，没有条目的位置不必渲染 */}
          {placements.map(p => (
            <XhNotificationGroup key={p} placement={p}>
              {({ item }) => (
                <XhNotificationItem
                  id={item.id}
                  title={item.title}
                  description={item.description}
                  tone={item.tone}
                  loading={item.loading}
                  duration={item.duration}
                  closable={item.closable}
                  translations={itemTranslations}
                  onStatusChange={({ id, status }) => {
                    if (status === "unmounted") {
                      dismiss(id);
                    }
                  }}
                >
                  <XhNotificationItemIndicator />
                  <XhNotificationItemContent>
                    <XhNotificationItemTitle />
                    <XhNotificationItemDescription />
                  </XhNotificationItemContent>
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
