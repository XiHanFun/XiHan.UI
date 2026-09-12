const t=`// 落位 | placement 决定这一摞贴视口的哪个角，换的只是 group 上的 data-placement，队列本身不动
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

const placements = [
  "top-start",
  "top",
  "top-end",
  "bottom-start",
  "bottom",
  "bottom-end",
] as const;

const itemTranslations = { close: "关闭" };

export default function Demo(): ReactNode {
  const [placement, setPlacement] = useState<(typeof placements)[number]>("top-end");

  return (
    <XhNotificationRoot placement={placement}>
      {({ create, dismiss }) => (
        <>
          {placements.map(p => (
            <XhButton
              key={p}
              size="sm"
              variant={p === placement ? "solid" : "outline"}
              onClick={() => setPlacement(p)}
            >
              {p}
            </XhButton>
          ))}
          <XhButton
            variant="ghost"
            onClick={() => create({ title: "换个角看看", description: \`现在贴在 \${placement}\` })}
          >
            弹一条
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
