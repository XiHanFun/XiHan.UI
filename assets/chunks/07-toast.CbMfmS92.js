var e=`// 轻提示预设 | preset="toast" 换成一句话的轻提示：落底部居中、最多 3 条、叠成一摞，鼠标或焦点进入即展开；卡片要把队列交下来的 preset 带上
import type { NotificationOptions } from "@xihan-ui/headless";
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

const itemTranslations = { close: "关闭" };

type Create = (options?: NotificationOptions) => string;
type Update = (id: string, options: Partial<NotificationOptions>) => void;

// 加载中不自动消失，落定成 success 后才开始计时
function save(create: Create, update: Update): void {
  const id = create({ loading: true, title: "保存中" });
  window.setTimeout(update, 900, id, { loading: false, tone: "success", title: "已保存" });
}

export default function Demo(): ReactNode {
  return (
    <XhNotificationRoot preset="toast">
      {({ create, update, dismiss }) => (
        <>
          <XhButton variant="solid" onClick={() => save(create, update)}>保存</XhButton>
          <XhButton variant="outline" onClick={() => create({ tone: "success", title: "已发布" })}>success</XhButton>
          <XhButton variant="outline" onClick={() => create({ tone: "warning", title: "配额即将用尽" })}>warning</XhButton>
          <XhButton variant="outline" onClick={() => create({ tone: "danger", title: "同步失败" })}>danger</XhButton>

          <XhNotificationGroup>
            {({ item }) => (
              <XhNotificationItem
                id={item.id}
                preset={item.preset}
                title={item.title}
                description={item.description}
                tone={item.tone}
                loading={item.loading}
                duration={item.duration}
                closable={item.closable}
                pauseOnPageIdle={item.pauseOnPageIdle}
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
        </>
      )}
    </XhNotificationRoot>
  );
}
`;export{e as default};