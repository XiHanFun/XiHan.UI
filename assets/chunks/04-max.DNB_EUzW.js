const n=`// 上限与清空 | max 限制每个位置同时显示几条，超出时移除最旧的；dismissAll 直接清空队列，不播退场动画
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
import { useRef } from "react";

const itemTranslations = { close: "关闭" };

export default function Demo(): ReactNode {
  const seq = useRef(0);

  function nextTitle(): string {
    seq.current += 1;
    return \`第 \${seq.current} 条通知\`;
  }

  return (
    <XhNotificationRoot max={3} gap={12} duration={20000}>
      {({ create, dismiss, dismissAll, count }) => (
        <>
          <XhButton
            variant="solid"
            onClick={() => create({ title: nextTitle(), description: "连按几下看最旧的被挤掉" })}
          >
            连着弹
          </XhButton>
          <XhButton variant="ghost" onClick={() => dismissAll()}>全部清空</XhButton>
          <span>{\`队列：\${count} 条（上限 3）\`}</span>

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
