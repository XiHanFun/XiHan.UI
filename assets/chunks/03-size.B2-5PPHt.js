const a=`// 尺寸 | 直径、字号与叠放量在组上写一次，沿自定义属性流给组内每一枚，「+N」跟着一起换
import type { ReactNode } from "react";
import { XhAvatarFallback, XhAvatarGroupOverflowItem, XhAvatarGroupRoot, XhAvatarImage, XhAvatarRoot } from "@xihan-ui/react";

const sizes = ["sm", "md", "lg"] as const;
const shown = ["曦", "寒", "懿"];

export default function Demo(): ReactNode {
  return (
    <div style={{ display: "grid", gap: "16px", justifyItems: "start" }}>
      {sizes.map(s => (
        <XhAvatarGroupRoot key={s} size={s} max={3}>
          {shown.map(m => (
            <XhAvatarRoot key={m}>
              <XhAvatarImage />
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
