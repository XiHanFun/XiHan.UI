// 自定义直径与配色 | 三档之外的直径、底色、字色各是一个组件令牌；按人名分配颜色就是逐个实例覆盖
import type { CSSProperties, ReactNode } from "react";
import { XhAvatarFallback, XhAvatarImage, XhAvatarRoot } from "@xihan-ui/react";

const people = [
  { text: "曦", bg: "#fee2e2", fg: "#b91c1c" },
  { text: "寒", bg: "#dcfce7", fg: "#15803d" },
  { text: "懿", bg: "#e0e7ff", fg: "#4338ca" },
  { text: "XH", bg: "#fef3c7", fg: "#b45309" },
];

export default function Demo(): ReactNode {
  return (
    <>
      {/* 直径与字号一起给，回退字才不会在大头像里显小 */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <XhAvatarRoot
          src="/images/logo.png"
          alt="曦寒"
          style={{ "--xh-avatar-size": "56px", "--xh-avatar-font-size": "20px" } as CSSProperties}
        >
          <XhAvatarImage />
          <XhAvatarFallback>曦</XhAvatarFallback>
        </XhAvatarRoot>

        <XhAvatarRoot style={{ "--xh-avatar-size": "56px", "--xh-avatar-font-size": "20px" } as CSSProperties}>
          <XhAvatarImage />
          <XhAvatarFallback>曦寒</XhAvatarFallback>
        </XhAvatarRoot>

        <span style={{ fontSize: "13px" }}>直径 56px</span>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        {people.map(p => (
          <XhAvatarRoot
            key={p.text}
            style={{ "--xh-avatar-bg": p.bg, "--xh-avatar-fg": p.fg } as CSSProperties}
          >
            <XhAvatarImage />
            <XhAvatarFallback>{p.text}</XhAvatarFallback>
          </XhAvatarRoot>
        ))}

        <span style={{ fontSize: "13px" }}>底色与字色逐个给</span>
      </div>
    </>
  );
}
