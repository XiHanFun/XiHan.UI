var e=`// 计时与暂停 | duration 结束后自动退场；指针停在卡片上或焦点进入卡片内都会暂停计时，离开后继续剩余部分；单条卡片也可以单独摆放
import type { ReactNode } from "react";
import {
  XhButton,
  XhNotificationItem,
  XhNotificationItemCloseTrigger,
  XhNotificationItemContent,
  XhNotificationItemIndicator,
  XhNotificationItemTitle,
} from "@xihan-ui/react";
import { useEffect, useRef, useState } from "react";

export default function Demo(): ReactNode {
  const [seq, setSeq] = useState(0);
  const [readout, setReadout] = useState("");
  const board = useRef<HTMLDivElement>(null);

  // 生命周期与暂停态都写在卡片上（data-state / data-paused），照它回显；重新计时会换一张卡片，子树与属性一起盯
  useEffect(() => {
    const el = board.current;
    if (!el) {
      return;
    }
    const paint = (): void => {
      const item = el.querySelector<HTMLElement>("[data-scope='notification'][data-part='item']");
      setReadout(item
        ? \`状态：\${item.dataset.state ?? ""} · \${item.hasAttribute("data-paused") ? "计时已按住" : "计时在走"}\`
        : "");
    };
    const watcher = new MutationObserver(paint);
    watcher.observe(el, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ["data-state", "data-paused"],
    });
    paint();
    return () => watcher.disconnect();
  }, []);

  return (
    <>
      <div ref={board} style={{ display: "grid", width: "100%", gap: "12px", justifyItems: "center" }}>
        <XhNotificationItem
          key={seq}
          preset="toast"
          title="6 秒后自动收走"
          duration={6000}
          translations={{ close: "关闭" }}
        >
          <XhNotificationItemIndicator />
          <XhNotificationItemContent>
            <XhNotificationItemTitle />
          </XhNotificationItemContent>
          <XhNotificationItemCloseTrigger />
        </XhNotificationItem>
        <XhButton size="sm" variant="outline" onClick={() => setSeq(seq + 1)}>重新计时</XhButton>
      </div>
      <span data-demo-output>{readout}</span>
    </>
  );
}
`;export{e as default};