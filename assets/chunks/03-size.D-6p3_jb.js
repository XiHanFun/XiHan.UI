const a=`// 尺寸 | 直径、字号与叠放量在组上写一次，沿自定义属性下发给组内每个头像，「+N」随之更换
import type { ReactNode } from "react";
import { XhAvatarFallback, XhAvatarGroupOverflowItem, XhAvatarGroupRoot, XhAvatarRoot } from "@xihan-ui/react";

const sizes = ["sm", "md", "lg"] as const;
const shown = ["曦", "寒", "懿"];

export default function Demo(): ReactNode {
  return (
    <div style={{ display: "grid", gap: "16px", justifyItems: "start" }}>
      {sizes.map(s => (
        <XhAvatarGroupRoot key={s} size={s} max={3}>
          {shown.map(m => (
            <XhAvatarRoot key={m}>
              <XhAvatarFallback>{m}</XhAvatarFallback>
            </XhAvatarRoot>
          ))}
          <XhAvatarGroupOverflowItem>+3</XhAvatarGroupOverflowItem>
        </XhAvatarGroupRoot>
      ))}
    </div>
  );
}
`;export{a as default};
