// 请求在途 | 受控的 pressed 不写回就不会动，在途期间来的意图直接丢掉；忙碌反馈由 aria-busy 与一枚转圈补在按钮上
import type { ReactNode } from "react";
import { XhSpinner, XhToggle } from "@xihan-ui/react";
import { useRef, useState } from "react";

export default function Demo(): ReactNode {
  const [subscribed, setSubscribed] = useState(false);
  const [pending, setPending] = useState(false);
  const pendingRef = useRef(false);

  function onPressedChange(details: { pressed: boolean }): void {
    // 在途期间不写回 pressed，按钮就停在原来的按下态上
    if (pendingRef.current)
      return;
    pendingRef.current = true;
    setPending(true);
    setTimeout(() => {
      setSubscribed(details.pressed);
      pendingRef.current = false;
      setPending(false);
    }, 1200);
  }

  return (
    <>
      {/* aria-disabled 而非 disabled：焦点留得住，读屏也报得出「这颗按不动」 */}
      <XhToggle
        pressed={subscribed}
        variant="outline"
        aria-busy={pending}
        aria-disabled={pending}
        style={{ minInlineSize: "108px" }}
        onPressedChange={onPressedChange}
      >
        {/* 转圈自带活区与名字，「在等什么」由它的 label 念出来 */}
        {pending ? <XhSpinner size="sm" label="正在提交" /> : null}
        {subscribed ? "已订阅" : "订阅"}
      </XhToggle>

      <span style={{ fontSize: "13px" }}>
        {pending ? "请求在飞，这时候再点没有反应" : "点一下，落定要等 1.2 秒"}
      </span>
    </>
  );
}
