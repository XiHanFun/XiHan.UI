// 贴边方向 | side 只落成 data-side，面板压在哪条边由皮肤按这个值决定；root 与 content 报的是同一条边
import type { ReactNode } from "react";
import {
  XhDrawerCloseTrigger,
  XhDrawerContent,
  XhDrawerDescription,
  XhDrawerRoot,
  XhDrawerTitle,
  XhDrawerTrigger,
} from "@xihan-ui/react";

const sides = [
  { value: "left", label: "左侧" },
  { value: "right", label: "右侧" },
  { value: "top", label: "顶部" },
  { value: "bottom", label: "底部" },
] as const;

export default function Demo(): ReactNode {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
      {sides.map(s => (
        <XhDrawerRoot key={s.value} side={s.value} translations={{ close: "关闭" }}>
          {({ side }) => (
            <>
              <XhDrawerTrigger>{s.label}</XhDrawerTrigger>
              <XhDrawerContent>
                <XhDrawerTitle>{`${s.label}抽屉`}</XhDrawerTitle>
                <XhDrawerDescription>
                  {`当前 data-side 是 ${side}。`}
                </XhDrawerDescription>
                <XhDrawerCloseTrigger />
              </XhDrawerContent>
            </>
          )}
        </XhDrawerRoot>
      ))}
    </div>
  );
}
