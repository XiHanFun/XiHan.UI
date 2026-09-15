// 使用者令牌 | 直径、叠放量、分隔用的底色都保留了槽位，写在组上即整组更换
import type { CSSProperties, ReactNode } from "react";
import { XhAvatarFallback, XhAvatarGroupOverflowItem, XhAvatarGroupRoot, XhAvatarRoot } from "@xihan-ui/react";

const shown = ["曦", "寒", "懿", "承"];

// 方头像、叠得更深、计数那一枚也跟着换形状
const tokens = {
  "--xh-avatar-group-size": "34px",
  "--xh-avatar-group-overlap": "14px",
  "--xh-avatar-group-radius": "var(--xh-radius-md)",
  "--xh-avatar-radius": "var(--xh-radius-md)",
} as CSSProperties;

export default function Demo(): ReactNode {
  return (
    <XhAvatarGroupRoot max={4} style={tokens}>
      {shown.map(m => (
        <XhAvatarRoot key={m}>
          <XhAvatarFallback>{m}</XhAvatarFallback>
        </XhAvatarRoot>
      ))}
      <XhAvatarGroupOverflowItem>+2</XhAvatarGroupOverflowItem>
    </XhAvatarGroupRoot>
  );
}
