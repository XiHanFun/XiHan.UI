const a=`// 基础用法 | 一排叠放的头像：后一枚压在前一枚上，被压住的边由一圈底色分开
import type { ReactNode } from "react";
import { XhAvatarFallback, XhAvatarGroupRoot, XhAvatarImage, XhAvatarRoot } from "@xihan-ui/react";

const members = ["曦", "寒", "懿", "承"];

export default function Demo(): ReactNode {
  return (
    <XhAvatarGroupRoot>
      {members.map(m => (
        <XhAvatarRoot key={m}>
          <XhAvatarImage />
          <XhAvatarFallback>{m}</XhAvatarFallback>
        </XhAvatarRoot>
      ))}
    </XhAvatarGroupRoot>
  );
}
`;export{a as default};
