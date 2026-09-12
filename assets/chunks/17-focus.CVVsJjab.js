const e=`// 命令式聚焦 | 触发器就是你写的那个按钮，focus 与 blur 直接调它
import type { ReactNode } from "react";
import {
  XhButton,
  XhSelectContent,
  XhSelectControl,
  XhSelectIndicator,
  XhSelectItem,
  XhSelectItemIndicator,
  XhSelectItemText,
  XhSelectLabel,
  XhSelectList,
  XhSelectPositioner,
  XhSelectRoot,
  XhSelectTrigger,
  XhSelectValueText,
} from "@xihan-ui/react";
import { useRef, useState } from "react";

const levels = [
  { value: "p0", label: "紧急" },
  { value: "p1", label: "高" },
  { value: "p2", label: "普通" },
];

export default function Demo(): ReactNode {
  const [picked, setPicked] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const trigger = useRef<HTMLButtonElement | null>(null);

  // 提交时没选值就把焦点送回触发器
  function submit(): void {
    setSubmitted(true);
    if (picked.length === 0)
      trigger.current?.focus();
  }

  function blurTrigger(): void {
    trigger.current?.blur();
  }

  return (
    <>
      <XhSelectRoot
        value={picked}
        onValueChange={details => setPicked(details.value)}
        placeholder="请选择"
      >
        <XhSelectLabel>优先级</XhSelectLabel>
        <XhSelectControl>
          <XhSelectTrigger ref={trigger}>
            <XhSelectValueText />
            <XhSelectIndicator />
          </XhSelectTrigger>
        </XhSelectControl>
        <XhSelectPositioner>
          <XhSelectContent>
            <XhSelectList>
              {levels.map(l => (
                <XhSelectItem key={l.value} value={l.value}>
                  <XhSelectItemText>{l.label}</XhSelectItemText>
                  <XhSelectItemIndicator />
                </XhSelectItem>
              ))}
            </XhSelectList>
          </XhSelectContent>
        </XhSelectPositioner>
      </XhSelectRoot>
      <div style={{ display: "flex", gap: "8px", marginBlockStart: "8px" }}>
        <XhButton variant="outline" size="sm" onClick={submit}>提交</XhButton>
        <XhButton variant="ghost" size="sm" onClick={blurTrigger}>移开焦点</XhButton>
      </div>
      {submitted && picked.length === 0
        ? (
            <p style={{ color: "var(--xh-fg-danger)" }}>
              还没选优先级，焦点已回到选择器
            </p>
          )
        : null}
    </>
  );
}
`;export{e as default};
