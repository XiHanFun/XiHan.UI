const n=`// 基础用法 | create 入队并返回 id，队列中的每条由作者渲染为一条通知；退场动画播完后只收起不删除，宿主在 status-change 中把它移出队列
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
              tone: "danger",
              title: "同步失败",
              description: "网络中断，稍后自动重试",
            })}
          >
            弹一条 danger
          </XhButton>
          <span>{\`队列：\${count} 条\`}</span>

          <XhNotificationGroup>
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
