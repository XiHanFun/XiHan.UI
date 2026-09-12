const a=`// 形状 | 圆角是一个组件令牌，整圆、圆角方、直角都是同一个槽位换值；图片的圆角从根继承，不用另设
import type { CSSProperties, ReactNode } from "react";
import { XhAvatarFallback, XhAvatarImage, XhAvatarRoot } from "@xihan-ui/react";

export default function Demo(): ReactNode {
  return (
    <>
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <XhAvatarRoot src="/images/logo.png" alt="曦寒">
          <XhAvatarImage />
          <XhAvatarFallback>曦</XhAvatarFallback>
        </XhAvatarRoot>

        <XhAvatarRoot
          src="/images/logo.png"
          alt="曦寒"
          style={{ "--xh-avatar-radius": "var(--xh-radius-md)" } as CSSProperties}
        >
          <XhAvatarImage />
          <XhAvatarFallback>曦</XhAvatarFallback>
        </XhAvatarRoot>

        <XhAvatarRoot
          src="/images/logo.png"
          alt="曦寒"
          style={{ "--xh-avatar-radius": "var(--xh-radius-none)" } as CSSProperties}
        >
          <XhAvatarImage />
          <XhAvatarFallback>曦</XhAvatarFallback>
        </XhAvatarRoot>

        <span style={{ fontSize: "13px" }}>整圆（缺省）/ 圆角方 / 直角</span>
      </div>

      {/* 落回退态时形状一样成立 */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <XhAvatarRoot>
          <XhAvatarImage />
          <XhAvatarFallback>XH</XhAvatarFallback>
        </XhAvatarRoot>

        <XhAvatarRoot style={{ "--xh-avatar-radius": "var(--xh-radius-md)" } as CSSProperties}>
          <XhAvatarImage />
          <XhAvatarFallback>XH</XhAvatarFallback>
        </XhAvatarRoot>

        <XhAvatarRoot style={{ "--xh-avatar-radius": "var(--xh-radius-none)" } as CSSProperties}>
          <XhAvatarImage />
          <XhAvatarFallback>XH</XhAvatarFallback>
        </XhAvatarRoot>
      </div>
    </>
  );
}
`;export{a as default};
