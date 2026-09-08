// 上限与溢出计数 | 摆到上限为止，其余收成一枚「+N」；裁到几枚、N 写多少由作者定，组件只给这一枚身份与位置
import type { ReactNode } from "react";
import { XhAvatarFallback, XhAvatarGroupOverflowItem, XhAvatarGroupRoot, XhAvatarImage, XhAvatarRoot } from "@xihan-ui/react";

const members = ["曦", "寒", "懿", "承", "临", "旭"];
const max = 4;

const shown = members.slice(0, max);
const rest = members.length - shown.length;

export default function Demo(): ReactNode {
  return (
    <XhAvatarGroupRoot max={max}>
      {shown.map(m => (
        <XhAvatarRoot key={m}>
          <XhAvatarImage />
          <XhAvatarFallback>{m}</XhAvatarFallback>
        </XhAvatarRoot>
      ))}

      {/* 计数那一枚没有图，写什么都行 */}
      {rest > 0 && <XhAvatarGroupOverflowItem>{`+${rest}`}</XhAvatarGroupOverflowItem>}
    </XhAvatarGroupRoot>
  );
}
