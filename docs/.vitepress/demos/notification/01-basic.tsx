// 基础用法 | create 入队并返回 id，队列里的每条由作者渲染成一条通知；退场窗口走完只收起不删，宿主在 status-change 里把它移出队列
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

// 存一份放在外面：写在渲染里每渲染一次都是个新对象，白白惊动一轮 props
const itemTranslations = { close: "关闭" };

export default function Demo(): ReactNode {
  return (
    <XhNotificationRoot>
      {({ create, dismiss, count }) => (
        <>
          <XhButton
            variant="solid"
            onClick={() => create({ title: "草稿已保存", description: "内容已同步到云端" })}
          >
            弹一条
          </XhButton>
          <XhButton
            variant="outline"
            onClick={() => create({
              type: "error",
              title: "同步失败",
              description: "网络中断，稍后自动重试",
            })}
          >
            弹一条 error
          </XhButton>
          <span>{`队列：${count} 条`}</span>

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
