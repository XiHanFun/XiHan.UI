// 上限与溢出计数 | 放置到上限为止，其余收为一个「+N」；截到几个、N 写多少由作者决定，组件只提供该项的身份与位置
import type { ReactNode } from "react";
import { XhAvatarFallback, XhAvatarGroupOverflowItem, XhAvatarGroupRoot, XhAvatarRoot } from "@xihan-ui/react";

const members = ["曦", "寒", "懿", "承", "临", "旭"];
const max = 4;

const shown = members.slice(0, max);
const rest = members.length - shown.length;

export default function Demo(): ReactNode {
  return (
    <XhAvatarGroupRoot max={max}>
      {shown.map(m => (
        <XhAvatarRoot key={m}>
          <XhAvatarFallback>{m}</XhAvatarFallback>
        </XhAvatarRoot>
      ))}

      {/* 计数那一枚没有图，写什么都行 */}
      {rest > 0 && <XhAvatarGroupOverflowItem>{`+${rest}`}</XhAvatarGroupOverflowItem>}
    </XhAvatarGroupRoot>
  );
}
