const t=`// 就地改写 | 同一个 id 再 create 一次是原地改写而不是新弹一条，位置不动；loading 不自动消失，换成 success 才开始倒计时
import type { NotificationOptions } from "@xihan-ui/headless";
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
type Update = (id: string, options: Partial<NotificationOptions>) => void;

const itemTranslations = { close: "关闭" };

// 命令由 XhNotificationRoot 的函数式 children 交下来
function startUpload(create: Create, update: Update): void {
  create({
    id: "upload",
    type: "loading",
    title: "正在上传",
    description: "3 个文件排队中",
  });
  // 改一条已经在队列里的
  window.setTimeout(update, 1200, "upload", { description: "已传 2 / 3" });
  // 同一个 id 再 create 一次同样是就地改写
  window.setTimeout(create, 2400, {
    id: "upload",
    type: "success",
    title: "上传完成",
    description: "3 个文件已入库",
  });
}

export default function Demo(): ReactNode {
  return (
    <XhNotificationRoot>
      {({ create, update, dismiss }) => (
        <>
          <XhButton variant="solid" onClick={() => startUpload(create, update)}>
            上传（loading → success）
          </XhButton>

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
        </>
      )}
    </XhNotificationRoot>
  );
}
`;export{t as default};
